const db = require('../config/db');

const FeeStructureModel = {
    createWithComponents: async (structureData, componentsArray) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [structRows] = await connection.query(
                'CALL sp_CreateFeeStructure(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    structureData.school_id, structureData.batch_id, structureData.academic_year_id,
                    structureData.total_amount, structureData.due_date, JSON.stringify(structureData.late_fee_rules),
                    structureData.payment_type, structureData.no_of_installments, structureData.status, structureData.created_by
                ]
            );

            const feeStructureId = structRows[0][0].new_fee_structure_id;

            for (const comp of componentsArray) {
                await connection.query(
                    'CALL sp_AddFeeComponent(?, ?, ?, ?, ?, ?)',
                    [feeStructureId, comp.component_name, comp.amount, comp.tax_percentage || null, comp.status || 'Active', structureData.created_by]
                );
            }

            await connection.commit();
            return { fee_structure_id: feeStructureId };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    
    updateWithComponents: async (id, schoolId, structureData, componentsArray) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            await connection.query(
                'CALL sp_UpdateFeeStructure(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    id, schoolId, structureData.batch_id, structureData.academic_year_id,
                    structureData.total_amount, structureData.due_date, JSON.stringify(structureData.late_fee_rules),
                    structureData.payment_type, structureData.no_of_installments, structureData.status, structureData.updated_by
                ]
            );

            await connection.query('CALL sp_DeleteFeeComponentsByStructure(?)', [id]);

            for (const comp of componentsArray) {
                await connection.query(
                    'CALL sp_AddFeeComponent(?, ?, ?, ?, ?, ?)',
                    [id, comp.component_name, comp.amount, comp.tax_percentage || null, comp.status || 'Active', structureData.updated_by]
                );
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    getById: async (id, schoolId) => {
        const [rows] = await db.query('CALL sp_GetFeeStructureById(?,?)', [id, schoolId]);
        return {
            structure: rows[0][0] || null,
            components: rows[1] || []
        };
    },

    getAll: async (schoolId, academicYearId = null) => {
        const [rows] = await db.query('CALL sp_GetAllFeeStructures(?,?)', [schoolId, academicYearId]);
        return rows[0];
    },

    delete: async (id, schoolId) => {
        await db.query('CALL sp_DeleteFeeStructure(?,?)', [id, schoolId]);
        return true;
    }
};

module.exports = FeeStructureModel;