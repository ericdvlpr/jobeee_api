const User = require('../models/users')
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');


//register a new user => api/v1/register
exports.registerUser =catchAsyncErrors(async (req,res,next) =>{
    const {name,email,password,role} = req.body;

    const user = await User.create({
        name,
        email,
        password,
        role
    });
    // JWT token
    const token = user.getJwtToken();

    res.status(200).json({
        success:true,
        message:'User is registered',
        token
    })
}) 
// Login user => /api/v1/login

exports.loginUser = catchAsyncErrors(async(req, res, next)=>{
    const {email,password} = req.body;

    //check if email or password is entered by user
    if(!email || !password){
        return next(new ErrorHandler('Please enter email and password!'),400)
    }

    //finding user in database
    const user = await User.findOne({email}).select('+password')
    if(!user){
        return next(new ErrorHandler('Invalid Email or Password',401))
    }

    //Check if password is correct
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler('Invalid Email or Password',401));
        
    }

    //Create JSON Web token

    // const token = user.getJwtToken()

    // res.status(200).json({
    //     success:true,
    //     token
    // })

    sendToken(user,200,res);

})
