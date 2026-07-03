const AcademicYearModel = require('../models/academicYearModel')

const createAcademicYear = async (req, res) => {
    try {
        const { branch_id, academic_year_name, semester, start_date, end_date, is_current, status } = req.body;
        const school_id = req.user.school_id;
        const created_by = req.user.id;

        const result = await AcademicYearModel.createYear({
            school_id, branch_id, academic_year_name, semester, start_date, end_date, is_current, status, created_by
        });

        return res.status(201).json({ success: true, message: "Academic year created successfully.", data: result });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const getAllAcademicYears = async (req, res) => {
    try {
        const { branch_id } = req.query;
        const school_id = req.user.school_id;

        if (!branch_id) return res.status(400).json({ success: false, message: "branch_id query parameter is required." });

        const data = await AcademicYearModel.getAllYears(school_id, branch_id);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const getAcademicYearById = async (req, res) => {
    try {
        const { id } = req.params;
        const school_id = req.user.school_id;

        const data = await AcademicYearModel.getYearById(id, school_id);
        if (!data) return res.status(400).json({ success: false, message: "Academic Year not found." })

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const updateAcademicYear = async (req, res) => {
    try {
        const { id } = req.params;
        const { branch_id, academic_year_name, semester, start_date, end_date, is_current, status } = req.body;
        const school_id = req.user.school_id;
        const updated_by = req.user.id;

        await AcademicYearModel.updateYear(id, {
            school_id, branch_id, academic_year_name, semester, start_date, end_date, is_current, status, updated_by
        });

        return res.status(200).json({ success: true, message: 'Academic year updated successfully.' });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const deleteAcademicYear = async (req, res) => {
    try {
        const { id } = req.params;
        const school_id = req.user.school_id;

        await AcademicYearModel.deleteYear(id, school_id);
        return res.status(200).json({ success: true, message: 'Academic year dropped successffully.' })

    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const createAcademicSession = async (req, res) => {
    try {
        const { academic_year_id, session_name, session_number, start_date, end_date, is_current, status } = req.body;
        const created_by = req.user.id;

        const result = await AcademicYearModel.createSession({
            academic_year_id, session_name, session_number, start_date, end_date, is_current, status, created_by
        });

        return res.status(201).json({ success: true, message: "Session created successfully.", data: result });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const getSessionsByAcademicYear = async (req, res) => {
    try {
        const { academicYearId } = req.params;
        const data = await AcademicYearModel.getSessionByYear(academicYearId);
        return res.status(200).json({ success: true, data })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const getAcademicSessionById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await AcademicYearModel.getSessionById(id);
        if (!data) return res.status(404).json({ success: false, message: "Session not found." });

        return res.status(200).json({ success: true, data })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const updateAcademicSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { academic_year_id, session_name, session_number, start_date, end_date, is_current, status } = req.body;
        const updated_by = req.user.id;

        await AcademicYearModel.updateSession(id, {
            academic_year_id, session_name, session_number, start_date, end_date, is_current, status, updated_by
        });

        return res.status(200).json({ success: true, message: "Session updated successfully." });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const deleteAcademicSession = async (req, res) => {
    try {
        const { id } = req.params;
        await AcademicYearModel.deleteSession(id);
        return res.status(200).json({ success: true, message: "Session deleted successfully." });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createAcademicYear, getAllAcademicYears, getAcademicYearById, updateAcademicYear, deleteAcademicYear,
    createAcademicSession, getSessionsByAcademicYear, getAcademicSessionById, updateAcademicSession, deleteAcademicSession
}