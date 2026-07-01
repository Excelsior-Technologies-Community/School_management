const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware')

const {
    getMasterBoards, getPendingMasterBoardRequests, createMasterBoard, updateMasterBoard, toggleMasterBoardStatus, deleteMasterBoard, reviewSchoolBoardRequest,
    getSchoolBoards, selectMasterBoard, requestCustomBoard, toggleSchoolBoardStatus, deleteSchoolBoard
} = require('../controllers/boardController')

router.get('/master-boards', verifyToken, restrictTo('super_admin', 'school_admin'), getMasterBoards);
router.get('/master-boards/pending', verifyToken, restrictTo('super_admin'), getPendingMasterBoardRequests);
router.post('/master-boards/add', verifyToken, restrictTo('super_admin'), upload.single('board_logo'), createMasterBoard)
router.put('/master-boards/:id', verifyToken, restrictTo('super_admin'), upload.single('board_logo'), updateMasterBoard)
router.delete('/master-boards/:id', verifyToken, restrictTo('super_admin'), deleteMasterBoard)
router.put('/master-boards/toggle-status/:id', verifyToken, restrictTo('super_admin'), toggleMasterBoardStatus)
router.post('/master-boards/review', verifyToken, restrictTo('super_admin'), reviewSchoolBoardRequest)

router.get('/school-boards', verifyToken, restrictTo('school_admin','staff_member'), getSchoolBoards)
router.post('/school-boards/select-master', verifyToken, restrictTo('school_admin'), selectMasterBoard)
router.post('/school-boards/request-custom', verifyToken, restrictTo('school_admin'), upload.single('board_logo'), requestCustomBoard)
router.put('/school-boards/toggle-status/:id', verifyToken, restrictTo('school_admin'), toggleSchoolBoardStatus)
router.delete('/school-boards/:id', verifyToken, restrictTo('school_admin'), deleteSchoolBoard)

module.exports = router;