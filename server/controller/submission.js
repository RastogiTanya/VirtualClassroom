const express = require("express");
const router = express.Router();
const UserModel = require("../models/Users");
const AssignmentModel = require("../models/Assignment");

const submitAssignment = async (req, res) => {
	try {
		//getting the student details
		const student = await UserModel.findById(req.userData._id);

		//getting the list of assignments assigned to a student
		let assignments = student.assignments;
		var currentDate = new Date();
		//looping through the assignment to find the correct assignmnet for which the student wants to do the submission
		for (let assignment of assignments) {
			//selecting the assignment
			if (
				String(assignment.assignmentId) == String(req.body.assignmentId)
			) {
				let assignmentDetails = await AssignmentModel.findById(
					req.body.assignmentId
				);
				console.log(assignmentDetails);
				if (assignmentDetails.deadlineDate < currentDate) {
					return res.json({
						result: false,
						message:
							"Sorry can not submit assignment beyond deadline date.",
					});
				}
				//updating
				assignment.submission = req.file.path;
				assignment.status = "Submitted";
				await UserModel.findOneAndUpdate(
					{ _id: req.userData._id },
					{ $set: student }
				);
			}
		}
		res.json({
			result: true,
			message: "Assignment submitted",
		});
	} catch (error) {
		res.status(400).json({
			result: false,
			message: "Error occurred while submitting the assignment.",
		});
	}
};
module.exports = { submitAssignment };
