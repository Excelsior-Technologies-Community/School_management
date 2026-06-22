const express = require('express');
const router = express.Router();
const { getPeriods, createPeriod, updatePeriod, togglePeriodStatus, deletePeriod,
    getTimeTableByBatch, createTimeTableEntry, updateTimeTableEntry, deleteTimeTableEntry,
    getSubstitutions, createSubstitution, deleteSubstitution, getActiveDates,
    getTimetableByTeacher
} = require('../controllers/timetableController')
const { verifyToken, restrictTo } = require('../middleware/authMiddleware')

// routes for periods
router.post('/periods/add', verifyToken, restrictTo('school_admin'), createPeriod)
router.get('/periods', verifyToken, restrictTo('school_admin','student'), getPeriods)
router.put('/periods/:id', verifyToken, restrictTo('school_admin'), updatePeriod)
router.delete('/periods/:id', verifyToken, restrictTo('school_admin'), deletePeriod)
router.put('/periods/toggle-status/:id', verifyToken, restrictTo('school_admin'), togglePeriodStatus)

// routes for timetable
router.post('/schedule/add', verifyToken, restrictTo('school_admin'), createTimeTableEntry)
router.get('/schedule/:batch_id', verifyToken, restrictTo('school_admin','student'), getTimeTableByBatch)
router.put('/schedule/:id', verifyToken, restrictTo('school_admin'), updateTimeTableEntry)
router.delete('/schedule/:id', verifyToken, restrictTo('school_admin'), deleteTimeTableEntry)

// routes for substitutions
router.get('/substitutions', verifyToken, restrictTo('school_admin'), getSubstitutions);
router.post('/substitutions/add', verifyToken, restrictTo('school_admin'), createSubstitution);
router.delete('/substitutions/:id', verifyToken, restrictTo('school_admin'), deleteSubstitution);
router.get('/substitutions/active-dates', verifyToken, restrictTo('school_admin'), getActiveDates);

// routes for particular teacher timetable
router.get('/staff-timetable', verifyToken, restrictTo('staff_member'), getTimetableByTeacher)

module.exports = router;