const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const UserModel = require("../models/Users");
const AssignmentModel = require("../models/Assignment");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.email,
		pass: process.env.pass,
	},
});
const createAssignment = async (req, res) => {
	try {
		//	console.log("assignment ", req.body);
		let {
			name,
			description,
			listOfStudents,
			deadlineDate,
			publishingDate,
		} = req.body;
		let tutorId = req.userData._id;
		//converting to date format
		var currentdate = new Date();
		deadlineDate = new Date(deadlineDate);
		publishingDate = new Date(publishingDate);

		//time constraints
		if (deadlineDate < currentdate && deadlineDate < publishingDate) {
			return res.json({
				result: false,
				message:
					"Sorry ! Deadline date sholud be greater than current date and publishing date. ",
			});
		}
		if (publishingDate < currentdate) {
			return res.json({
				result: false,
				message:
					"Sorry ! Publishing date sholud be greater than current date. ",
			});
		}

		//marking the status
		if (publishingDate > currentdate) {
			status = "Scheduled";
		} else {
			status = "OnGoing";
		}
		// console.log(publishingDate);
		// console.log(deadlineDate);

		//creating an entry in database
		var createassign = await AssignmentModel.create({
			tutorId,
			name,
			description,
			listOfStudents,
			publishingDate,
			deadlineDate,
			status,
		});
		if (createassign) {
			let tutorDetails = await UserModel.findOneAndUpdate(
				{ _id: req.userData._id },
				{
					$push: {
						assignments: {
							assignmentId: createassign._id,
						},
					},
				}
			);
			let list = createassign.listOfStudents;

			list.forEach(async (student) => {
				let filter = { _id: student.studentId };

				await UserModel.findOneAndUpdate(filter, {
					$push: {
						assignments: {
							assignmentId: createassign._id,
							submission: "Not yet",
							remark: "No remarks",
							status: "Pending",
						},
					},
				});
			});
			return res.json({
				result: true,
				message: "Assignment created",
				assignment: createassign,
			});
		} else {
			console.log("in else");
			return res.json({
				result: false,
				message: "Assignment not created.",
			});
		}
	} catch (error) {
		console.log("error");
		res.json({
			result: false,
			error,
		});
	}
};
const updateAssignment = async (req, res) => {
	try {
		console.log(req.body);
		let assignmentid = req.body.assignmentId;
		let assignmentDetails = {};
		if (req.body.name) {
			assignmentDetails.name = req.body.name;
		}
		if (req.body.description) {
			assignmentDetails.description = req.body.description;
		}
		if (req.body.publishingDate) {
			assignmentDetails.publishingDate = req.body.name;
		}
		if (req.body.deadlineDate) {
			assignmentDetails.deadlineDate = req.body.deadlineDate;
		}
		let filter = { _id: assignmentid };
		const updatedassignment = await AssignmentModel.findOneAndUpdate(
			filter,
			{
				$set: assignmentDetails,
			}
		);

		const assignments = await AssignmentModel.findById(assignmentid);
		let listOfStudents = assignments.listOfStudents;
		console.log(listOfStudents);
		let emailIds = [];
		listOfStudents.forEach(async (student) => {
			let stud = await UserModel.findById(student.studentId);
			emailIds.push(stud.username);
		});
		const mailOptions = {
			from: process.env.email,
			to: emailIds,
			subject: "Assignment Updated",
			text: `Good morning guys, Assignment ${assignments.name} has been updated. Please check it once again. `,
		};
		transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.log(error);
			} else {
				console.log("Email sent: " + info.response);
			}
		});
		return res.json({
			result: true,
			message: "Assignment updated successfully",
		});
	} catch (error) {
		res.status(400).json({
			result: false,
			error,
		});
	}
};

const getAssignments = async (req, res) => {
	try {
		let getAssignments;
		if (req.userData.isAdmin) {
			getAssignments = await UserModel.findById(
				req.userData._id
			).populate("assignments.assignmentId", "name description ");
		} else {
			getAssignments = await UserModel.findById(
				req.userData._id
			).populate("assignments.assignmentId", "-_id -listOfStudents");
		}

		res.json({
			assignments: getAssignments.assignments,
		});
	} catch (error) {
		res.status(400).json({
			result: false,
			error,
		});
	}
};

