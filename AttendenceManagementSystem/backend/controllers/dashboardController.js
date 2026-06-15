const db = require('../db');

const getDashboardData = async (req, res) => {

    try {

        db.query(
            `SELECT COUNT(*) AS totalStudents FROM students`,
            (err1, studentsResult) => {

                if (err1) return res.status(500).json(err1);

                db.query(
                    `SELECT COUNT(*) AS totalCourses FROM courses`,
                    (err2, coursesResult) => {

                        if (err2) return res.status(500).json(err2);

                        db.query(
                            `SELECT COUNT(*) AS totalAttendance FROM attendance`,
                            (err3, attendanceResult) => {

                                if (err3) return res.status(500).json(err3);

                                db.query(
                                    `
                                    SELECT
                                    ROUND(
                                        (
                                            SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END)
                                            /
                                            COUNT(*)
                                        ) * 100,
                                        2
                                    ) AS presentPercentage
                                    FROM attendance
                                    `,
                                    (err4, percentageResult) => {

                                        if (err4)
                                            return res.status(500).json(err4);

                                        res.status(200).json({
                                            success: true,
                                            totalStudents:
                                                studentsResult[0].totalStudents,

                                            totalCourses:
                                                coursesResult[0].totalCourses,

                                            totalAttendance:
                                                attendanceResult[0].totalAttendance,

                                            presentPercentage:
                                                percentageResult[0]
                                                    .presentPercentage
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getDashboardData
};