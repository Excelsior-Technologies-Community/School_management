const { MasterMediumModel, SchoolMediumModel } = require('../models/mediumModel');

// Master Medium Controllers
const getMasterMediums = async (req, res) => {
    try {
        const mediums = await MasterMediumModel.getAll();
        return res.status(200).json({ success: true, data: mediums });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const getPendingMasterMediumRequests = async (req, res) => {
    try {
        let requests = await MasterMediumModel.getPendingRequests();

        if (requests && Array.isArray(requests[0]) && typeof requests[0][0] === 'object') {
            requests = requests[0];
        }

        return res.status(200).json({ success: true, data: Array.isArray(requests) ? requests : [] });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const createMasterMedium = async (req, res) => {
    try {
        const { medium_name, description } = req.body;
        if (!medium_name) {
            return res.status(400).json({ success: false, message: 'Medium name is required.' });
        }
        const newMedium = await MasterMediumModel.create(req.user.id, { medium_name, description });
        return res.status(201).json({ success: true, message: 'Master medium created successfully.', data: newMedium });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const updateMasterMedium = async (req, res) => {
    try {
        const { id } = req.params;
        const { medium_name, description } = req.body;

        const exists = await MasterMediumModel.getById(id);
        if (!exists) return res.status(404).json({ success: false, message: 'Master medium not found.' });

        const updatedMedium = await MasterMediumModel.update(id, req.user.id, { medium_name, description });
        return res.status(200).json({ success: true, message: 'Master medium updated successfully.', data: updatedMedium });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const toggleMasterMediumStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await MasterMediumModel.toggleStatus(id, req.user.id);
        return res.status(200).json({ success: true, message: 'Master medium status toggled successfully.', data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const deleteMasterMedium = async (req, res) => {
    try {
        const { id } = req.params;
        await MasterMediumModel.delete(id, req.user.id);
        return res.status(200).json({ success: true, message: 'Master medium dropped successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const reviewSchoolMediumRequest = async (req, res) => {
    try {
        const { master_medium_id, review_status } = req.body;

        if (!master_medium_id || !review_status) {
            return res.status(400).json({ success: false, message: 'Master medium ID and review status are required.' });
        }

        if (!['approved', 'rejected'].includes(review_status)) {
            return res.status(400).json({ success: false, message: 'Invalid status. Use approved or rejected.' });
        }

        const result = await MasterMediumModel.reviewRequest(master_medium_id, review_status, req.user.id);

        const customMessage = review_status === 'rejected'
            ? 'Custom medium request rejected and permanently deleted from all registers.'
            : 'Custom medium request successfully approved and merged into the master catalog.';

        return res.status(200).json({ success: true, message: customMessage, data: result || { master_medium_id, approval_status: 'deleted' } });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// School medium Controllers

const getMediums = async (req, res) => {
    try {
        const mediums = await SchoolMediumModel.getAll(req.user.school_id);
        return res.status(200).json({ success: true, data: mediums });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const selectMasterMedium = async (req, res) => {
    try {
        const { master_medium_id, description } = req.body;
        if (!master_medium_id) {
            return res.status(400).json({ success: false, message: 'Master medium selection ID is required.' });
        }

        const newAllocation = await SchoolMediumModel.selectMaster(req.user.school_id, req.user.id, { master_medium_id, description });

        return res.status(201).json({ success: true, message: 'Master medium allocated to your campus catalog successfully.', data: newAllocation });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const requestCustomMedium = async (req, res) => {
    try {
        const { custom_name, description } = req.body;
        if (!custom_name) {
            return res.status(400).json({ success: false, message: 'Custom medium name is mandatory.' });
        }

        const customAllocation = await SchoolMediumModel.requestCustom(req.user.school_id, req.user.id, { custom_name, description });

        return res.status(201).json({ success: true, message: 'Custom medium submission logged. Accessible once verified by Super Admin.', data: customAllocation });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const toggleMediumStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const exists = await SchoolMediumModel.getById(id);
        if (!exists) return res.status(404).json({ success: false, message: 'Medium record not found.' });

        const updated = await SchoolMediumModel.toggleStatus(id, req.user.id);
        return res.status(200).json({ success: true, message: 'Medium campus visibility updated.', data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const deleteMedium = async (req, res) => {
    try {
        const { id } = req.params;
        const exists = await SchoolMediumModel.getById(id);
        if (!exists) return res.status(404).json({ success: false, message: 'Medium record not found.' });

        await SchoolMediumModel.delete(id);
        return res.status(200).json({ success: true, message: 'Medium dropped from campus system profiles.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    getMasterMediums, getPendingMasterMediumRequests, createMasterMedium, updateMasterMedium, toggleMasterMediumStatus, deleteMasterMedium, reviewSchoolMediumRequest,
    getMediums, selectMasterMedium, requestCustomMedium, toggleMediumStatus, deleteMedium
};