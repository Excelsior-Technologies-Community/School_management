const BatchNotesModel = require('../models/batchNotesModel');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const createBatchNote = async (req, res) => {
    try {
        const { batch_id, note_date, title, content, homework_id, is_visible_to_students, status } = req.body;
        const school_id = req.user.school_id;
        const teacher_id = req.user.id;
        const user_id = req.user.id;

        let attachmentsArray = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const uploadResult = await cloudinary.uploader.upload(file.path, {
                        folder: 'school_batch_notes',
                        resource_type: 'auto'
                    });
                    attachmentsArray.push(uploadResult.secure_url);
                } finally {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                }
            }
        }

        const result = await BatchNotesModel.manageBatchNote({
            action: 'CREATE',
            school_id,
            batch_id,
            teacher_id,
            note_date,
            title,
            content,
            attachments: attachmentsArray.length > 0 ? attachmentsArray : null,
            homework_id,
            is_visible_to_students: is_visible_to_students === 'false' ? false : true,
            status,
            user_id
        });

        return res.status(201).json({ success: true, message: result.message, note_id: result.note_id });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
};

const updateBatchNote = async (req, res) => {
    try {
        const { note_id, title, content, homework_id, is_visible_to_students, status, existing_attachments } = req.body;
        const user_id = req.user.id;

        let attachmentsArray = [];
        if (existing_attachments) {
            attachmentsArray = typeof existing_attachments === 'string'
                ? [existing_attachments]
                : existing_attachments;
        }

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const uploadResult = await cloudinary.uploader.upload(file.path, {
                        folder: 'school_batch_notes',
                        resource_type: 'auto'
                    });
                    attachmentsArray.push(uploadResult.secure_url);
                } finally {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                }
            }
        }

        const result = await BatchNotesModel.manageBatchNote({
            action: 'UPDATE',
            note_id,
            title,
            content,
            attachments: attachmentsArray,
            homework_id,
            is_visible_to_students: is_visible_to_students === 'false' ? false : true,
            status,
            user_id
        });

        return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
};

const toggleVisibility = async (req, res) => {
    try {
        const { note_id } = req.body;
        const user_id = req.user.id;
        const result = await BatchNotesModel.manageBatchNote({
            action: 'TOGGLE_VISIBILITY',
            note_id,
            user_id
        });
        return res.status(200).json({ success: true, message: result.message, is_visible_to_students: result.is_visible_to_students });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const toggleStatus = async (req, res) => {
    try {
        const { note_id } = req.body;
        const user_id = req.user.id;
        const result = await BatchNotesModel.manageBatchNote({
            action: 'TOGGLE_STATUS',
            note_id,
            user_id
        });
        return res.status(200).json({ success: true, message: result.message, status: result.status });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getStudentNotes = async (req, res) => {
    try {
        const batch_id = req.user.batch_id;
        const school_id = req.user.school_id;
        const data = await BatchNotesModel.getStudentBatchNotes(school_id, batch_id);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to fetch student batch notes.' });
    }
};

const getStaffNotes = async (req, res) => {
    try {
        const school_id = req.user.school_id;
        const { batch_id, status } = req.query;

        const data = await BatchNotesModel.getStaffBatchNotes(school_id, batch_id, status);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { createBatchNote, updateBatchNote, toggleVisibility, toggleStatus, getStudentNotes, getStaffNotes }