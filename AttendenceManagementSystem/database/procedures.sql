DELIMITER $$

CREATE PROCEDURE GetStudentAttendance(
    IN p_student_id INT
)
BEGIN

SELECT
    s.student_id,
    s.roll_no,
    CONCAT(s.first_name,' ',s.last_name) AS student_name,
    c.course_name,
    a.attendance_date,
    a.status

FROM attendance a
JOIN students s
ON a.student_id=s.student_id

JOIN courses c
ON a.course_id=c.course_id

WHERE s.student_id=p_student_id;

END $$

DELIMITER ;
