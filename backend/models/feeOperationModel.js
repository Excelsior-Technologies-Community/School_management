const db = require('../config/db');

const FeeOperationModel = {
    generateInstallments: async (studentId, feeStructureId, createdBy) => {
        const [rows] = await db.query(
            'CALL sp_GenerateStudentInstallments(?, ?, ?)',
            [studentId, feeStructureId, createdBy]
        );
        return rows[0][0];
    },

    generateBatchInstallments: async (batchId, feeStructureId, createdBy) => {
        const [rows] = await db.query(
            'CALL sp_GenerateBatchFees(?,?,?)',
            [batchId, feeStructureId, createdBy]
        );
        return rows[0][0];
    },

    applyDiscount: async (discountData) => {
        const [rows] = await db.query(
            'CALL sp_ApplyFeeDiscount(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                discountData.student_id,
                discountData.fee_structure_id,
                discountData.installment_id || null,
                discountData.component_id || null,
                discountData.discount_type,
                discountData.discount_value,
                discountData.is_installment_specific ? 1 : 0,
                discountData.valid_from,
                discountData.valid_to,
                discountData.created_by
            ]
        );
        return rows[0][0];
    },

    processPayment: async (paymentData) => {
        const [rows] = await db.query(
            'CALL sp_ProcessFeePayment(?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ',
            [
                paymentData.student_id,
                paymentData.fee_structure_id,
                paymentData.installment_id,
                paymentData.paid_amount,
                paymentData.late_fee || 0.00,
                paymentData.payment_mode,
                paymentData.transaction_id || null,
                paymentData.receipt_url || null,
                paymentData.deposited_to_school_bank_id || null,
                paymentData.created_by
            ]
        );
        return rows[0][0];
    },

    updateDiscount: async (discountData) => {
        const [rows] = await db.query(
            'CALL sp_UpdateFeeDiscount(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                discountData.fee_discount_id,
                discountData.student_id,
                discountData.installment_id,
                discountData.component_id || null,
                discountData.discount_type,
                discountData.discount_value,
                discountData.is_installment_specific ? 1 : 0,
                discountData.valid_from,
                discountData.valid_to,
                discountData.updated_by
            ]
        );
        return rows[0][0];
    },

    updatePayment: async (paymentData) => {
        const [rows] = await db.query(
            'CALL sp_UpdatePaymentDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                paymentData.fee_payment_id,
                paymentData.installment_id,
                paymentData.student_id,
                paymentData.paid_amount,
                paymentData.late_fee || 0.00,
                paymentData.payment_mode,
                paymentData.transaction_id || null,
                paymentData.payment_status || 'Successful',
                paymentData.receipt_url || null,
                paymentData.deposited_to_school_bank_id || null,
                paymentData.updated_by
            ]
        );
        return rows[0][0];
    },

    getStudentFee: async (studentId) => {
        const [rows] = await db.query('CALL sp_GetStudentFeeStatement(?)', [studentId]);
        return rows[0];
    },

    getFeeTrackingDashboard: async (filters) => {
        const [rows] = await db.query(
            'CALL sp_GetSchoolFeeTrackingDashboard(?, ?, ?, ?, ?, ?)',
            [
                filters.fee_structure_id || null,
                filters.batch_id || null,
                filters.installment_status || null,
                filters.search_query || null,
                parseInt(filters.limit) || 20,
                parseInt(filters.offset) || 0
            ]
        );
        return rows[0];
    }
};

module.exports = FeeOperationModel;