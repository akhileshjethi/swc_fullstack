const db = require('../db');

const getAllStudents = (req, res) => {
    const query = 'SELECT * FROM students';

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

module.exports = {
    getAllStudents
};