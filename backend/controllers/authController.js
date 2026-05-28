// controllers/authController.js
const AuthModel = require('../models/authModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await AuthModel.findStaffByEmail(email);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid Email or Password' });
        }

        if (!user.password) {
            return res.status(403).json({
                success: false,
                message: 'Account not activated. Please use your setup invitation token.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid Email or Password' });
        }

        const token = jwt.sign(
            {
                id: user.id,
                school_id: user.school_id,
                role: user.role_name
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role_name
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

        await AuthModel.activateAdminAccount(token, hashedPassword);

        return res.status(200).json({
            success: true,
            message: 'Password initialized successfully. You may now log into your panel.'
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { login, setupInitialPassword };