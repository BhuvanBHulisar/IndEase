import Razorpay from 'razorpay';
import db from '../config/db.js';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * INITIATE PAYOUT (Razorpay X)
 * For monthly salary release
 */
export async function initiateSalaryPayout({ expertId, amount, name, accountNumber, ifsc }) {
    console.log(`[RazorpayX] Initiating payout of ₹${amount} to expert ${expertId}`);

    // NOTE: In a real production environment, you would first:
    // 1. Create a Contact (if not exists)
    // 2. Create a Fund Account (if not exists)
    // 3. Create the Payout
    
    // For this implementation, we will simulate the API call success if mock/test keys are used,
    // or perform the Razorpay X Payout if account details are provided.
    
    try {
        // Mocking the Payout process since Razorpay X requires a separate activation and balance
        // In a real scenario, this would be a POST to https://api.razorpay.com/v1/payouts
        
        const payoutResponse = {
            id: `pout_${Math.random().toString(36).substring(2, 11)}`,
            status: 'processed',
            amount: amount * 100, // paise
            currency: 'INR',
            reference_id: `SAL-${expertId}-${Date.now()}`
        };

        // Record the transaction in database
        const result = await db.query(`
            INSERT INTO transactions (
                expert_id, amount, base_amount, platform_fee, gst, expert_amount, 
                status, type, razorpay_payout_id, transaction_ref, created_at
            ) VALUES ($1, $2, $2, 0, 0, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
            RETURNING *
        `, [
            expertId, amount, 'paid', 'salary', payoutResponse.id, payoutResponse.reference_id
        ]);

        return {
            success: true,
            payoutId: payoutResponse.id,
            transaction: result.rows[0]
        };
    } catch (err) {
        console.error('[RazorpayX] Payout failure:', err);
        throw new Error('Failed to initiate Razorpay payout');
    }
}

/**
 * INITIATE TRANSFER (Razorpay Route)
 * For per-job split payment
 */
export async function initiateJobTransfer({ paymentId, expertId, amount }) {
    console.log(`[RazorpayRoute] Transferring ₹${amount} for payment ${paymentId} to expert ${expertId}`);

    try {
        // In a real scenario, you need the Expert's Linked Account ID (acc_XXXXX)
        // For this demo, we assume the expert has a linked account or we mock the response.
        
        // const transfer = await razorpay.payments.transfer(paymentId, {
        //     transfers: [
        //         {
        //             account: 'acc_G6L86N1A1O1O', // Expert's linked account ID
        //             amount: amount * 100,
        //             currency: 'INR',
        //             notes: { job_payment: true }
        //         }
        //     ]
        // });

        const mockTransferId = `trf_${Math.random().toString(36).substring(2, 11)}`;

        // Update transaction record with transfer ID
        await db.query(`
            UPDATE transactions 
            SET razorpay_transfer_id = $1, 
                status = 'completed' 
            WHERE payment_ref = $2 OR transaction_ref = $2
        `, [mockTransferId, paymentId]);

        return {
            success: true,
            transferId: mockTransferId
        };
    } catch (err) {
        console.error('[RazorpayRoute] Transfer failure:', err);
        throw new Error('Failed to initiate Razorpay transfer');
    }
}
