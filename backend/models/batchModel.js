const db = require('../config/db');

const BatchModel = {
    // SUPER ADMIN 
    createGlobalClass: async (className) => {
        const [result] = await db.query('CALL sp_SuperCreateClass(?)', [className]);
        return result[0][0];
    },

    getAllGloabalClasses: async () => {
        const [result] = await db.query('CALL sp_GetAllGlobalClasses()');
        return result[0];
    },

    // SCHOOL ADMIN SCHOOL CLASSES
    selectSchoolClass: async (schoolId, classId) => {
        const [result] = await db.query('CALL sp_SchoolSelectClass(?,?)', [schoolId, classId]);
        return result[0][0];
    },

    removeSchoolClass: async (schoolClassId, schoolId) => {
        const [result] = await db.query('CALL sp_SchoolRemoveClass(?,?)', [schoolClassId, schoolId]);
        return result[0][0];
    },

    getSchoolClasses: async (schoolId) => {
        const [result] = await db.query('CALL sp_GetSchoolClasses(?)', [schoolId]);
        return result[0];
    },

    // SCHOOL ADMIN SECTIONS
    createSection: async (schoolId, sectionName) => {
        const [result] = await db.query('CALL sp_SchoolCreateSection(?,?)', [schoolId, sectionName]);
        return result[0][0];
    },

    getSchoolSection: async (schoolId) => {
        const [result] = await db.query('CALL sp_GetSchoolSections(?)', [schoolId]);
        return result[0];
    },

    updateSection: async (sectionId, schoolId, newSectionName) => {
        const [result] = await db.query('CALL sp_SchoolUpdateSection(?,?,?)', [sectionId, schoolId, newSectionName]);
        return result[0][0];
    },

    deleteSection: async (sectionId, schoolId) => {
        const [result] = await db.query('CALL sp_SchoolDeleteSection(?,?)', [sectionId, schoolId]);
        return result[0][0];
    },

    // SCHOOL ADMIN BATCHES
    createBatch: async (schoolId, branchId, schoolClassId, sectionId, schoolMediumId, schoolBoardId, academicYear) => {
        const [result] = await db.query('CALL sp_CreateBatch(?,?,?,?,?,?,?)', [schoolId, branchId, schoolClassId, sectionId, schoolMediumId, schoolBoardId, academicYear]);
        return result[0][0];
    },

    getSchoolBatches: async (schoolId) => {
        const [result] = await db.query('CALL sp_GetSchoolBatches(?)', [schoolId]);
        return result[0];
    },

    updateBatch: async (batchId, schoolId, branchId, schoolClassId, sectionId, schoolMediumId, schoolBoardId, academicYear) => {
        const [result] = await db.query('CALL sp_UpdateBatch(?,?,?,?,?,?,?,?)', [batchId, schoolId, branchId, schoolClassId, sectionId, schoolMediumId, schoolBoardId, academicYear]);
        return result[0][0];
    },

    deleteBatch: async (batchId, schoolId) => {
        const [result] = await db.query('CALL sp_DeleteBatch(?,?)', [batchId, schoolId]);
        return result[0][0];
    },

    toggleStatus: async (batchId) => {
        const [rows] = await db.query('CALL sp_ToggleBatchStatus(?)', [batchId]);
        return rows[0][0];

    }
};

module.exports = BatchModel;