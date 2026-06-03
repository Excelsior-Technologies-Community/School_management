const express = require('express');
const mysql = require('mysql2')
const cors = require('cors')
require('dotenv').config();

// swagger imports
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const authRoutes = require('./routes/authRoutes')
const superAdminRoutes = require('./routes/superAdminRoutes')
const schoolAdminRoutes = require('./routes/schoolAdminRoutes')
const BatchRoutes = require('./routes/batchRoutes')

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});