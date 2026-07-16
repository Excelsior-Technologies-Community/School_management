const db = require('../config/db')

const AdmissionModel = {
    createInquiry: async (schoolId, staffId, data) => {
        const [result] = await db.query(
            `CALL sp_CreateAdmissionInquiry(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_inserted_id);`,
            [
                schoolId, data.academic_year_id, data.date_of_inquiry, data.program_of_interest_class_id,
                data.school_board_id, data.school_medium_id, data.branch_id, data.preferred_start_date || null,
                data.inquiry_source, data.assigned_to_staff_id || null, data.previous_education || null,
                data.name, data.email || null, data.phone_number, data.date_of_birth || null,
                data.gender || null, data.blood_group || null, data.address || null, data.pincode || null,
                data.emergency_contact_number || null,
                JSON.stringify(data.documents || []),
                JSON.stringify(data.inquiry_parent_details || {}),
                staffId
            ]
        );

        const [outputVar] = await db.query('SELECT @p_inserted_id AS inserted_id');
        return outputVar[0].inserted_id;
    },

    updateInquiry: async (id, staffId, data) => {
        await db.query(
            `CALL sp_UpdateAdmissionInquiry( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, data.academic_year_id, data.program_of_interest_class_id, data.school_board_id,
                data.school_medium_id, data.branch_id, data.preferred_start_date || null, data.inquiry_source,
                data.inquiry_status, data.assigned_to_staff_id || null, data.previous_education || null,
                data.name, data.email || null, data.phone_number, data.date_of_birth || null,
                data.gender || null, data.blood_group || null, data.address || null, data.pincode || null,
                data.emergency_contact_number || null,
                JSON.stringify(data.documents || []),
                JSON.stringify(data.inquiry_parent_details || {}),
                data.status || 'Active',
                staffId
            ]
        )
    },

    getInquiriesList: async (filters) => {
        const [result] = await db.query(
            'CALL sp_GetAdmissionInquiriesList(?, ?, ?, ?)',
            [
                filters.school_id,
                filters.branch_id || null,
                filters.academic_year_id || null,
                filters.inquiry_status || null
            ]
        );
        return result[0];
    },

    getInquiryDetails: async (id) => {
        const [result] = await db.query('CALL sp_GetAdmissionInquiryDetails(?)', [id]);

        const inquiryProfile = result[0][0] || null;
        const followUpTimeline = result[1] || [];

        return { inquiryProfile, followUpTimeline };
    },

    createFollowUp: async (staffId, data) => {
        await db.query(
            'CALL sp_CreateAdmissionFollowUp(?, ?, ?, ?, ?, ?, ?, @p_inserted_id)',
            [
                data.inquiry_id, data.follow_up_date, data.next_follow_up_date || null,
                data.response_status, data.notes || null, staffId, staffId
            ]
        );
        const [outputVar] = await db.query('SELECT @p_inserted_id AS inserted_id');
        return outputVar[0].inserted_id;
    },

    getFollowUpsByInquiryId: async (inquiryId) => {
        const [result] = await db.query('CALL sp_GetFollowUpsByInquiryId(?)', [inquiryId]);
        return result[0];
    },

    updateStatus: async (id, schoolId, inquiryStatus, staffId) => {
        const [result] = await db.query(
            'CALL sp_UpdateAdmissionInquiryStatus(?, ?, ?, ?)',
            [id, schoolId, inquiryStatus, staffId]
        );
        return result[0][0];
    }
};

module.exports = AdmissionModel;