const AdmissionModel = require('../models/admissionModel');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const uploadDocumentsToCloudinary = async (files) => {
    const uploadedUrls = [];
    if (!files || files.length === 0) return uploadedUrls;

    for (const file of files) {
        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'school_admission_documents',
                resource_type: 'auto'
            });
            uploadedUrls.push(result.secure_url);
        } finally {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        }
    }
    return uploadedUrls;
};

const createInquiry = async (req, res) => {
    let localFilesPaths = [];
    try {
        const school_id = req.user.school_id;
        const staff_id = req.user.id;

        const data = { ...req.body };

        if (req.files && req.files.length > 0) {
            localFilesPaths = req.files.map(file => file.path);
        }

        if (typeof data.inquiry_parent_details === 'string') {
            data.inquiry_parent_details = JSON.parse(data.inquiry_parent_details);
        }

        const documents = await uploadDocumentsToCloudinary(req.files);
        data.documents = documents;

        const insertedId = await AdmissionModel.createInquiry(school_id, staff_id, data);

        return res.status(201).json({
            success: true,
            message: "Admission inquiry entry logged and assets uploaded successfully.",
            inquiry_id: insertedId
        });
    } catch (error) {
        for (const path of localFilesPaths) {
            if (fs.existsSync(path)) fs.unlinkSync(path);
        }
        return res.status(500).json({ success: false, message: error.message || 'Internal server error logging inquiry.' });
    }
};

const updateInquiry = async (req, res) => {
    let localFilesPaths = [];
    try {
        const { id } = req.params;
        const staff_id = req.user.id;
        const data = { ...req.body };

        if (req.files && req.files.length > 0) {
            localFilesPaths = req.files.map(file => file.path);
        }

        if (typeof data.inquiry_parent_details === 'string') {
            data.inquiry_parent_details = JSON.parse(data.inquiry_parent_details);
        }

        let existingDocs = [];
        if (data.existing_documents) {
            existingDocs = typeof data.existing_documents === 'string'
                ? JSON.parse(data.existing_documents)
                : data.existing_documents;
        }

        const newDocs = await uploadDocumentsToCloudinary(req.files);
        data.documents = [...existingDocs, ...newDocs];

        const result = await AdmissionModel.updateInquiry(id, staff_id, data);

        return res.status(200).json({
            success: true,
            message: "Admission inquiry profile updated successfully.",
            data: result
        });
    } catch (error) {
        for (const path of localFilesPaths) {
            if (fs.existsSync(path)) fs.unlinkSync(path);
        }
        return res.status(500).json({ success: false, message: error.message || 'Failed to update admission inquiry.' });
    }
};

const getInquiriesList = async (req, res) => {
    try {
        const school_id = req.user.school_id;
        const { branch_id, academic_year_id, inquiry_status } = req.query;

        const data = await AdmissionModel.getInquiriesList({ school_id, branch_id, academic_year_id, inquiry_status });

        return res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to fetch inquiries list.' });
    }
};

const getInquiryDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await AdmissionModel.getInquiryDetails(id);

        if (!data.inquiryProfile) {
            return res.status(404).json({ success: false, message: 'Admission inquiry record not found.' });
        }

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve inquiry details.' });
    }
};

const createFollowUp = async (req, res) => {
    try {
        const staff_id = req.user.id;
        const data = { ...req.body };

        if (!data.inquiry_id || !data.follow_up_date || !data.response_status) {
            return res.status(400).json({ success: false, message: 'Missing required follow-up values.' });
        }

        const insertedId = await AdmissionModel.createFollowUp(staff_id, data);

        return res.status(201).json({
            success: true,
            message: "Admission follow-up logged and status pipeline updated successfully.",
            follow_up_id: insertedId
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to record follow-up.' });
    }
};

const getFollowUpsByInquiryId = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await AdmissionModel.getFollowUpsByInquiryId(id);

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to fetch historical timeline.' });
    }
};

const updateInquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { inquiry_status } = req.body;
        const school_id = req.user.school_id;
        const staff_id = req.user.id;

        if (!inquiry_status) {
            return res.status(400).json({ success: false, message: 'Inquiry status is required.' });
        }

        const result = await AdmissionModel.updateStatus(id, school_id, inquiry_status, staff_id);

        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to update inquiry status.' });
    }
};

module.exports = { createInquiry, updateInquiry, getInquiriesList, getInquiryDetails, createFollowUp, getFollowUpsByInquiryId, updateInquiryStatus }
