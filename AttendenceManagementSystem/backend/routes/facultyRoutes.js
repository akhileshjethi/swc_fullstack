const express = require('express');
const router = express.Router();

const {
    getAllCourses
} = require('../controllers/facultyController');

router.get('/', getAllCourses);

module.exports = router;