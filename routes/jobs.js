const express = require("express");
const router = express.Router();
const {
  getJobs,
  newJob,
  getJobsInRadius,
  updateJob,
  deleteJob,
  getJob,
  jobStats
} = require("../controller/jobsController");

const {isAuthenticatedUser} = require('../middleware/auth');

router.route("/jobs").get(getJobs);
router.route("/job/:id/:slug").get(getJob);
router.route("/jobs/:zipcode/:distance").get(getJobsInRadius);
router.route("/stats/:topic").get(jobStats);
router.route("/job/new").post(isAuthenticatedUser,newJob);
router.route("/job/:id").put(updateJob).delete(deleteJob);

module.exports = router;
