const mongoose = require('mongoose');
const moment = require('moment');
const userSchema = new mongoose.Schema({
  email: { type: String,  unique: true },
  password: { type: String, },
  firstName: String,
  lastName: String,
  rollNumber: String,
  age: Number,
  group: String,
  phoneNumber: String,
  dateOfBirth: { type: String, },
  collegeName: String,
  address: String,
  year: String,       
  gender:String,
  attendance: [
    {
      date: { type: Date, default: moment().format('YYYY-MM-DD') },
      present: { type: Boolean },
    },
  ],
  
});

const User = mongoose.model('User', userSchema);

module.exports = User;
