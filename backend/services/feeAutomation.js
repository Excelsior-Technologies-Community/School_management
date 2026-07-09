const cron = require('node-cron');
const db = require('../config/db.js');

cron.schedule('0 0 * * *', async () => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // STEP 1: Automatically transition ALL passed deadlines to 'Overdue'
        const [statusUpdateResult] = await connection.query(`
            UPDATE tbl_fee_installments
            SET installment_status = 'Overdue'
            WHERE installment_status = 'Pending'
              AND due_date < CURDATE()
              AND status = 'Active'
        `);
        
        if (statusUpdateResult.affectedRows > 0) {
            console.log(`[Automation Worker] Marked ${statusUpdateResult.affectedRows} installments as Overdue.`);
        }

        // STEP 2: Fetch Overdue records to process dynamic JavaScript rule matrices
        const [overdueInstallments] = await connection.query(`
            SELECT 
                fi.installment_id, 
                fi.due_date, 
                fi.discounted_amount,
                fi.late_fee_accumulated,
                fs.late_fee_rules
            FROM tbl_fee_installments fi
            INNER JOIN tbl_fee_structure fs ON fi.fee_structure_id = fs.fee_structure_id
            WHERE fi.installment_status = 'Overdue'
              AND fi.status = 'Active'
              AND fs.late_fee_rules IS NOT NULL
        `);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let modifiedRowsCount = 0;

        for (const inst of overdueInstallments) {
            const dueDate = new Date(inst.due_date);
            dueDate.setHours(0, 0, 0, 0);

            // Safely parse the dynamic JSON block
            let rules = typeof inst.late_fee_rules === 'string' 
                ? JSON.parse(inst.late_fee_rules) 
                : inst.late_fee_rules;

            if (!rules || !rules.type) continue;

            const graceDays = parseInt(rules.grace_days || 0);
            const penaltyMetricValue = parseFloat(rules.value || 0);
            const originalAccumulatedFee = parseFloat(inst.late_fee_accumulated || 0);
            let calculatedLateFee = originalAccumulatedFee;

            // Calculate exact date when the grace window expires
            const graceExpiryDate = new Date(dueDate);
            graceExpiryDate.setDate(graceExpiryDate.getDate() + graceDays);

            // Only run penalty math if current date has breached the grace period window
            if (today > graceExpiryDate) {
                
                if (rules.type === 'Fixed') {
                    // One-time fixed flat fee
                    if (originalAccumulatedFee === 0) {
                        calculatedLateFee = penaltyMetricValue;
                    }
                } 
                else if (rules.type === 'Percentage') {
                    // Percentage of the net amount owed
                    if (originalAccumulatedFee === 0) {
                        const baseAmount = parseFloat(inst.discounted_amount || 0);
                        calculatedLateFee = (baseAmount * penaltyMetricValue) / 100;
                    }
                } 
                else if (rules.type === 'Daily') {
                    // Daily compounding increment charge
                    // Calculate late days starting right after the grace period ends
                    const msPerDay = 24 * 60 * 60 * 1000;
                    const lateDaysCount = Math.floor((today - graceExpiryDate) / msPerDay);
                    
                    if (lateDaysCount > 0) {
                        calculatedLateFee = lateDaysCount * penaltyMetricValue;
                    }
                }
            }

            // Only issue an update query if the fee amount has actually changed
            if (calculatedLateFee !== originalAccumulatedFee) {
                await connection.query(`
                    UPDATE tbl_fee_installments
                    SET late_fee_accumulated = ?
                    WHERE installment_id = ?
                `, [calculatedLateFee, inst.installment_id]);
                
                modifiedRowsCount++;
            }
        }

        if (modifiedRowsCount > 0) {
            console.log(`[Automation Worker] Recalculated dynamic late fees for ${modifiedRowsCount} installments.`);
        }

        await connection.commit();
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('[Automation Worker Error] Dynamic rule check calculation failed:', error);
    } finally {
        if (connection) connection.release();
    }
});