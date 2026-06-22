const HomeworkModel = require('../models/homeworkModel');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
require('dotenv').config();
const db = require('../config/db')

const safeUnlink = (file) => {
    if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
    }
};

const addHomeworkAssignment = async (req, res) => {
    try {
        const school_id = req.user?.school_id;
        const staff_id = req.user?.id;

        const { batch_id, school_subject_id, homework_category, homework_title, description, assigned_date, due_date } = req.body;

        if (!batch_id || !school_subject_id || !homework_category || !homework_title || !description || !assigned_date || !due_date) {
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ success: false, message: 'All structural assignment parameters are required.' });
        }

        let finalAttachments = [];

        if (req.file) {
            if (!req.file.path) {
                return res.status(500).json({ success: false, message: "Multer Error: File path was not created successfully." });
            }

            try {
                const cleanPath = req.file.path.replace(/\\/g, "/");
                const isImage = req.file.mimetype.startsWith('image/');

                // Use 'unsigned_upload' and pass your exact preset name
                const uploadResult = await cloudinary.uploader.unsigned_upload(
                    cleanPath,
                    'jplucakn',
                    {
                        resource_type: isImage ? 'image' : 'raw',
                        folder: 'school_homework_attachments'
                    }
                );

                finalAttachments.push(uploadResult.secure_url);

                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }

            } catch (cloudErr) {
                if (req.file.path && fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                console.error("CLOUDINARY UNSIGNED EXCEPTION REJECTION:", cloudErr);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload asset attachment to Cloudinary cloud.',
                    error_details: cloudErr.message || cloudErr
                });
            }
        }

        await HomeworkModel.createHomework({ school_id, staff_id, batch_id: parseInt(batch_id), school_subject_id: parseInt(school_subject_id), homework_category, homework_title, description, attachments: finalAttachments, assigned_date, due_date });

        return res.status(201).json({ success: true, message: 'Homework assignment with cloud asset attachments successfully saved to database!' });
    } catch (error) {
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error("Error executing server homework workflow:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getStaffAssignments = async (req, res) => {
    try {
        const school_id = req.user?.school_id;
        const staff_id = req.user?.staff_id || req.user?.id;

        const dynamicRoster = await HomeworkModel.getHomeworkByStaff(school_id, staff_id);

        return res.status(200).json({ success: true, data: dynamicRoster });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getStudentAssignedHomework = async (req, res) => {
    try {
        const school_id = req.user?.school_id;
        const student_id = req.user?.id;
        const assignedList = await HomeworkModel.getHomeworkForStudent(school_id, student_id);
        return res.status(200).json({ success: true, data: assignedList });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const submitHomeworkOrLateRequest = async (req, res) => {
    try {
        const school_id = req.user?.school_id;
        const student_id = req.user?.id;

        const { homework_id, submission_text, late_reason } = req.body;

        if (!homework_id) {
            safeUnlink(req.file);
            return res.status(400).json({ success: false, message: 'Homework context identifier target is required.' });
        }

        let finalAttachments = [];

        if (req.file) {
            try {
                const cleanPath = req.file.path.replace(/\\/g, "/");
                const isImage = req.file.mimetype.startsWith('image/');

                const uploadResult = await cloudinary.uploader.unsigned_upload(
                    cleanPath,
                    'jplucakn',
                    {
                        resource_type: isImage ? 'image' : 'raw',
                        folder: 'student_homework_submissions'
                    }
                );
                finalAttachments.push(uploadResult.secure_url);
                safeUnlink(req.file);
            } catch (cloudErr) {
                safeUnlink(req.file);
                return res.status(500).json({ success: false, message: 'Cloudinary upload engine error.', error: cloudErr.message });
            }
        }

        const dbResponse = await HomeworkModel.submitOrRequestHomework({
            school_id,
            homework_id: parseInt(homework_id),
            student_id,
            submission_text,
            attachments: finalAttachments.length > 0 ? finalAttachments : null,
            late_reason
        });

        if (['PENDING_APPROVAL', 'REQUEST_REJECTED'].includes(dbResponse.result_status)) {
            return res.status(403).json({ success: false, ...dbResponse });
        }

        return res.status(200).json({ success: true, ...dbResponse });

    } catch (error) {
        safeUnlink(req.file);
        return res.status(500).json({ success: false, message: error.message });
    }
};


const getStaffPendingLateRequests = async (req, res) => {
    try {
        const school_id = req.user?.school_id;
        const staff_id = req.user?.id;

        const tickets = await HomeworkModel.getPendingLateRequests(school_id, staff_id);
        return res.status(200).json({ success: true, data: tickets });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateLateRequestStatus = async (req, res) => {
    try {
        const staff_id = req.user?.id;
        const { submission_id, decision, admin_remark } = req.body;

        if (!submission_id || !['Approved', 'Rejected'].includes(decision)) {
            return res.status(400).json({ success: false, message: 'Invalid payload request parameters.' });
        }

        const dbResult = await HomeworkModel.processLateSubmissionRequest({
            submission_id: parseInt(submission_id),
            staff_id,
            decision,
            admin_remark
        });

        return res.status(200).json({ success: true, ...dbResult });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getSubmissionsForAssignment = async (req, res) => {
    try {
        const school_id = req.user?.school_id;
        const { homework_id } = req.params;

        const roster = await HomeworkModel.getSubmissionsByHomework(school_id, parseInt(homework_id));
        return res.status(200).json({ success: true, data: roster });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const evaluateAndGradeSubmission = async (req, res) => {
    try {
        const staff_id = req.user?.id;

        const { submission_id, marks_obtained, teacher_remarks, maximum_marks, rating } = req.body;

        if (!submission_id || marks_obtained === undefined) {
            return res.status(400).json({ success: false, message: 'Missing evaluation credentials.' });
        }

        let finalMaxMarks;

        if (!maximum_marks || parseFloat(maximum_marks) <= 0) {
            const [submissionRows] = await db.query(
                `SELECT maximum_marks FROM tbl_home_work_submissions WHERE submission_id = ?`,
                [submission_id]
            );

            if (!submissionRows || submissionRows.length === 0) {
                return res.status(404).json({ success: false, message: 'Submission record context not found.' });
            }
            finalMaxMarks = submissionRows[0].maximum_marks;
        } else {
            finalMaxMarks = maximum_marks;
        }

        const dbResult = await HomeworkModel.gradeSubmission({
            submission_id: parseInt(submission_id),
            staff_id,
            marks_obtained: parseFloat(marks_obtained),
            maximum_marks: parseFloat(finalMaxMarks),
            rating: rating ? parseInt(rating) : null, 
            teacher_remarks: teacher_remarks || null
        });

        return res.status(200).json({ success: true, ...dbResult });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

//
const getStaffAllocations = async (req, res) => {
    try {
        const school_id = req.user?.school_id;
        const staff_id = req.user?.id;

        const allocations = await HomeworkModel.getStaffAllocations(school_id, staff_id);
        return res.status(200).json({ success: true, data: allocations });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getStaffAllocations, addHomeworkAssignment, getStaffAssignments, getStudentAssignedHomework, submitHomeworkOrLateRequest, getStaffPendingLateRequests, updateLateRequestStatus, getSubmissionsForAssignment, evaluateAndGradeSubmission };