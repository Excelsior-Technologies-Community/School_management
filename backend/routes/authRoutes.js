const express = require('express');
const router = express.Router();
const { login, setupInitialPassword } = require('../controllers/authController');

router.post('/login', login);
router.post('/setup-password', setupInitialPassword);

module.exports = router;