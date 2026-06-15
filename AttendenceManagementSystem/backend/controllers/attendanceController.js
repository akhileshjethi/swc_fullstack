const db = require('../db');

const getAttendance = (req, res) => {

    const query = `
        SELECT
            a.attendance_id,
            s.roll_no,
            CONCAT(s.first_name,' ',s.last_name) AS student_name,
            c.course_name,
            a.attendance_date,
            a.status
        FROM attendance a
        JOIN students s ON a.student_id = s.student_id
        JOIN courses c ON a.course_id = c.course_id
    `;

    db.query(query, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });
    });
};

const markAttendance = (req, res) => {

    const {
        student_id,
        course_id,
        attendance_date,
        status
    } = req.body;

    const query = `
        INSERT INTO attendance
        (student_id, course_id, attendance_date, status)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        query,
        [student_id, course_id, attendance_date, status],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: 'Attendance Marked Successfully'
            });
        }
    );
};

module.exports = {
    getAttendance,
    markAttendance
};