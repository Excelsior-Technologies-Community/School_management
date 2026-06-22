const { SchoolPeriodModel, TimeTableModel, SubstitutionModel } = require('../models/timetableModel')

const getPeriods = async (req, res) => {
    try {
        const { branch_id } = req.query;
        if (!branch_id) return res.status(400).json({ success: false, message: 'branch_id query param required.' });

        const periods = await SchoolPeriodModel.getAll(branch_id);
        return res.status(200).json({ success: true, data: periods });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createPeriod = async (req, res) => {
    try {
        const { branch_id, period_no, start_time, end_time, status } = req.body;
        if (!branch_id || !period_no || !start_time || !end_time) {
            return res.json({ success: false, message: 'All fields are required.' })
        }

        const newPeriod = await SchoolPeriodModel.create(req.user.school_id, req.user.id, { branch_id, period_no, start_time, end_time, status });
        return res.status(201).json({ success: true, message: 'School period created.' })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const updatePeriod = async (req, res) => {
    try {
        const { id } = req.params;
        const { period_no, start_time, end_time, status } = req.body;

        const exists = await SchoolPeriodModel.getById(id);
        if (!exists) return res.status(400).json({ success: false, message: 'Period not found.' });

        const updated = await SchoolPeriodModel.update(id, req.user.id, { period_no, start_time, end_time, status });
        return res.status(200).json({ success: true, message: 'Period updated successfully.', data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const togglePeriodStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await SchoolPeriodModel.toggleStatus(id, req.user.id);
        return res.status(200).json({ success: true, message: 'Period availability changed.', data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deletePeriod = async (req, res) => {
    try {
        const { id } = req.params;
        await SchoolPeriodModel.delete(id);
        return res.status(200).json({ success: true, message: 'Period dropped from configurations.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getTimeTableByBatch = async (req, res) => {
    try {
        const { batch_id } = req.params;
        const schedule = await TimeTableModel.getByBatch(batch_id);
        return res.status(200).json({ success: true, data: schedule });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createTimeTableEntry = async (req, res) => {
    try {
        const { batch_id, period_id, school_subject_id, teacher_id, day_of_week, room_no, status } = req.body;

        if (!batch_id || !period_id || !school_subject_id || !teacher_id || !day_of_week) {
            return res.status(400).json({ success: false, message: 'Missing structural parameters.' });
        }

        const targetPeriod = await SchoolPeriodModel.getById(period_id);
        if (!targetPeriod) return res.status(404).json({ success: false, message: 'Selected school period not found.' });

        const duration_minutes = targetPeriod.slot_duration;

        const newEntry = await TimeTableModel.create(req.user.id, {
            batch_id, period_id, school_subject_id, teacher_id, day_of_week, duration_minutes, room_no, status
        });

        return res.status(201).json({ success: true, message: 'Timetable matrix updated successfully.', data: newEntry });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Schedule allocation clash detected. Teacher or Batch is already assigned to this slot.' });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateTimeTableEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { batch_id, period_id, school_subject_id, teacher_id, day_of_week, room_no, status } = req.body;

        const exists = await TimeTableModel.getById(id);
        if (!exists) return res.status(404).json({ success: false, message: 'Timetable index row not found.' });

        const targetPeriod = await SchoolPeriodModel.getById(period_id);
        const duration_minutes = targetPeriod ? targetPeriod.slot_duration : exists.duration_minutes;

        const updated = await TimeTableModel.update(id, req.user.id, {
            batch_id, period_id, school_subject_id, teacher_id, day_of_week, duration_minutes, room_no, status
        });

        return res.status(200).json({ success: true, message: 'Matrix row updated cleanly.', data: updated });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Schedule conflict triggered during parameters adjustment.' });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteTimeTableEntry = async (req, res) => {
    try {
        const { id } = req.params;
        await TimeTableModel.delete(id);
        return res.status(200).json({ success: true, message: 'Timetable entry wiped successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getSubstitutions = async (req, res) => {
    try {
        const { branch_id, date } = req.query;
        if (!branch_id || !date) return res.status(400).json({ success: false, message: 'branch_id and date parameters required.' });

        const activeSubstitutions = await SubstitutionModel.getByDate(branch_id, date);
        return res.status(200).json({ success: true, data: activeSubstitutions });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createSubstitution = async (req, res) => {
    try {
        const { time_table_id, substitute_teacher_id, substitution_date, reason, remark, status } = req.body;

        if (!time_table_id || !substitute_teacher_id || !substitution_date) {
            return res.status(400).json({ success: false, message: 'Required details missing.' });
        }

        const targetSlot = await TimeTableModel.getById(time_table_id);
        if (!targetSlot) return res.status(404).json({ success: false, message: 'Referenced basic timetable slot entry not found.' });

        const original_teacher_id = targetSlot.teacher_id;

        if (parseInt(substitute_teacher_id) === parseInt(original_teacher_id)) {
            return res.status(400).json({ success: false, message: 'Substitute teacher cannot match the original instructor.' });
        }
        const newSubstitution = await SubstitutionModel.create(req.user.id, {
            time_table_id, original_teacher_id, substitute_teacher_id, substitution_date, reason, remark, status
        });

        return res.status(201).json({ success: true, message: 'Teacher substitution logged successfully.', data: newSubstitution });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteSubstitution = async (req, res) => {
    try {
        const { id } = req.params;
        await SubstitutionModel.delete(id);
        return res.status(200).json({ success: true, message: 'Substitution log tracking detached successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getActiveDates = async (req, res) => {
    try {
        const { branch_id } = req.query;
        if (!branch_id) return res.status(400).json({ success: false, message: 'branch_id query parameter required.' });

        const dates = await SubstitutionModel.getActiveDates(branch_id);
        return res.status(200).json({ success: true, dates });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getTimetableByTeacher = async (req, res) => {
    try {
        const teacherId = req.user.id;

        if (!teacherId) {
            return res.status(400).json({ success: false, message: "Teacher id missing." });
        }

        const rows = await TimeTableModel.getStaffTimetable(teacherId);
        return res.status(200).json({ success: true, count: rows.length, data: rows });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getPeriods, createPeriod, updatePeriod, togglePeriodStatus, deletePeriod,
    getTimeTableByBatch, createTimeTableEntry, updateTimeTableEntry, deleteTimeTableEntry,
    getSubstitutions, createSubstitution, deleteSubstitution,
    getActiveDates,
    getTimetableByTeacher
};