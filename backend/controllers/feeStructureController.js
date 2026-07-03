const FeeStructureModel = require('../models/feeStructureModel');

const createFeeStructure = async (req, res) => {
    try {
        const {
            batch_id,
            academic_year_id,
            total_amount,
            due_date,
            late_fee_rules,
            payment_type,
            no_of_installments,
            status,
            components
        } = req.body;

        const school_id = req.user.school_id;
        const created_by = req.user.id;

        if (!components || !Array.isArray(components) || components.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Fee structure must contain at least one component item breakdown."
            });
        }

        const result = await FeeStructureModel.createWithComponents(
            {
                school_id,
                batch_id,
                academic_year_id,
                total_amount,
                due_date,
                late_fee_rules: late_fee_rules || null,
                payment_type,
                no_of_installments: no_of_installments || 1,
                status: status || 'Active',
                created_by
            },
            components
        );

        return res.status(201).json({
            success: true,
            message: "Fee structure with master-detail components created successfully.",
            data: result
        });

    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const getAllFeeStructures = async (req, res) => {
    try {
        const school_id = req.user.school_id;
        const { academic_year_id } = req.query;

        const data = await FeeStructureModel.getAll(school_id, academic_year_id || null)
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const getFeeStructureById = async (req, res) => {
    try {
        const { id } = req.params;
        const school_id = req.user.school_id;

        const data = await FeeStructureModel.getById(id, school_id);
        if (!data.structure) {
            return res.status(404).json({ success: false, message: "Fee structure not found." })
        }

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const updateFeeStructure = async (req, res) => {
    try {
        const { id } = req.params;
        const school_id = req.user.school_id;
        const updated_by = req.user.id;

        const { batch_id, academic_year_id, total_amount, due_date, late_fee_rules, payment_type, no_of_installments, status, components } = req.body;

        if (!components || !Array.isArray(components) || components.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Fee structure must contain at least one component item breakdown."
            })
        }

        await FeeStructureModel.updateWithComponents(
            id,
            school_id,
            {
                batch_id,
                academic_year_id,
                total_amount,
                due_date,
                late_fee_rules: late_fee_rules || null,
                payment_type,
                no_of_installments: no_of_installments,
                status: status,
                updated_by
            },
            components
        );

        return res.status(200).json({ success: true, message: "Fee structure and components updated successfully." })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const deleteFeeStructure = async (req, res) => {
    try {
        const { id } = req.params;
        const school_id = req.user.school_id;

        await FeeStructureModel.delete(id, school_id);
        return res.status(200).json({ success: true, message: "Fee structure deleted successfully." })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

module.exports = { createFeeStructure, getAllFeeStructures, getFeeStructureById, updateFeeStructure, deleteFeeStructure };