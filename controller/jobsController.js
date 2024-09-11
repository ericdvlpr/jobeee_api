const Job = require('../models/jobs');

exports.getJobs = async (req,res,next) =>{

    const jobs = await Job.find();

    res.status(200).json({
        success:true,
        results:jobs.length,
        data:jobs,
        
    });
}
exports.newJob = async (req,res,next) =>{
    
    const job = await Job.create(req.body);

    res.status(200).json({
        success:true,
         message:'job created',
         data:job
    })
}