require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const dashboardRoutes =
require('./routes/dashboardRoutes');

app.use(cors());
app.use(express.json());

const db = require('./db');

app.get('/', (req, res) => {
    res.send('Attendance Management System Backend Running');
});

app.use('/students', studentRoutes);
app.use('/courses', facultyRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/dashboard', dashboardRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});