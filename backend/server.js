const express = require('express');
const mysql = require('mysql2')
const cors = require('cors')
require('dotenv').config();

require('./services/feeAutomation.js');

// swagger imports
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const authRoutes = require('./routes/authRoutes')
const superAdminRoutes = require('./routes/superAdminRoutes')
const schoolAdminRoutes = require('./routes/schoolAdminRoutes')
const BatchRoutes = require('./routes/batchRoutes')
const academicRoutes = require('./routes/academicRoutes')
const timetableRoutes = require('./routes/timetableRoutes')
const homeworkRoutes = require('./routes/homeworkRoutes')
const mediumRoutes = require('./routes/mediumRoutes')
const boardRoutes = require('./routes/boardRoutes')
const examRoutes = require('./routes/examRoutes')
const academicYearRoutes = require('./routes/academicYearRoutes')
const feeStructureRoutes = require('./routes/feeStructureRoutes')
const feeOperationRoutes = require('./routes/feeOperationRoutes')
const achievementRoutes = require('./routes/achievementRoutes')
const batchNoteRoutes = require('./routes/batchNotesRoutes.js')

const app = express();

app.use(cors());
app.use(express.json());

// Mount Swagger UI dashboard
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// api endpoints 
app.use('/api/auth', authRoutes);
app.use('/api/super', superAdminRoutes)
app.use('/api/school', schoolAdminRoutes)
app.use('/api/batch', BatchRoutes)
app.use('/api/academic', academicRoutes)
app.use('/api/timetable', timetableRoutes)
app.use('/api/homework', homeworkRoutes)
app.use('/api/medium', mediumRoutes)
app.use('/api/board', boardRoutes)
app.use('/api/exam', examRoutes)
app.use('/api/academicyear', academicYearRoutes)
app.use('/api/fee', feeStructureRoutes)
app.use('/api/fees', feeOperationRoutes)
app.use('/api/achievements', achievementRoutes)
app.use('/api/batchnote',batchNoteRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});