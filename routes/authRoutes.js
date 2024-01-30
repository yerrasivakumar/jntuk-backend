const express = require('express');
const authController = require('../controllers/authController');
const authUtils = require('../utils/authUtils');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
    router.get('/AlluserDetails', authController.getAllUsers);

    router.get('/students/:studentId', authController.getOneUser);
router.put('/:userId',authController.updateUser); 

router.post('/count', authController.usercount);
router.post('/attendance', authController.studentAttendence);
router.get('/attendance/:date', authController.attendanceCount);

module.exports = router;
