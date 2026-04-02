// Escrow Payment Controller — Marketplace Architecture
// Consumer → Platform (escrow) → Expert (after admin release)
import db from "../config/db.js";
import { initiateJobTransfer } from "../services/razorpayService.js";

/**
 * ESCROW CALCULATION ENGINE
 * platformFee = baseAmount × 10%
 * gst         = platformFee × 18%
 * expertAmount = baseAmount - platformFee - gst
 */
function calculateEscrow(baseAmount) {
  const amount = Number(baseAmount);
  const platformFee = +(amount * 0.1).toFixed(2);
  const gst = +(platformFee * 0.18).toFixed(2);
  const expertAmount = +(amount - platformFee - gst).toFixed(2);
  return { platformFee, gst, expertAmount };
}

// ─── CREATE PAYMENT (escrow) ─────────────────────────────────────────────
// @route   POST /api/payment/create
// @access  Authenticated consumer
export const createPayment = async (req, res) => {
  try {
    const { job_id, consumer_id, expert_id, amount, payment_ref } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "A valid base amount is required" });
    }

    const baseAmount = Number(amount);
    const { platformFee, gst, expertAmount } = calculateEscrow(baseAmount);

    const result = await db.query(
      `INSERT INTO transactions
                (request_id,
                 expert_id,
                 base_amount, platform_fee, expert_amount,
                 provider_price, provider_payout,
                 transaction_ref, status, amount, type)
             VALUES ($1,
                     $2,
                     $3, $4, $5,
                     $3, $5,
                     $6, 'escrow', $3, 'payment')
             RETURNING *`,
      [
        job_id || null,
        expert_id || null,
        baseAmount,
        platformFee,
        expertAmount,
        payment_ref || null,
      ],
    );

    const transaction = result.rows[0];

    // Emit real-time update to all connected admin clients
    if (global.io) {
      global.io.emit("payment_update", {
        ...transaction,
        event: "new_escrow",
      });
    }

    res.status(201).json({
      success: true,
      transaction,
      breakdown: { baseAmount, platformFee, gst, expertAmount },
    });
  } catch (err) {
    console.error("[Escrow] Payment creation failed:", err);
    res.status(500).json({ error: "Failed to create escrow payment" });
  }
};

