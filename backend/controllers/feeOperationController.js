const FeeOperationModel = require('../models/feeOperationModel');
const cloudinary = require('../config/cloudinary')
const fs = require('fs');

const generateStudentInstallments = async (req, res) => {
    try {
        const { student_id, fee_structure_id } = req.body;
        const created_by = req.user.id;

        if (!student_id || !fee_structure_id) {
            return res.status(400).json({ success: false, message: 'Missing required assignment properties.' });
        }

        const result = await FeeOperationModel.generateInstallments(student_id, fee_structure_id, created_by);

        if (result.status === 'error') {
            return res.status(400).json({ success: false, message: result.message });
        }

        return res.status(201).json({ success: true, message: result.message });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error processing allocation.' });
    }
};

const applyFeeDiscount = async (req, res) => {
    try {
        const discountPayload = {
            ...req.body,
            created_by: req.user.id
        };

        const result = await FeeOperationModel.applyDiscount(discountPayload);
        return res.status(200).json({ success: true, message: result.message || 'Discount processed.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal system failure registering discount.' });
    }
};

const processFeePayment = async (req, res) => {
    let localFilePath = null;
    try {
        const paymentPayload = { ...req.body };
        paymentPayload.created_by = req.user.id;
        let uploadedReceiptUrl = null;

        if (req.file) {
            localFilePath = req.file.path;

            const cloudinaryResult = await cloudinary.uploader.upload(localFilePath, {
                folder: 'school_receipts',
                resource_type: 'auto'
            });

            uploadedReceiptUrl = cloudinaryResult.secure_url;

            fs.unlinkSync(localFilePath);
            localFilePath = null;
        }

        paymentPayload.receipt_url = uploadedReceiptUrl;

        const result = await FeeOperationModel.processPayment(paymentPayload);

        if (result.status === 'error') {
            return res.status(400).json({ success: false, message: result.message });
        }

        return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return res.status(500).json({ success: false, message: 'Transaction execution failure.' });
    }
};

const generateBatchInstallments = async (req, res) => {
    try {
        const { batch_id, fee_structure_id } = req.body;
        const created_by = req.user.id;

        if (!batch_id || !fee_structure_id) {
            return res.status(400).json({ success: false, message: 'Missing batch_id or fee_structure_id.' });
        }

        const result = await FeeOperationModel.generateBatchInstallments(batch_id, fee_structure_id, created_by);

        if (result.status === 'error') {
            return res.status(400).json({ success: false, message: result.message });
        }

        return res.status(201).json({ success: true, message: result.message });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error processing batch fee allocation.' });
    }
};

const updateFeeDiscount = async (req, res) => {
    try {
        const discountPayload = {
            ...req.body,
            updated_by: req.user.id
        };

        const result = await FeeOperationModel.updateDiscount(discountPayload);

        if (result.status === 'error') {
            return res.status(400).json({ success: false, message: result.message });
        }

        return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const updateFeePayment = async (req, res) => {
    let localFilePath = null;
    try {
        const paymentPayload = { ...req.body };
        paymentPayload.updated_by = req.user.id;

        if (req.file) {
            localFilePath = req.file.path;
            const cloudinaryResult = await cloudinary.uploader.upload(localFilePath, {
                folder: 'school_receipts',
                resource_type: 'auto'
            });
            paymentPayload.receipt_url = cloudinaryResult.secure_url;

            fs.unlinkSync(localFilePath);
            localFilePath = null;
        }

        const result = await FeeOperationModel.updatePayment(paymentPayload);

        if (result.status === 'error') {
            return res.status(400).json({ success: false, message: result.message });
        }
        return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const getStudentFeeDetails = async (req, res) => {
    try {
        const student_id = req.user.id;
        const data = await FeeOperationModel.getStudentFee(student_id);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { generateStudentInstallments, applyFeeDiscount, processFeePayment, generateBatchInstallments, updateFeeDiscount, updateFeePayment, getStudentFeeDetails }