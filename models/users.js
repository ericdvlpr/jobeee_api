const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

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
        values:['user','employer'],
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

userSchema.pre('save', async function(next){
    this.password = await bcrypt.hash(this.password,10)
})

//return jwt
userSchema.methods.getJwtToken = function(){
    return jwt.sign({id:this._id}, process.env.JWT_SECRET, {
        expiresIn:process.env.JWT_EXPIRES_TIME
    })
}

//Compare user password in db password
userSchema.methods.comparePassword = async function(enterPassword){
    return await bcrypt.compare(enterPassword, this.password);
}

module.exports =mongoose.model('User',userSchema);