const express = require('express');
const router = express.Router();
const { registerSchool, getSchoolsAndAdmins } = require('../controllers/superAdminController');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

router.post('/create-school', verifyToken, restrictTo('super_admin'), registerSchool);
router.get('/school-admins', verifyToken, restrictTo('super_admin'), getSchoolsAndAdmins)

module.exports = router;