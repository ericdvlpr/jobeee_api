const mongoose = require('mongoose')
const validator = require('validator')
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please enter your name']
    },
    email:{
        type:String,
        required:[true,'Please enter your email address'],
        unique:true,
        validate:[validator.isEmail,'Please enter your email address']
    },
    role:{
        type:String,
       enum:{
        values:['user','employeer'],
        message:'Please select correct role'
       },
       default:'user'
    },
    password:{
        type:String,
        required:[true,'Please enter your password'],
        minlength:[8,'Your password must be atleast 8 characters long'],
        select:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date

});

module.exports =mongoose.model('User',userSchema);