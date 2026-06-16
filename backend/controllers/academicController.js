const { BranchModel, SubjectModel, MasterSubjectModel } = require('../models/academicModel');

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
};

const selectMasterSubject = async (req, res) => {
    try {
        const { master_subject_id, color_code } = req.body;
        if (!master_subject_id) {
            return res.status(400).json({ success: false, message: 'Master subject selection ID is required.' });
        }

        const newAllocation = await SubjectModel.selectMaster(req.user.school_id, req.user.id, { master_subject_id, color_code });

        return res.status(201).json({
            success: true,
            message: 'Master subject allocated to your campus catalog successfully.',
            data: newAllocation
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const requestCustomSubject = async (req, res) => {
    try {
        const { custom_name, custom_code, custom_type, description, color_code } = req.body;
        if (!custom_name || !custom_code) {
            return res.status(400).json({ success: false, message: 'Custom subject name and code are mandatory.' });
        }

        const customAllocation = await SubjectModel.requestCustom(req.user.school_id, req.user.id, {
            custom_name,
            custom_code,
            custom_type,
            description,
            color_code
        });

        return res.status(201).json({
            success: true,
            message: 'Custom subject submission logged. Accessible once verified by Super Admin.',
            data: customAllocation
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const toggleSubjectStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const exists = await SubjectModel.getById(id);
        if (!exists) return res.status(404).json({ success: false, message: 'Subject linkage record not found.' });

        const updated = await SubjectModel.toggleStatus(id, req.user.id);
        return res.status(200).json({ success: true, message: 'Subject campus visibility updated.', data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const exists = await SubjectModel.getById(id);
        if (!exists) return res.status(404).json({ success: false, message: 'Subject allocation layout not found.' });

        await SubjectModel.delete(id);
        return res.status(200).json({ success: true, message: 'Subject cleanly detached from campus system profiles.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
//-------------------------------------------------------------------------------------------------------------------
// master subject controller
const getMasterSubjects = async (req, res) => {
    try {
        const subjects = await MasterSubjectModel.getAll();

        return res.status(200).json({ success: true, data: subjects });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getPendingMasterRequests = async (req, res) => {
    try {
        let requests = await MasterSubjectModel.getPendingRequests();

        if (requests && Array.isArray(requests[0]) && typeof requests[0][0] === 'object') {
            requests = requests[0];
        }

        return res.status(200).json({ success: true, data: Array.isArray(requests) ? requests : [] });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createMasterSubject = async (req, res) => {
    try {
        const { subject_name, subject_code, description, subject_type, color_code } = req.body;
        if (!subject_name || !subject_code) {
            return res.status(400).json({ success: false, message: 'Subject name and code are required.' });
        }
        const newSubject = await MasterSubjectModel.create(req.user.id, { subject_name, subject_code, description, subject_type, color_code });
        return res.status(201).json({ success: true, message: 'Master subject created successfully.', data: newSubject });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const updateMasterSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const { subject_name, subject_code, description, subject_type, color_code } = req.body;

        const exists = await MasterSubjectModel.getById(id);
        if (!exists) return res.status(404).json({ success: false, message: 'Master subject not found.' });

        const updatedSubject = await MasterSubjectModel.update(id, req.user.id, { subject_name, subject_code, description, subject_type, color_code });
        return res.status(200).json({ success: true, message: 'Master subject updated successfully.', data: updatedSubject });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const toggleMasterSubjectStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await MasterSubjectModel.toggleStatus(id, req.user.id);
        return res.status(200).json({ success: true, message: 'Master subject status toggled successfully.', data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const deleteMasterSubject = async (req, res) => {
    try {
        const { id } = req.params;
        await MasterSubjectModel.delete(id, req.user.id);
        return res.status(200).json({ success: true, message: 'Master subject dropped successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const reviewSchoolSubjectRequest = async (req, res) => {
    try {
        const { master_subject_id, review_status } = req.body;

        if (!master_subject_id || !review_status) {
            return res.status(400).json({ success: false, message: 'Master subject ID and review status are required.' });
        }
        if (!['approved', 'rejected'].includes(review_status)) {
            return res.status(400).json({ success: false, message: 'Invalid status. Use approved or rejected.' });
        }

        const result = await MasterSubjectModel.reviewRequest(master_subject_id, review_status, req.user.id);

        // Custom message based on hard delete action vs status update
        const customMessage = review_status === 'rejected'
            ? 'Custom request rejected and permanently deleted from all registers.'
            : 'Custom request successfully approved and merged into the master catalog.';

        return res.status(200).json({
            success: true,
            message: customMessage,
            data: result || { master_subject_id, approval_status: 'deleted' }
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = {
    getBranches, createBranch, updateBranch, toggleBranchStatus, deleteBranch,
    getSubjects, selectMasterSubject, requestCustomSubject, toggleSubjectStatus, deleteSubject,
    getMasterSubjects, getPendingMasterRequests, createMasterSubject, updateMasterSubject, toggleMasterSubjectStatus, deleteMasterSubject, reviewSchoolSubjectRequest
};