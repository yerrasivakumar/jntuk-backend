const mongoose = require('mongoose');
const moment = require('moment');
const responseSchema = new mongoose.Schema({
    answer: String,
    group:String,
    year:String,
    firstName:String,
    createdAt: { type: String, default: moment().format('DD/MM/YYYY') }
});
const Response = mongoose.model('Response', responseSchema);
module.exports = Response;