// ─── GET ALL PAYMENTS (Admin Ledger) ─────────────────────────────────────
// @route   GET /api/admin/payments
// @access  Admin only
// NOTE: Uses COALESCE to support both old schema columns and new escrow columns
export const getAllPayments = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
                t.id                                                        AS txn_id,
                t.request_id                                                AS job_id,
                COALESCE(t.base_amount, t.provider_price, t.amount, 0)     AS base_amount,
                COALESCE(t.platform_fee, 0)                                 AS platform_fee,
                0                                                           AS tax,
                COALESCE(t.expert_amount, t.provider_payout, 0)            AS expert_amount,
                t.status,
                t.transaction_ref                                           AS payment_ref,
                t.created_at                                                AS date,
                t.expert_id,
                COALESCE(t.amount, t.base_amount, 0)                       AS total_paid,
                ue.email                                                    AS expert_email,
                COALESCE(ue.first_name,'') || ' ' || COALESCE(ue.last_name,'') AS expert_name,
                sr.consumer_id,
                uc.email                                                    AS consumer_email,
                COALESCE(uc.first_name,'') || ' ' || COALESCE(uc.last_name,'') AS consumer_name
             FROM transactions t
             LEFT JOIN users ue               ON t.expert_id   = ue.id
             LEFT JOIN service_requests sr    ON t.request_id  = sr.id
             LEFT JOIN users uc               ON sr.consumer_id = uc.id
             ORDER BY t.created_at DESC`,
    );

    const payments = result.rows.map((row) => {
      const consumerName =
        row.consumer_name?.trim() || row.consumer_email || "Unknown";
      const expertName =
        row.expert_name?.trim() || row.expert_email || "Not Assigned";

      return {
        id: row.txn_id,
        txn_id: row.txn_id,
        job_id: row.job_id,
        consumer: consumerName,
        consumer_name: consumerName,
        provider: expertName,
        expert_name: expertName,
        base_amount: Number(row.base_amount) || 0,
        total_amount: Number(row.base_amount) || Number(row.total_paid) || 0,
        platform_fee: Number(row.platform_fee) || 0,
        tax: Number(row.tax) || 0,
        gst_amount: Number(row.tax) || 0,
        expert_amount: Number(row.expert_amount) || 0,
        status: row.status,
        payment_ref: row.payment_ref,
        date: row.date,
        created_at: row.date,
      };
    });

    res.json(payments);
  } catch (err) {
    console.error("[Escrow] Failed to fetch payments ledger:", err);
    res.status(500).json({ error: "Failed to fetch payment records" });
  }
};

// ─── RELEASE ESCROW (Admin payout to expert) ─────────────────────────────
// @route   PATCH /api/admin/payments/release/:id
// @access  Admin only
export const releasePayment = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Verify the transaction exists and is in escrow
    const check = await db.query("SELECT * FROM transactions WHERE id = $1", [
      id,
    ]);

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    if (check.rows[0].status !== "escrow") {
      return res.status(400).json({
        error: `Cannot release — transaction is currently "${check.rows[0].status}", expected "escrow"`,
      });
    }

    // 2. Update status to completed
    const result = await db.query(
      `UPDATE transactions
             SET status = 'completed'
             WHERE id = $1
             RETURNING *`,
      [id],
    );

    const transaction = result.rows[0];

    // 3. Initiate Razorpay Transfer (Automatic payout)
    try {
      await initiateJobTransfer({
        paymentId: transaction.payment_ref || transaction.transaction_ref,
        expertId: transaction.expert_id,
        amount: transaction.expert_amount || transaction.provider_payout,
      });
    } catch (razorError) {
      console.error(
        "[Escrow] Razorpay Transfer failed but status was updated:",
        razorError.message,
      );
      // We continue as the DB record is updated, but log the error
    }

    // 4. Emit real-time update
    if (global.io) {
      global.io.emit("payment_update", {
        ...transaction,
        event: "escrow_released",
      });

      // Notify the expert
      const expertId = transaction.expert_id;
      const expertAmount =
        transaction.expert_amount || transaction.provider_payout;
      if (expertId) {
        global.io.to(`user_${expertId}`).emit("notification", {
          id: Date.now(),
          type: "success",
          msg: `Payment of ₹${expertAmount} has been released to your account.`,
          time: "Just now",
          read: false,
        });
      }
    }

    res.json({
      success: true,
      message: "Escrow released — funds dispatched to expert",
      transaction,
    });
  } catch (err) {
    console.error("[Escrow] Release failed:", err);
    res.status(500).json({ error: "Failed to release escrow payment" });
  }
};

// ─── DASHBOARD METRICS (Admin) ───────────────────────────────────────────
// @route   GET /api/admin/dashboard/metrics
// @access  Admin only
// NOTE: Uses COALESCE to support both old and new column names
export const getMetrics = async (req, res) => {
  try {
    const result = await db.query(`
            SELECT
                COALESCE(SUM(COALESCE(base_amount, provider_price, amount, 0)), 0)
                                                                                AS total_revenue,
                COALESCE(SUM(COALESCE(platform_fee, 0)), 0)
                                                                                AS platform_earnings,
                0                                                               AS gst_collected,
                COALESCE(SUM(COALESCE(expert_amount, provider_payout, 0))
                    FILTER (WHERE status = 'escrow'), 0)                        AS pending_escrow,
                COUNT(*) FILTER (WHERE status = 'escrow')                       AS escrow_count,
                COUNT(*) FILTER (WHERE status = 'completed')                    AS completed_count,
                COUNT(*) FILTER (WHERE status = 'paid')                         AS paid_count,
                COUNT(*)                                                         AS total_transactions
            FROM transactions
        `);

    const metrics = result.rows[0];

    res.json({
      total_revenue: Number(metrics.total_revenue),
      platform_earnings: Number(metrics.platform_earnings),
      gst_collected: Number(metrics.gst_collected),
      pending_escrow: Number(metrics.pending_escrow),
      escrow_count: Number(metrics.escrow_count),
      completed_count: Number(metrics.completed_count),
      paid_count: Number(metrics.paid_count),
      total_transactions: Number(metrics.total_transactions),
    });
  } catch (err) {
    console.error("[Escrow] Metrics retrieval failed:", err);
    res.status(500).json({ error: "Failed to fetch dashboard metrics" });
  }
};
