const express = require('express')
const router = express.Router();
const { createInquiry, updateInquiry, getInquiriesList, getInquiryDetails, createFollowUp, getFollowUpsByInquiryId, updateInquiryStatus } = require('../controllers/admissionController')
const upload = require('../middleware/multer');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

router.post('/inquiries/create', verifyToken, restrictTo('school_admin', 'staff_member'), upload.array('documents', 5), createInquiry)
router.put('/inquiries/:id', verifyToken, restrictTo('school_admin', 'staff_member'), upload.array('documents', 5), updateInquiry);
router.get('/inquiries', verifyToken, restrictTo('school_admin', 'staff_member'), getInquiriesList);
router.get('/inquiries/:id', verifyToken, restrictTo('school_admin', 'staff_member'), getInquiryDetails);
router.post('/follow-ups', verifyToken, restrictTo('school_admin', 'staff_member'), createFollowUp);
router.get('/inquiries/:id/follow-ups', verifyToken, restrictTo('school_admin', 'staff_member'), getFollowUpsByInquiryId);
router.patch('/inquiries/:id/status', verifyToken, restrictTo('school_admin', 'staff_member'), updateInquiryStatus);

module.exports = router;