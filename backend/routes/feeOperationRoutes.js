const express = require('express');
const router = express.Router();
const { generateStudentInstallments, applyFeeDiscount, processFeePayment, generateBatchInstallments, updateFeeDiscount, updateFeePayment, getStudentFeeDetails, getAdminFeeDashboard } = require('../controllers/feeOperationController');
const upload = require('../middleware/multer');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

router.post('/generate-installments', verifyToken, restrictTo('school_admin', 'staff_member'), generateStudentInstallments);
router.post('/generate-batch-installments', verifyToken, restrictTo('school_admin', 'staff_member'), generateBatchInstallments)
router.post('/apply-discount', verifyToken, restrictTo('school_admin', 'staff_member'), applyFeeDiscount);
router.post('/process-payment', verifyToken, restrictTo('school_admin', 'staff_member'), upload.single('receipt'), processFeePayment)
router.put('/update-discount', verifyToken, restrictTo('school_admin', 'staff_member'), updateFeeDiscount)
router.put('/update-payment', verifyToken, restrictTo('school_admin', 'staff_member'), upload.single('receipt'), updateFeePayment)

router.get('/dashboard-tracking', verifyToken, restrictTo('school_admin', 'staff_member'), getAdminFeeDashboard);

router.get('/get-fee-details', verifyToken, restrictTo('student'), getStudentFeeDetails)

module.exports = router;    