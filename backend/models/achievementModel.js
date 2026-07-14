const db = require('../config/db');

const AchievementModel = {
    create: async (achievementData) => {
        const [rows] = await db.query(
            'CALL sp_AddAchievement(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                achievementData.school_id,
                achievementData.student_id,
                achievementData.event_date,
                achievementData.title,
                achievementData.achievement_category,
                achievementData.achievement_level,
                achievementData.position_achieved,
                achievementData.image_urls ? JSON.stringify(achievementData.image_urls) : null,
                achievementData.certificate_url || null,
                achievementData.issued_by || null,
                achievementData.created_by
            ]
        );
        return { achievement_id: rows[0][0].new_achievement_id };
    },

    review: async (achievementId, status, approvedByStaffId) => {
        const [rows] = await db.query(
            'CALL sp_ApproveOrModifyAchievement(?, ?, ?)',
            [achievementId, status, approvedByStaffId]
        );
        return { rows_affected: rows[0][0].rows_affected };
    },

    getAllForSchool: async ({ school_id, category, search_query, limit, offset }) => {
        const [rows] = await db.query(
            'CALL sp_GetSchoolAchievements(?, ?, ?, ?, ?)',
            [school_id, category || null, search_query || null, parseInt(limit, 10) || 10, parseInt(offset, 10) || 0]
        );
        return rows[0] || [];
    },

    getStudentPortfolio: async (studentId) => {
        const [rows] = await db.query('CALL sp_GetStudentAchievements(?)', [studentId]);

        return (rows[0] || []).map(row => ({
            ...row,
            image_urls: typeof row.image_urls === 'string' ? JSON.parse(row.image_urls) : row.image_urls
        }));
    },

   delete: async (achievementId) => {
        await db.query(
            'CALL sp_DeleteAchievement(?, @p_success, @p_message)',
            [achievementId]
        );
        const [rows] = await db.query(
            'SELECT @p_success AS success, @p_message AS message'
        );
        return rows[0];
    }
};

module.exports = AchievementModel;