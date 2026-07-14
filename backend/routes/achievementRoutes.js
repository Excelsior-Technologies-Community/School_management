const express = require('express');
const router = express.Router();
const { createAchievement, reviewAchievement, getSchoolAchievements, getStudentAchievements, deleteAchievement } = require('../controllers/achievementController');
const upload = require('../middleware/multer');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

const multiUpload = upload.fields([{ name: 'certificate', maxCount: 1 }, { name: 'images', maxCount: 5 }]);

router.post('/add-achievement', verifyToken, restrictTo('school_admin', 'staff_member'), multiUpload, createAchievement)
router.put('/review-achievement', verifyToken, restrictTo('school_admin', 'staff_member'), reviewAchievement)
router.get('/school-achievements', verifyToken, restrictTo('school_admin', 'staff_member'), getSchoolAchievements)
router.get('/get-achievement-details', verifyToken, restrictTo('student'), getStudentAchievements)
router.delete('/delete-achievement', verifyToken, restrictTo('school_admin', 'staff_member'), deleteAchievement)

module.exports = router; 