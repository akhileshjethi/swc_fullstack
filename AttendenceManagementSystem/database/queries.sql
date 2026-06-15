CREATE INDEX idx_attendance_student
ON attendance(student_id);

CREATE INDEX idx_attendance_course
ON attendance(course_id);

CREATE INDEX idx_attendance_date
ON attendance(attendance_date);