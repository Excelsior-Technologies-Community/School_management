const SchoolAdminModel = require('../models/schoolAdminModel');
const { sendStaffOnboardingEmail } = require('../services/emailService');
const crypto = require('crypto');
const { sendStudentOnboardingEmail } = require('../services/emailService');

const registerStudent = async (req, res) => {
    try {
        const { batchId, name, enrollmentNo, email } = req.body;

        const schoolId = req.user?.school_id;
        const schoolName = req.user?.school_name || "Our Institution";

        if (!batchId || !name || !enrollmentNo || !email) {
            return res.status(400).json({
                success: false,
                message: 'All fields (batchId, name, enrollmentNo, email) are required.'
            });
        }

        const invitationToken = crypto.randomBytes(32).toString('hex');
        await SchoolAdminModel.addStudent(schoolId, batchId, name, enrollmentNo, email, invitationToken);

        try {
            await sendStudentOnboardingEmail(email, name, schoolName, invitationToken);
        } catch (emailError) {
            console.error('SMTP Email dispatch failed:', emailError.message);
        }

        return res.status(201).json({ success: true, message: 'Student profile created successfully and invitation link has been sent.' });

    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const getSchoolStudents = async (req, res) => {
    try {
        const schoolId = req.user?.school_id;

        if (!schoolId) {
            return res.status(400).json({ success: false, message: 'Invalid token payload: School ID is missing.' });
        }

        const studentList = await SchoolAdminModel.getStudentsBySchool(schoolId);

        return res.status(200).json({ success: true, data: studentList });

    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

const addDepartment = async (req, res) => {
    try {
        const { deptName } = req.body;
        const schoolId = req.user?.school_id;

        if (!schoolId || !deptName) {
            return res.status(400).json({ success: false, message: 'Department name is required.' })
        }

        await SchoolAdminModel.addDepartment(schoolId, deptName);
        return res.status(201).json({ success: true, message: 'Department added successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const listDepartments = async (req, res) => {
    try {
        const schoolId = req.user?.school_id;

        if (!schoolId) {
            return res.status(400).json({ success: false, message: 'Invalid token' });
        }

        const data = await SchoolAdminModel.getSchoolDepartments(schoolId);
        return res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const updateDepartment = async (req, res) => {
    try {
        const schoolId = req.user?.school_id;
        const { departmentId, deptName } = req.body;

        if (!departmentId || !deptName) {
            return res.status(400).json({ success: false, message: 'Department name is required.' })
        }

        await SchoolAdminModel.updateDepartment(schoolId, parseInt(departmentId), deptName.trim());
        return res.status(201).json({ success: true, message: 'Department updated successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const removeDepartment = async (req, res) => {
    try {
        const schoolId = req.user?.school_id;
        const departmentId = req.params.id;

        if (!departmentId) {
            return res.status(400).json({ success: false, message: 'Invalid target.' })
        }

        await SchoolAdminModel.removeDepartment(schoolId, parseInt(departmentId));
        return res.status(200).json({ success: true, message: 'Department removed successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const addMember = async (req, res) => {
    try {
        const { roleId, departmentId, name, email, roleName } = req.body;
        const schoolId = req.user?.school_id;
        const schoolName = req.user?.school_name || "Our School"; // Optional fallback if stored in JWT

        if (!schoolId || !roleId || !departmentId || !name || !email) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required.'
            });
        }

        // 1. Generate a secure 32-byte crypto token
        const token = crypto.randomBytes(32).toString('hex');

        // 2. Pass the token down to your updated model method
        await SchoolAdminModel.addStaffMember(schoolId, roleId, departmentId, name, email, token);

        // 3. Dispatch the onboarding invitation email to the staff member
        // This will send them the link containing the token to set their password
        await sendStaffOnboardingEmail(email, name, schoolName, roleName || 'Staff Member', token);

        return res.status(201).json({
            success: true,
            message: 'Staff member added successfully and invitation email dispatched.'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const listMembers = async (req, res) => {
    try {
        const schoolId = req.user?.school_id;
        if (!schoolId) {
            return res.status(400).json({ success: false, message: 'Invalid token' })
        }

        const data = await SchoolAdminModel.getSchoolMembers(schoolId);
        return res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
};

const updateMember = async (req, res) => {
    try {
        const schoolId = req.user?.school_id;
        const { staffId, roleId, departmentId, name, email } = req.body;

        if (!schoolId || !staffId || !roleId || !departmentId || !name || !email) {
            return res.status(400).json({ success: false, message: 'All fields are required' })
        }

        await SchoolAdminModel.updateStaffMember(schoolId, staffId, roleId, departmentId, name, email)
        return res.status(200).json({ success: true, message: 'Staff member updated successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
};

const removeMember = async (req, res) => {
    try {
        const schoolId = req.user?.school_id;
        const { staffId } = req.params;

        if (!schoolId || !staffId) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        await SchoolAdminModel.removeStaffMember(schoolId, staffId);
        return res.status(200).json({ success: true, message: 'Staff member removed successfully' })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
};

const addSalary = async (req, res) => {
    try {
        const schoolId = req.user?.school_id;
        const { staffId, baseSalary } = req.body;

        if (!schoolId || !staffId || !baseSalary) {
            return res.status(400).json({ success: false, message: 'All fields are required' })
        }

        await SchoolAdminModel.addSalary(schoolId, staffId, baseSalary)
        return res.status(201).json({ success: true, message: 'Salary record added' })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
};

const updateSalary = async (req, res) => {
    try {
        const schoolId = req.user?.school_id;
        const { staffId, baseSalary } = req.body;

        if (!schoolId || !staffId || !baseSalary) {
            return res.status(400).json({ success: false, message: 'All fields are required' })
        }

        await SchoolAdminModel.updateSalary(schoolId, staffId, baseSalary)
        return res.status(200).json({ success: true, message: 'Salary record updated' })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
};

const removeSalary = async (req, res) => {
    try {
        const schoolId = req.user?.school_id;
        const { staffId } = req.params;

        if (!schoolId || !staffId) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        await SchoolAdminModel.removeSalary(schoolId, staffId);
        return res.status(200).json({ success: true, message: 'Salary record removed successfully' })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
};

const viewSchoolPayroll = async (req, res) => {
    try {
        const schoolId = req.user?.school_id;
        if (!schoolId) {
            return res.status(400).json({ success: false, message: 'Missing school id' });
        }

        const data = await SchoolAdminModel.getSalariesReport(schoolId)
        return res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = { registerStudent, getSchoolStudents, addDepartment, listDepartments, updateDepartment, removeDepartment, addMember, listMembers, updateMember, removeMember, addSalary, updateSalary, removeSalary, viewSchoolPayroll };