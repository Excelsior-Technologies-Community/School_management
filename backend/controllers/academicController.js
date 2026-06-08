const { BranchModel, SubjectModel } = require('../models/academicModel');

// branch controllers
const getBranches = async (req, res) => {
    try {
        const branches = await BranchModel.getAll(req.user.school_id);
        return res.status(200).json({ success: true, data: branches });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const createBranch = async (req, res) => {
    try {
        const { branch_name, address, status } = req.body;
        if (!branch_name) {
            return res.status(400).json({ success: false, message: 'Branch name is required.' })
        }
        const newBranch = await BranchModel.create(req.user.school_id, { branch_name, address, status });
        return res.status(201).json({ success: true, message: 'Branch created successfully.', data: newBranch });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const { branch_name, address, status } = req.body;

        const exists = await BranchModel.getById(id);
        if (!exists) return res.status(400).json({ success: false, message: 'Branch not found.' });

        const updated = await BranchModel.update(id, { branch_name, address, status });
        return res.status(200).json({ success: true, message: 'Branch updated successfully.', data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const toggleBranchStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await BranchModel.toggleStatus(id);
        return res.status(200).json({ success: true, message: 'Branch status toggled successfully.', data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;
        await BranchModel.delete(id);
        return res.status(200).json({ success: true, message: 'Branch dropped successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// subject controllers
const getSubjects = async (req, res) => {
    try {
        const subjects = await SubjectModel.getAll(req.user.school_id);
        return res.status(200).json({ success: true, data: subjects });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const createSubject = async (req, res) => {
    try {
        const { subject_name, subject_code, status } = req.body;
        if (!subject_name) {
            return res.status(400).json({ success: false, message: 'Subject name is required.' })
        }
        const newSubject = await SubjectModel.create(req.user.school_id, { subject_name, subject_code, status });
        return res.status(201).json({ success: true, message: 'Subject created successfully.', data: newSubject });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const { subject_name, subject_code, status } = req.body;

        const exists = await SubjectModel.getById(id);
        if (!exists) return res.status(400).json({ success: false, message: 'Subject not found.' });

        const updated = await SubjectModel.update(id, { subject_name, subject_code, status });
        return res.status(200).json({ success: true, message: 'Subject updated successfully.', data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const toggleSubjectStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await SubjectModel.toggleStatus(id);
        return res.status(200).json({ success: true, message: 'Subject status toggled successfully.', data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        await SubjectModel.delete(id);
        return res.status(200).json({ success: true, message: 'Subject dropped successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    getBranches, createBranch, updateBranch, toggleBranchStatus, deleteBranch,
    getSubjects, createSubject, updateSubject, toggleSubjectStatus, deleteSubject
};