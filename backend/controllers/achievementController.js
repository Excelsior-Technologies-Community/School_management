const AchievementModel = require('../models/achievementModel');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const createAchievement = async (req, res) => {
    let localCertificatePath = null;
    let localImagesPaths = [];
    try {
        const { student_id, event_date, title, achievement_category, achievement_level, position_achieved, issued_by } = req.body;
        const school_id = req.user.school_id;
        const created_by = req.user.id;

        let uploadedCertificateUrl = null;
        let uploadedImageUrls = [];

        if (req.files && req.files['certificate'] && req.files['certificate'][0]) {
            localCertificatePath = req.files['certificate'][0].path;
            const certCloudinaryResult = await cloudinary.uploader.upload(localCertificatePath, {
                folder: 'school_certificates',
                resource_type: 'auto'
            });
            uploadedCertificateUrl = certCloudinaryResult.secure_url;

            fs.unlinkSync(localCertificatePath);
            localCertificatePath = null;
        }

        if (req.files && req.files['images'] && req.files['images'].length > 0) {
            for (const file of req.files['images']) {
                localImagesPaths.push(file.path);
                const imgCloudinaryResult = await cloudinary.uploader.upload(file.path, {
                    folder: 'school_certificates/achievements',
                    resource_type: 'image'
                });
                uploadedImageUrls.push(imgCloudinaryResult.secure_url);

                fs.unlinkSync(file.path);
            }
            localImagesPaths = [];
        }

        const result = await AchievementModel.create({
            school_id,
            student_id,
            event_date,
            title,
            achievement_category,
            achievement_level,
            position_achieved,
            image_urls: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
            certificate_url: uploadedCertificateUrl,
            issued_by: issued_by || null,
            created_by
        });

        return res.status(201).json({
            success: true,
            message: "Achievement entry logged and assets uploaded successfully.",
            data: result
        });
    } catch (error) {
        if (localCertificatePath && fs.existsSync(localCertificatePath)) {
            fs.unlinkSync(localCertificatePath);
        }
        for (const path of localImagesPaths) {
            if (fs.existsSync(path)) fs.unlinkSync(path);
        }
        return res.status(500).json({ success: false, message: 'Internal server error logging achievement.' });
    }
};

const reviewAchievement = async (req, res) => {
    try {
        const { achievement_id, status } = req.body;
        const approved_by = req.user.id;

        if (!achievement_id || !status) {
            return res.status(400).json({ success: false, message: 'Missing required status execution variables.' });
        }

        const result = await AchievementModel.review(achievement_id, status, approved_by);

        if (result.rows_affected === 0) {
            return res.status(400).json({ success: false, message: 'Record not found or modification redundant.' });
        }

        return res.status(200).json({
            success: true,
            message: `Achievement workflow state successfully updated to ${status}.`
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Transaction execution failure updating state.' });
    }
};

const getSchoolAchievements = async (req, res) => {
    try {
        const school_id = req.user.school_id;
        const { category, search_query, limit, offset } = req.query;

        const data = await AchievementModel.getAllForSchool({
            school_id,
            category,
            search_query,
            limit,
            offset
        });

        return res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getStudentAchievements = async (req, res) => {
    try {
        const student_id = req.user.id;
        const data = await AchievementModel.getStudentPortfolio(student_id);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteAchievement = async (req, res) => {
    try {
        const { achievement_id } = req.body;

        if (!achievement_id) {
            return res.status(400).json({ success: false, message: 'Missing achievement ID.' });
        }

        const result = await AchievementModel.delete(achievement_id);

        if (result.success === 0) {
            return res.status(400).json({ success: false, message: result.message });
        }

        return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to delete achievement.' });
    }
}

module.exports = { createAchievement, reviewAchievement, getSchoolAchievements, getStudentAchievements, deleteAchievement };