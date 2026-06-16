const AuthModel = require('../models/authModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        // 1. Initial look up targeting the staff ecosystem
        let user = await AuthModel.findStaffByEmail(email);
        let userRole = user?.role_name;
        let isStudent = false;

        // 2. Fallback check: If not found in staff, look inside the separate students table
        if (!user) {
            user = await AuthModel.findStudentByEmail(email);
            if (user) {
                userRole = user.role_name; // Safely reads 'student' from the DB roles join
                isStudent = true;
            }
        }

        // If the email doesn't match any account in the system
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid Email or Password' });
        }

        // Check account status if it's a student user
        if (isStudent && user.status === 'Inactive') {
            return res.status(403).json({ success: false, message: 'Your student profile is currently deactivated.' });
        }

        // 3. Verification gate: Ensure the user has gone through password onboarding
        if (!user.password) {
            return res.status(403).json({
                success: false,
                message: 'Account not activated. Please use your setup invitation token.'
            });
        }

        // 4. Validate the password hash matrix safely
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid Email or Password' });
        }

        // 5. Generate structural JWT payload containing correct contextual keys
        const tokenPayload = {
            id: user.id,
            school_id: user.school_id,
            role: userRole
        };

        // Inject contextual filters dynamically based on user profile types
        if (isStudent) {
            tokenPayload.batch_id = user.batch_id;
        } else {
            tokenPayload.department_id = user.department_id;
        }

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

        // 6. Return response to your React frontend state container
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                name: user.name,
                email: user.email,
                role: userRole,
                ...(isStudent ? { batch_id: user.batch_id } : { department_id: user.department_id })
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const setupInitialPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ success: false, message: 'Token and password fields are required.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Calls your unified procedure that handles both staff and student records seamlessly
        await AuthModel.activateUserAccount(token, hashedPassword);

        return res.status(200).json({
            success: true,
            message: 'Password initialized successfully. You may now log into your panel.'
        });
    } catch (error) {
        // Intercepts custom SIGNAL SQLSTATE message strings thrown by your MySQL logic
        return res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { login, setupInitialPassword };