const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const moment = require('moment');
const User = require('../models/User');
const Response = require('../models/bcountmodel');
const { Mongoose, default: mongoose } = require('mongoose');
const formatDate = (date) => moment(date).format('YYYY/MM/DD');
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName,rollNumber,
        age,group,phoneNumber,dateOfBirth,collegeName,address,year,gender
       } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      rollNumber,
      age,
     group,
     phoneNumber,
     dateOfBirth,
     collegeName,
     address,
     year,
     gender
     
    });

    // Save the user to the database
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid  password' });
    }

    const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

    res.status(200).json({id:user._id ,token, "isAdmin":"false" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find({},'-password');
      const formattedStudents = users.map(student => ({
        ...student.toObject(),
        attendance: student.attendance.map(entry => ({ ...entry.toObject(), date: formatDate(entry.date) })),
      }));
      const maleUsers = users.filter(user => user.gender === 'M');
    const femaleUsers = users.filter(user => user.gender === 'F');

    const maleCount = maleUsers.length;
    const femaleCount = femaleUsers.length;
    const totalCount = users.length;
      res.status(200).json({
        // users: users,
        maleCount,
        femaleCount,
        totalCount,
        formattedStudents
      })  ;
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to retrieve all users' });
    }
  };
  exports.getOneUser = async (req, res) => {
    try {
      const studentId = req.params.studentId;
      
      if (mongoose.Types.ObjectId.isValid(studentId)) {
        const student = await User.findById(studentId);
        const presentCount = student.attendance.filter(entry => entry.present).length;
        const absentCount = student.attendance.length - presentCount;
    
        // Format the date in the response
        const formattedStudent = {
          ...student.toObject(),
          attendance: student.attendance.map(entry => ({ ...entry.toObject(), date: formatDate(entry.date) })),
        };
    
        res.status(200).json({ student: formattedStudent, presentCount, absentCount });
      } else {
        // Handle the case where the ID is not valid
        res.status(400).json({ message: 'Invalid user ID' });
      }
      // const student = await User.findById(studentId);
  
      // if (!student) {
      //   return res.status(404).json({ message: 'Student not found' });
      // }
  
      // Count present and absent entries
    
    } catch (error) {
      console.error('Error fetching student details:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
    };
    exports.updateUser = async (req, res) => {
      try {
        const userId = req.params.userId;
        const updateData = req.body;
    
        // Update user details in the database
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    
        if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
        };
        
        exports.usercount = async(req,res) =>{
          try {
            const { answer,group,year,firstName } = req.body;
        
            // Save the response to MongoDB
            await Response.create({ answer,group,year,firstName});
        
            res.status(201).json({ message: 'Response saved successfully.'});
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
        };
exports.studentAttendence = async(req ,res) =>{
  try {
    const { studentId, present } = req.body;
    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.attendance.push({ present });
    await student.save();

    // Format the date in the response
    const formattedStudent = {
      ...student.toObject(),
      attendance: student.attendance.map(entry => ({ ...entry.toObject(), date: formatDate(entry.date) })),
    };

    res.status(200).json({ message: 'Attendance recorded successfully', student: formattedStudent });
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
exports.attendanceCount = async(req,res)=>{
  try {
    const requestedDate = new Date(req.params.date);
    const nextDate = new Date(requestedDate);
    nextDate.setDate(requestedDate.getDate() + 1);

    const users = await User.find({
      'attendance.date': { $gte: requestedDate, $lt: nextDate },
    });

    const presentCount = users.reduce((count, user) => {
      const attendanceRecord = user.attendance.find(record => record.date >= requestedDate && record.date < nextDate);
      if (attendanceRecord && attendanceRecord.present) {
        return count + 1;
      }
      return count;
    }, 0);

    const absentCount = users.length - presentCount;

    res.json({
      attendanceRecords: users.map(user => ({
        existingUserId: user.existingUserId,
        attendance: user.attendance.find(record => record.date >= requestedDate && record.date < nextDate) || { present: false }
      })),
      users,
      presentCount,
      absentCount,
      totalCount: users.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }

  
}  