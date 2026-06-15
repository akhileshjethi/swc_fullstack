DELIMITER $$

CREATE TRIGGER prevent_duplicate_attendance

BEFORE INSERT ON attendance

FOR EACH ROW

BEGIN

IF EXISTS (

SELECT 1
FROM attendance

WHERE student_id = NEW.student_id
AND course_id = NEW.course_id
AND attendance_date = NEW.attendance_date

)

THEN

SIGNAL SQLSTATE '45000'
SET MESSAGE_TEXT='Duplicate attendance not allowed';

END IF;

END $$

DELIMITER ;