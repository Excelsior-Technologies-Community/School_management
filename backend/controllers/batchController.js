const BatchModel = require('../models/batchModel')

const CreateGlobalClass = async (req, res) => {
    try {
        const { class_name } = req.body;

        if (!class_name) {
            return res.status(400).json({ success: false, message: 'Class name required.' })
        }

        const data = await BatchModel.createGlobalClass(class_name);
        return res.status(201).json({ success: true, message: data.message, class_id: data.class_id })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const getGlobalClasses = async (req, res) => {
    try {
        const data = await BatchModel.getAllGloabalClasses();
        return res.status(200).json({ success: true, data })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const createSchoolClass = async (req, res) => {
    try {
        const { class_id } = req.body;
        const school_id = req.user?.school_id;

        if (!class_id) {
            return res.status(400).json({ success: false, message: 'Class name required.' })
        }

        const data = await BatchModel.selectSchoolClass(school_id, class_id);
        return res.status(201).json({ success: true, message: data.message, school_class_id: data.school_class_id })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const listSchoolClassses = async (req, res) => {
    try {
        const school_id = req.user?.school_id;

        const data = await BatchModel.getSchoolClasses(school_id);
        return res.status(200).json({ success: true, data })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const deleteSchoolClass = async (req, res) => {
    try {
        const { id } = req.params;
        const school_id = req.user?.school_id;

        const data = await BatchModel.removeSchoolClass(id, school_id)
        return res.status(200).json({ success: true, message: data.message })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const addSection = async (req, res) => {
    try {
        const { section_name } = req.body;
        const school_id = req.user?.school_id;

        const data = await BatchModel.createSection(school_id, section_name);
        return res.status(201).json({ success: true, message: data.message, section_id: data.section_id })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const listSchoolSections = async (req, res) => {
    try {
        const school_id = req.user?.school_id;

        const data = await BatchModel.getSchoolSection(school_id);
        return res.status(200).json({ success: true, data })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const updateSchoolSection = async (req, res) => {
    try {
        const { id } = req.params;
        const { new_section_name } = req.body;
        const school_id = req.user?.school_id;

        if (!new_section_name) {
            return res.status(400).json({ success: false, message: 'New modified name needed.' })
        }

        const data = await BatchModel.updateSection(id, school_id, new_section_name);
        return res.status(200).json({ success: true, message: data.message })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const removeSection = async (req, res) => {
    try {
        const { id } = req.params;
        const school_id = req.user?.school_id;

        const data = await BatchModel.deleteSection(id, school_id);
        return res.status(200).json({ success: true, message: data.message })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}



const addBatch = async (req, res) => {
    try {
        const { branch_id, school_class_id, section_id, academic_year } = req.body;
        const school_id = req.user?.school_id;

        if (!branch_id || !school_class_id || !section_id || !academic_year) {
            return res.status(400).json({ success: false, message: 'Missing field values.' });
        }

        const data = await BatchModel.createBatch(school_id, branch_id, school_class_id, section_id, academic_year);
        return res.status(201).json({ success: true, message: data.message, batch_id: data.batch_id });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const listSchoolBatches = async (req, res) => {
    try {
        const school_id = req.user?.school_id;

        const data = await BatchModel.getSchoolBatches(school_id);
        return res.status(200).json({ success: true, data })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const updateSchoolBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { branch_id, school_class_id, section_id, academic_year } = req.body;
        const school_id = req.user?.school_id;

        if (!branch_id || !school_class_id || !section_id || !academic_year) {
            return res.status(400).json({ success: false, message: 'Missing field values for updates.' });
        }

        const data = await BatchModel.updateBatch(id, school_id, branch_id, school_class_id, section_id, academic_year);
        return res.status(200).json({ success: true, message: data.message });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const removeBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const school_id = req.user?.school_id;

        const data = await BatchModel.deleteBatch(id, school_id);
        return res.status(200).json({ success: true, message: data.message })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const toggleBatchStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: 'Batch ID parameter is required.' });
        }

        const updatedBatch = await BatchModel.toggleStatus(id);

        if (!updatedBatch) {
            return res.status(404).json({
                success: false,
                message: 'Target batch record not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: `Batch status updated to ${updatedBatch.status}.`,
            data: updatedBatch
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    CreateGlobalClass, getGlobalClasses,
    createSchoolClass, listSchoolClassses, deleteSchoolClass,
    addSection, updateSchoolSection, removeSection, listSchoolSections,
    addBatch, listSchoolBatches, updateSchoolBatch, removeBatch,
    toggleBatchStatus
};