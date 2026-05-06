import db from '../config/db.js';
import { createNotification } from '../controllers/notificationController.js';

export async function releaseMaturedHolds() {
  const due = await db.query(
    `SELECT * FROM transactions
     WHERE status = 'partial_released'
       AND hold_release_at <= NOW()
       AND hold_amount > 0`
  );
  for (const txn of due.rows) {
    try {
      await db.query(
        `UPDATE expert_wallets
         SET balance = balance + $1,
             pending_balance = GREATEST(0, pending_balance - $1),
             updated_at = NOW()
         WHERE expert_id = $2`,
        [txn.hold_amount, txn.expert_id]
      );
      await db.query(
        `UPDATE transactions SET status = 'completed', hold_amount = 0 WHERE id = $1`,
        [txn.id]
      );
      await createNotification(
        txn.expert_id, '💰 Remaining 50% Released!',
        `₹${txn.hold_amount} from your 7-day hold is now in your wallet.`,
        'payment', null
      );
      if (global.io) {
        global.io.to(`user_${txn.expert_id}`).emit('escrow_released', {
          amount: txn.hold_amount,
          message: `₹${txn.hold_amount} hold released.`
        });
      }
    } catch (err) {
      console.error(`[HoldRelease] Failed for txn ${txn.id}:`, err);
    }
  }
}
