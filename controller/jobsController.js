const Job = require("../models/jobs");
const geoCoder = require("../util/geocoder");

exports.getJobs = async (req, res, next) => {
  const jobs = await Job.find();

  res.status(200).json({
    success: true,
    results: jobs.length,
    data: jobs,
  });
};
exports.newJob = async (req, res, next) => {
  const job = await Job.create(req.body);

  res.status(200).json({
    success: true,
    message: "job created",
    data: job,
  });
};
// update a Job
exports.updateJob = async (req,res,next)=>{
  let job = await Job.findById(req.params.id);
  if(!job){
    return res.status(404).json({
      success: false,
      message:'Job not found.'
    })
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
}

//delete job
exports.deleteJob = async(req,res,next)=>{
  let job = await Job.findById(req.params.id);
  if(!job){
    return res.status(404).json({
      success: false,
      message:'Job not found.'
    })
  }
  job = await Job.findByIdAndDelete(req.params.id)
  
  res.status(200).json({
    success:true,
    message:'Job is deleted',
    data:job
  })
}
//single job
exports.getJob = async(req, res, next) => {
  const job = await Job.find({$and:[{_id:req.params.id},{slug:req.params.slug}]})

  if(!job || job.length === 0){
    return res.status(404).json({
      success: false,
      message:'Job not found.'
    })
  }

  res.status(200).json({
    success:true,
    message:'Job is found',
    data:job
  })
}

//Search jobs within raduis => /api/v1/jobs/:zipcode/:distance
exports.getJobsInRadius = async (req, res, next) => {
  const { zipcode, distance } = req.params;
  console.log(zipcode)
  const loc = await geoCoder(zipcode);
  console.log(loc)
  const latitude = loc.geometry.lat;
  const longitude = loc.geometry.lng;

  const radius = distance / 3963;
  const jobs = await Job.find({
    location: {$geoWithin: { $centerSphere: [[longitude, latitude], radius] }},
  });

  console.log(jobs)


  res.status(200).json({
    success: true,
    results: jobs.length,
    data: jobs,
  });
};

// get stats about a topic(job)
exports.jobStats = async(req,res,next) =>{
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
    res.status(404).json({
      success: false,
      message:"No stat found "+req.params.topic+""
      
    });
  }

  res.status(200).json({
    success: true,
    data: stats,
  });


}