const deleteAssignment = async (req, res) => {
	try {
		let assignmentId = req.body.assignmentId;

		//updating the status of assignment to "deleted"
		let deletedAssignment = await AssignmentModel.findOneAndUpdate(
			{ _id: assignmentId },
			{ status: "Deleted" }
		);
		let assign = await AssignmentModel.findById(assignmentId);

		//getting the array of students to whom assignment is assigned
		let students = assign.listOfStudents;

		//updating the staus of assignment as "deleted" for every student to whom assignment is assigned
		students.forEach(async (student) => {
			let user = await UserModel.findById(student.studentId);

			for (let i = 0; i < user.assignments.length; i++) {
				let assignmentid = user.assignments[i].assignmentId;
				//console.log(user.assignments[i].assignmentId);
				if (assignmentid == assignmentId) {
					user.assignments[i].status = "Deleted";
					await UserModel.findOneAndUpdate(
						{ _id: user._id },
						{ $set: user }
					);
				}
			}
		});
		res.json({
			result: true,
			message: "Assignment deleted successfully",
		});
	} catch (error) {
		res.status(400).json({
			result: false,
			error,
		});
	}
};

//get the detials of an assignment by tutor
const getAssignByTutor = async (req, res) => {
	try {
		//get the details of the assignment from assignment model
		let assignment = await AssignmentModel.findById(
			req.body.assignmentId
		).populate("listOfStudents.studentId", "username assignments");

		//getting the list of students to whom assignment was assigned
		let students = assignment.listOfStudents;

		let listOfStudents = [];
		students.forEach((student) => {
			//for getting the
			for (let i = 0; i < student.studentId.assignments.length; i++) {
				//finding the assignment from the list of assignments assigned to a student
				if (
					String(student.studentId.assignments[i].assignmentId) ==
					String(req.body.assignmentId)
				) {
					//pushing in array the status,username amd remarks of a student for that assignment
					listOfStudents.push({
						username: student.studentId.username,
						status: student.studentId.assignments[i].status,
						remark: student.studentId.assignments[i].remark,
					});
				}
			}
		});

		//constructing the required object to remove unnecessary details
		let data = {
			nameOfAssignment: assignment.name,
			description: assignment.description,
			deadlineDate: assignment.deadlineDate,
			publishingDate: assignment.publishingDate,
			statusOfAssignment: assignment.status,
			listOfStudents,
		};
		res.status(200).json({
			result: true,
			data,
		});
	} catch (error) {
		res.status(400).json({
			result: false,
			error,
		});
	}
};

//get the detail of an assignment assigned to a particular student
const getAssignByStudent = async (req, res) => {
	try {
		//getting the data from assignment model
		let assignment = await AssignmentModel.findById(
			req.body.assignmentId
		).populate("tutorId", "username");

		//simplifying the data
		let data = {
			name: assignment.name,
			description: assignment.description,
			deadlineDate: assignment.deadlineDate,
			publishingDate: assignment.publishingDate,
			statusOfAssignment: assignment.status,
			tutorUsername: assignment.tutorId.username,
		};
		//console.log(data);
		var currentdate = new Date();
		//getting the status of the student for that assignment
		let assignmentDetail = await UserModel.findById(req.userData._id);
		let assignmentArray = assignmentDetail.assignments;

		//looping through the list of assignments in user data
		for (let assignment of assignmentArray) {
			if (
				String(assignment.assignmentId) == String(req.body.assignmentId)
			) {
				if (currentdate > data.deadlineDate) {
					assignment.status = "Overdue";
					await UserModel.findOneAndUpdate(
						{ _id: req.userData._id },
						{ $set: assignmentDetail }
					);
				}

				console.log(assignment.status);
				data.myStatus = assignment.status;
				console.log(data);
				data.remark = assignment.remark;
			}
		}
		console.log("object");
		res.json({ data });
	} catch (error) {
		res.status(400).json({
			result: false,
			error,
		});
	}
};

module.exports = {
	createAssignment,
	updateAssignment,
	getAssignments,
	deleteAssignment,
	getAssignByTutor,
	getAssignByStudent,
};
