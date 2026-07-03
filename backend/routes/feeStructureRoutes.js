const express = require('express');
const router = express.Router();
const { createFeeStructure, getAllFeeStructures, getFeeStructureById, updateFeeStructure, deleteFeeStructure } = require('../controllers/feeStructureController');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

router.post('/add-fee-structure', verifyToken, restrictTo('school_admin', 'staff_member'), createFeeStructure)
router.get('/fee-structures', verifyToken, restrictTo('school_admin', 'staff_member'), getAllFeeStructures)
router.get('/fee-structure/:id', verifyToken, restrictTo('school_admin', 'staff_member'), getFeeStructureById)
router.put('/update-fee-structure/:id', verifyToken, restrictTo('school_admin', 'staff_member'), updateFeeStructure)
router.delete('/fee-structure/:id', verifyToken, restrictTo('school_admin', 'staff_member'), deleteFeeStructure)

module.exports = router;