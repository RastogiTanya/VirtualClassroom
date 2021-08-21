const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const UserModel = require("../models/Users");
const AssignmentModel = require("../models/Assignment");
const nodemailer = require("nodemailer");

const submitAssignment = async (req, res) => {
	try {
		//getting the student details
		const student = await UserModel.findById(req.userData._id);

		//getting the list of assignments assigned to a student
		let assignments = student.assignments;

		//looping through the assignment to find the correct assignmnet for which the student wants to do the submission
		assignments.forEach(async (assignment) => {
			//selecting the assignment
			if (
				String(assignment.assignmentId) == String(req.body.assignmentId)
			) {
				if(assignment.status=="Submitted"){
					return res.json({
						result:false
					})
				}
				//updating
				assignment.submission = req.file.path;
				assignment.status = "Submitted";
				await UserModel.findOneAndUpdate(
					{ _id: req.userData._id },
					{ $set: student }
				);
			}
		});
		res.json({
			result: true,
			message: "Assignment submitted",
		});
	} catch (error) {
		res.status(400).json({
			result: false,
			error,
		});
	}
};
module.exports = { submitAssignment };
