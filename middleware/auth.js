const jwt = require('jsonwebtoken')
const User = require('../models/users')
const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const ErrorHandler = require('../utils/errorHandler')

exports.isAuthenticatedUser = catchAsyncErrors(async(req,res,next)=>{
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token){
        return next(new ErrorHandler('Login first to access this resource',401));
    }
    console.log(token)
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    next();

});