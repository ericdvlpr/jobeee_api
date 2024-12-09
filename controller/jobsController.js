const Job = require("../models/jobs");
const geoCoder = require("../utils/geocoder");
const ErrorHandler = require("../utils/errorHandler")
const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const APIFilters = require('../utils/apiFilters')



exports.getJobs = catchAsyncErrors(async (req, res, next) => {
  const apiFilters = new APIFilters(Job.find(),req.query)
                    .filter()
                    .sort()
                    .limitFields()
                    .searchByQuery()
                    .pagination();

  const jobs = await apiFilters.query;
  
  res.status(200).json({
    success: true,
    results: jobs.length,
    data: jobs,
  });
});
exports.newJob = catchAsyncErrors(async (req, res, next) => {
  const job = await Job.create(req.body);
 
  res.status(200).json({
    success: true,
    message: "job created",
    data: job,
  });
});
// update a Job
exports.updateJob = catchAsyncErrors(async (req,res,next)=>{
  let job = await Job.findById(req.params.id);
  if(!job){
   return next(new ErrorHandler('Job not found',404));
  }
  job = await Job.findByIdAndUpdate(req.params.id,req.body,{
    new:true,
    runValidators:true,
    useFindAndModify:false
  })

  res.status(200).json({
    success:true,
    message:'Job is updated',
    data:job
  })
})

//delete job
exports.deleteJob = catchAsyncErrors(async(req,res,next)=>{
  let job = await Job.findById(req.params.id);
  if(!job){
    return next(new ErrorHandler('Job not found',404));
  }
  job = await Job.findByIdAndDelete(req.params.id)
  
  res.status(200).json({
    success:true,
    message:'Job is deleted',
    data:job
  })
})
//single job
exports.getJob = catchAsyncErrors(async(req, res, next) => {
  const job = await Job.find({$and:[{_id:req.params.id},{slug:req.params.slug}]})

  if(!job || job.length === 0){
    return next(new ErrorHandler('Job not found',404));
  }

  res.status(200).json({
    success:true,
    message:'Job is found',
    data:job
  })
})

//Search jobs within raduis => /api/v1/jobs/:zipcode/:distance
exports.getJobsInRadius = catchAsyncErrors(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  
  const loc = await geoCoder(zipcode);
  
  const latitude = loc.geometry.lat;
  const longitude = loc.geometry.lng;

  const radius = distance / 3963;
  const jobs = await Job.find({
    location: {$geoWithin: { $centerSphere: [[longitude, latitude], radius] }},
  });

  res.status(200).json({
    success: true,
    results: jobs.length,
    data: jobs,
  });
});

// get stats about a topic(job)
exports.jobStats = catchAsyncErrors(async(req,res,next) =>{
  const stats = await Job.aggregate([
    {
      $match:{$text:{$search: "\""+req.params.topic+"\""}}
    },
    {
      $group:{
        _id:{$toUpper : '$experience'},
        totalJobs:{$sum : 1},
        avgPosition: {$avg: '$positions'},
        avgSalary : {$avg: '$salary'},
        minSalary:{$min:'$salary'},
        maxSalary:{$max:'$salary'}
      }
    }
  ])
  if(stats.length === 0){
    return next(new ErrorHandler('No stat found',404));
  }

  res.status(200).json({
    success: true,
    data: stats,
  });


})
