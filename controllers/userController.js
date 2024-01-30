const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Response = require('../models/bcountmodel')
const Admin = require('../models/Admin')
const Image = require('../models/Image')

 // exports.getUserDetails = async (req, res) => {
//   try {
//     const userId = req.user.userId; // Extracted from the JWT token

//     // Retrieve user details from the database
//     const user =  await User.find({},'-password')

//     // if (!user) {
//     //   return res.status(404).json({ message: 'User not found' });
//     // }

//     res.status(200).json({ user });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


// const User1 = require('../models/User');

// exports.getOneUser = async (req, res) => {
//   try {
//     const userId = req.params.userId;

//     // Retrieve user details from the database
//     const user = await User1.findById(userId).select('-password');

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.status(200).json({ user });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// exports.updateUser = async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const updateData = req.body;

//     // Update user details in the database
//     const updatedUser = await User1.findByIdAndUpdate(userId, updateData, { new: true });

//     if (!updatedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.status(200).json({ message: 'User updated successfully', user: updatedUser });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


exports.totalcount = async (req ,res) =>{
    try {
    //   console.log('sss',count);
      const userCounts = await Response.find();
    const yesCount = userCounts.filter((count) => count.answer === 'yes').length;
    const noCount = userCounts.filter((count) => count.answer === 'no').length;
    const totalCount = userCounts.length;

    res.status(200).json({ yesCount, noCount, totalCount, userCounts });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
  }     

  exports.adminRegistration = async (req,res) =>{
    try {

        const { email, password,username,
            phonenumber,employeeId
           } = req.body;
           const existingUser = await Admin.findOne({ email });
           if (existingUser) {
             return res.status(400).json({ message: 'Email already registered' });
           }
       
           // Hash the password
           const hashedPassword = await bcrypt.hash(password, 10);
       
           // Create a new user
           const user = new Admin({
             email,
             password: hashedPassword,
             username,
             phonenumber,employeeId
            
           });
       
           // Save the user to the database
           await user.save();
       
           res.status(201).json({ message: 'Admin registered successfully' });
         } catch (error) {
           console.error(error);
           res.status(500).json({ message: 'Internal server error' });
         }
  }
  exports.adminLogin = async (req,res) =>{
    const { email, password } = req.body;
    try {
        // Find the user by email
        const user = await Admin.findOne({ email });
    
        if (!user) {
          return res.status(401).json({ message: 'Invalid email ' });
        }
    
        // Compare the provided password with the hashed password in the database
        // const isPasswordValid = await bcrypt.compare(password, user.password);
        // if (!isPasswordValid) {
        //   return res.status(401).json({ message: 'Invalid  password' });
        // }
    
        // Create a JWT token
        const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, 'your-secret-key', { expiresIn: '2h' });
        const userResponse = {
            _id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            employeeId: user.employeeId,
            phonenumber: user.phonenumber,
          };
        res.json({ token,user: userResponse });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
  }
  exports.imageUpload = async(req,res) =>{
    try {
      const { base64Image} = req.body;
  
      // Decode base64 image
      const dataBuffer = Buffer.from(base64Image, 'base64');
  
      // Create new Image document
      const newImage = new Image({
        data: dataBuffer,
      //  contentType,
      });
  
      // Save the image to MongoDB
      await newImage.save();
  
      res.status(201).json({ message: 'Image uploaded successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  exports.imageAll = async(req,res) => {
    try {
      const images = await Image.find();
  
      const imageInfo = images.map(image => ({
        contentType: image.contentType,
        dataSize: image.data.length,
        base64Data: image.data.toString('base64'),
      }));
  
      res.status(200).json(imageInfo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
