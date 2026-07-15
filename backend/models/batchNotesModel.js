const db = require('../config/db')

const BatchNotesModel = {
    manageBatchNote: async (noteData) => {
        const [rows] = await db.query(
            'CALL sp_ManageBatchNote(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                noteData.action,
                noteData.note_id || null,
                noteData.school_id || null,
                noteData.batch_id || null,
                noteData.teacher_id || null,
                noteData.note_date || null,
                noteData.title || null,
                noteData.content || null,
                noteData.attachments ? JSON.stringify(noteData.attachments) : null,
                noteData.homework_id || null,
                noteData.is_visible_to_students !== undefined ? noteData.is_visible_to_students : null,
                noteData.status || null,
                noteData.user_id
            ]
        );
        return rows[0][0];
    },

    getStudentBatchNotes: async (schoolId, batchId) => {
        const [rows] = await db.query(
            'CALL sp_GetStudentBatchNotes(?,?)', [schoolId, batchId]
        );

        return (rows[0] || []).map(row => ({
            ...row,
            attachments: typeof row.attachments === 'string' ? JSON.parse(row.attachments) : row.attachments
        }));
    },

    getStaffBatchNotes: async (schoolId, batchId, status) => {
        const [rows] = await db.query(
            'CALL sp_GetStaffBatchNotes(?, ?, ?)',
            [schoolId, batchId || null, status || null]
            
        );

        return (rows[0] || []).map(row => ({
            ...row,
            attachments: typeof row.attachments === 'string' ? JSON.parse(row.attachments) : row.attachments
        }));
    }
}

module.exports = BatchNotesModel;