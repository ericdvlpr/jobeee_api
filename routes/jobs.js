const express = require("express");
const router = express.Router();
const {
  getJobs,
  newJob,
  getJobsInRadius,
  updateJob,
  deleteJob,
  getJob,
  jobStats,
  applyJob
} = require("../controller/jobsController");

const {isAuthenticatedUser, authorizeRoles} = require('../middleware/auth');

router.route("/jobs").get(getJobs);
router.route("/job/:id/:slug").get(getJob);
router.route("/jobs/:zipcode/:distance").get(getJobsInRadius);
router.route("/stats/:topic").get(jobStats);
router.route("/job/new").post(isAuthenticatedUser,authorizeRoles('employer','admin'),newJob);
router.route("/job/:id").put(isAuthenticatedUser,authorizeRoles('employer','admin'),updateJob).delete(isAuthenticatedUser,authorizeRoles('employer','admin'),deleteJob);
router.route("/job/:id/apply").put(isAuthenticatedUser,authorizeRoles('employer','user'),applyJob);
module.exports = router;
