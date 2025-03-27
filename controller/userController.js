const User = require('../models/users');
const catchAsyncErrors =  require('../middleware/catchAsyncErrors')
const ErrorHandler = require('../utils/errorHandler')
const sendToken = require('../utils/jwtToken')
const fs = require('fs')
const Job = require('../models/jobs');
const jobs = require('../models/jobs');
const APIFilter = require('../utils/apiFilters')

//Get current user profile => /api/v1/me
exports.getUserProfile = catchAsyncErrors(async(req, res,next)=>{
    const user = await User.findById(req.user.id)
                            .populate({
                                path:'jobPublished',
                                select:'title postingDate'
                            })

    res.status(200).json({
        success: true,
        data:user
    })
})

//update current user data => /api/v1/me/update
exports.updateUser= catchAsyncErrors(async(req,res,next)=>{
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    const user= await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(200).json({
        success: true,
        data:user
    })
})

// update current user password => /api/v1/password/update
exports.updatePassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select('+password');
   
    //Check previous user password
   const isMatched = await user.comparePassword(req.body.currentPassword);
   
    if(!isMatched){
        return next(new ErrorHandler('Old Password is incorrect',401))
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user,200,res);
})

// Show all applied jobs => /api/v1/jobs/applied
exports.getAppliedJobs = catchAsyncErrors(async(req,res,next)=>{
    const jobs = await Job.find({'applicantsApplied.id' :req.user.id}).select('+applicantsApplied');
    res.status(200).json({
        success:true,
        results: jobs.length,
        data: jobs
    })
})
// Show all jobs published by employer => /api/v1/jobs/published
exports.getPublishedJobs = catchAsyncErrors(async(req,res,next)=>{
    const jobs = await Job.find({user:req.user.id})

    res.status(200).json({
        success: true,
        results: jobs.length,
        data: jobs
    })
})


// delete current user => /api/v1/me/delete
exports.deleteUser = catchAsyncErrors(async(req,res,next)=>{
    //console.log(req.user)
    deleteUserData(req.user.id, req.user.role);

    const user = await User.findByIdAndDelete(req.user.id);

    res.cookie('token','none',{
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success : true,
        message: 'Your account has been deleted.'
    })
})

//Adding controller methods for admins

//show all user => /api/v1/users
exports.getUsers = catchAsyncErrors(async(req,res,next)=>{
    const apiFilters = new APIFilter(User.find(),req.query)
        .filter()
        .sort()
        .limitFields()
        .pagination()


        const users = await apiFilters.query;

        res.status(200).json({
            success:true,
            results: users.length,
            data: users
        })
})
//Delete User(admin) => /api/v1/user/:id
exports.deleteUserAdmin = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler('User not found with id: `${req.params.id}`',404))
    }

    deleteUserData(user.id, user.role);
    await user.deleteOne();

    res.status(200).json({
        success:true,
       message: 'User is deleted by Admin'
    })
})

// delete current userdata 
async function deleteUserData(user, role) {
    if(role === 'employeer') {
        await Job.deleteMany({user : user});
    }

    if(role === 'user') {
        const appliedJobs = await Job.find({'applicantsApplied.id' : user}).select('+applicantsApplied');
        
      for(let i=0; i<appliedJobs.length; i++) {
            let obj = appliedJobs[i].applicantsApplied.find(o => o.id === user);
            
            let filepath = `./public/uploads/${obj.resume}`.replace('\\controllers', '');

             fs.unlink(filepath, err => {
                if(err) return console.log(err);
            });
            
            appliedJobs[i].applicantsApplied.splice(appliedJobs[i].applicantsApplied.indexOf(obj.id));
            
            await appliedJobs[i].save();
        }
    }
}