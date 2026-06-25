const { MasterBoardModel, SchoolBoardModel } = require('../models/boardModel');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const getMasterBoards = async (req, res) => {
    try {
        const boards = await MasterBoardModel.getAll();
        return res.status(200).json({ success: true, data: boards });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getPendingMasterBoardRequests = async (req, res) => {
    try {
        let requests = await MasterBoardModel.getPendingRequests();

        if (requests && Array.isArray(requests[0]) && typeof requests[0][0] === 'object') {
            requests = requests[0];
        }

        return res.status(200).json({ success: true, data: Array.isArray(requests) ? requests : [] });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createMasterBoard = async (req, res) => {
    let localFilePath = null;
    try {
        const { board_name, description } = req.body;
        if (!board_name) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Board name is required.' });
        }

        let secureUrl = null;
        if (req.file) {
            localFilePath = req.file.path;
            const uploadRes = await cloudinary.uploader.upload(localFilePath, {
                folder: 'school_boards',
            });
            secureUrl = uploadRes.secure_url;
            fs.unlinkSync(localFilePath);
        }

        const newBoard = await MasterBoardModel.create(req.user.id, {
            board_name,
            board_logo: secureUrl,
            description
        });

        return res.status(201).json({ success: true, message: 'Master school board created successfully.', data: newBoard });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateMasterBoard = async (req, res) => {
    let localFilePath = null;
    try {
        const { id } = req.params;
        const { board_name, description } = req.body;

        const exists = await MasterBoardModel.getById(id);
        if (!exists) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: 'Master school board not found.' });
        }

        let secureUrl = exists.board_logo;
        if (req.file) {
            localFilePath = req.file.path;
            const uploadRes = await cloudinary.uploader.upload(localFilePath, {
                folder: 'school_boards',
            });
            secureUrl = uploadRes.secure_url;
            fs.unlinkSync(localFilePath);
        }

        const updatedBoard = await MasterBoardModel.update(id, req.user.id, { board_name, board_logo: secureUrl, description });

        return res.status(200).json({ success: true, message: 'Master school board updated successfully.', data: updatedBoard });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const toggleMasterBoardStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await MasterBoardModel.toggleStatus(id, req.user.id);
        return res.status(200).json({ success: true, message: 'Master board status toggled successfully.', data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteMasterBoard = async (req, res) => {
    try {
        const { id } = req.params;
        await MasterBoardModel.delete(id, req.user.id);
        return res.status(200).json({ success: true, message: 'Master board dropped successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const reviewSchoolBoardRequest = async (req, res) => {
    try {
        const { master_board_id, review_status } = req.body;

        if (!master_board_id || !review_status) {
            return res.status(400).json({ success: false, message: 'Master board ID and review status are required.' });
        }

        if (!['approved', 'rejected'].includes(review_status)) {
            return res.status(400).json({ success: false, message: 'Invalid status parameter context.' });
        }

        const result = await MasterBoardModel.reviewRequest(master_board_id, review_status, req.user.id);

        const customMessage = review_status === 'rejected'
            ? 'Custom board request rejected and permanently dropped from records.'
            : 'Custom board request successfully approved and merged into global ecosystem catalogs.';

        return res.status(200).json({ success: true, message: customMessage, data: result || { master_board_id, request_status: 'rejected' } });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getSchoolBoards = async (req, res) => {
    try {
        const boards = await SchoolBoardModel.getAll(req.user.school_id);
        return res.status(200).json({ success: true, data: boards });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const selectMasterBoard = async (req, res) => {
    try {
        const { master_board_id } = req.body;
        if (!master_board_id) {
            return res.status(400).json({ success: false, message: 'Master board ID is required.' });
        }

        const selection = await SchoolBoardModel.selectMaster(req.user.school_id, req.user.id, { master_board_id });
        return res.status(201).json({ success: true, message: 'Master board allocated successfully.', data: selection });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const requestCustomBoard = async (req, res) => {
    let localFilePath = null;
    try {
        const { custom_name, description } = req.body;
        if (!custom_name) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Custom board name is required.' });
        }

        let secureUrl = null;
        if (req.file) {
            localFilePath = req.file.path;
            const uploadRes = await cloudinary.uploader.upload(localFilePath, { folder: 'school_boards/custom' });
            secureUrl = uploadRes.secure_url;
            fs.unlinkSync(localFilePath);
        }

        const customRequest = await SchoolBoardModel.requestCustom(req.user.school_id, req.user.id, {
            custom_name,
            custom_logo: secureUrl,
            description
        });

        return res.status(201).json({ success: true, message: 'Custom board listing requested successfully and is pending approval.', data: customRequest });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const toggleSchoolBoardStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const exists = await SchoolBoardModel.getById(id);
        if (!exists || exists.school_id !== req.user.school_id) {
            return res.status(404).json({ success: false, message: 'School board reference allocation not found.' });
        }

        const updated = await SchoolBoardModel.toggleStatus(id, req.user.id);
        return res.status(200).json({ success: true, message: 'School board allocation status toggled.', data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteSchoolBoard = async (req, res) => {
    try {
        const { id } = req.params;
        const exists = await SchoolBoardModel.getById(id);
        if (!exists || exists.school_id !== req.user.school_id) {
            return res.status(404).json({ success: false, message: 'School board reference allocation not found.' });
        }

        await SchoolBoardModel.delete(id);
        return res.status(200).json({ success: true, message: 'Board allocation dropped from school profile completely.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getMasterBoards, getPendingMasterBoardRequests, createMasterBoard, updateMasterBoard, toggleMasterBoardStatus, deleteMasterBoard, reviewSchoolBoardRequest,
    getSchoolBoards, selectMasterBoard, requestCustomBoard, toggleSchoolBoardStatus, deleteSchoolBoard
}