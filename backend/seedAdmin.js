const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function seedSuperAdmin() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const email = 'super@system.com';
    const password = 'superadmin123';
    const name = 'Main Super Admin';
    const department = 'Super-Admin';

    try {
        //  Fetch the ID for the 'super_admin' role
        const [roles] = await db.execute(
            'SELECT id FROM roles WHERE role_name = ? LIMIT 1',
            ['super_admin']
        );

        if (roles.length === 0) {
            throw new Error("Could not find super_admin role ID.");
        }
        const superAdminRoleId = roles[0].id;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert Super Admin into staff table
        const insertQuery = `
            INSERT INTO staff (school_id, role_id, name, email, password, department) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        await db.execute(insertQuery, [null, superAdminRoleId, name, email, hashedPassword, department]);

        console.log("Super Admin Seeded Successfully!");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (err) {
        console.error("Seeding failed:", err.message);
    } finally {
        await db.end();
    }
}

seedSuperAdmin();