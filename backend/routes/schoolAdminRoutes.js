const express = require('express');
const router = express.Router();
const { addDepartment, listDepartments, updateDepartment, removeDepartment, addMember, listMembers, updateMember, removeMember, addSalary, updateSalary, removeSalary, viewSchoolPayroll } = require('../controllers/schoolAdminController');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware')

router.post('/departments/add', verifyToken, restrictTo('school_admin'), addDepartment)
router.get('/departments/list', verifyToken, restrictTo('school_admin'), listDepartments)
router.put('/departments/update', verifyToken, restrictTo('school_admin'), updateDepartment)
router.delete('/departments/remove/:id', verifyToken, restrictTo('school_admin'), removeDepartment)

router.post('/add-member', verifyToken, restrictTo('school_admin'), addMember)
router.get('/list-members', verifyToken, restrictTo('school_admin'), listMembers)
router.put('/update-member', verifyToken, restrictTo('school_admin'), updateMember)
router.delete('/remove/:staffId', verifyToken, restrictTo('school_admin'), removeMember)

router.post('/payroll/assign', verifyToken, restrictTo('school_admin'), addSalary)
router.put('/payroll/update', verifyToken, restrictTo('school_admin'), updateSalary)
router.get('/payroll/all', verifyToken, restrictTo('school_admin'), viewSchoolPayroll)
router.delete('/payroll/clear/:staffId', verifyToken, restrictTo('school_admin'), removeSalary)

module.exports = router;