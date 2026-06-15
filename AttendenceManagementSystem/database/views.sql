USE attendance_management;

CREATE VIEW student_attendance_percentage AS
SELECT
    s.student_id,
    s.roll_no,
    CONCAT(s.first_name,' ',s.last_name) AS student_name,

    ROUND(
        (SUM(CASE WHEN a.status='Present' THEN 1 ELSE 0 END)
        / COUNT(a.attendance_id))*100,
        2
    ) AS attendance_percentage

FROM students s
JOIN attendance a
ON s.student_id = a.student_id

GROUP BY s.student_id;

CREATE VIEW defaulter_students AS
SELECT *
FROM student_attendance_percentage
WHERE attendance_percentage < 75;

