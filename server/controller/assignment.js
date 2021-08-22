const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const UserModel = require("../models/Users");
const AssignmentModel = require("../models/Assignment");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.email,
		pass: process.env.pass,
	},
});

//creating an assignment by tutor
const createAssignment = async (req, res) => {
	try {
		//if any errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({
				error: errors.array()[0],
			});
		}
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

		//entering the assignment id in tutor's model
		if (createassign) {
			await UserModel.findOneAndUpdate(
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

			//assigning the assignment to all the students whom tutor wished
			for (let student of list) {
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
			}
			return res.json({
				result: true,
				message: "Assignment created",
				assignment: createassign,
			});
		}
		//if assignment is not created
		else {
			return res.json({
				result: false,
				message: "Assignment not created.",
			});
		}
	} catch (error) {
		res.json({
			result: false,
			msg: "There was a problem in creating the assignment",
		});
	}
};

//updating the assignment
const updateAssignment = async (req, res) => {
	try {
		//if any errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({
				error: errors.array()[0],
			});
		}
		let assignmentid = req.body.assignmentId;

		//to check only the owner of the assignment is able to give the remark, no the tutor can do so
		let getassignments = await AssignmentModel.findById(assignmentid);
		if (String(req.userData._id) !== String(getassignments.tutorId)) {
			return res.json({
				result: false,
				message: "Sorry you are not the owner of the assignment",
			});
		}

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
		if (req.body.status) {
			assignmentDetails.status = req.body.status;
		}

		//updating the assignment details
		let filter = { _id: assignmentid };
		await AssignmentModel.findOneAndUpdate(filter, {
			$set: assignmentDetails,
		});

		//getting the list of student mails to whom this assignment was assigned
		const assignments = await AssignmentModel.findById(assignmentid);
		let listOfStudents = assignments.listOfStudents;
		console.log(listOfStudents);
		let emailIds = [];
		listOfStudents.forEach(async (student) => {
			let stud = await UserModel.findById(student.studentId);
			emailIds.push(stud.username);
		});

		//mailing students regarding the updated assignment
		//sending mass mail
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
			msg: "There was a problem in updating the assignment",
		});
	}
};

//getting the list of assignments
const getAssignments = async (req, res) => {
	try {
		function checkIfDeleted(assignment) {
			return assignment.assignmentId.status != "Deleted";
		}
		let getAllAssignments;
		if (req.userData.isTutor) {
			getAllAssignments = await UserModel.findById(
				req.userData._id
			).populate("assignments.assignmentId", "name description ");
		} else {
			getAllAssignments = await UserModel.findById(
				req.userData._id
			).populate("assignments.assignmentId", " -listOfStudents"); //name descrip status

			getAllAssignments.assignments =
				getAllAssignments.assignments.filter(checkIfDeleted);
		}

		res.json({
			assignments: getAllAssignments.assignments,
		});
	} catch (error) {
		res.status(400).json({
			result: false,
			msg: "There was a problem in fetching the assignments",
		});
	}
};

//deletign an assignment that is setting the status of that assignment to delete
const deleteAssignment = async (req, res) => {
	try {
		let assignmentId = req.query.assignmentId;
		//to check only the owner of the assignment is able to give the remark, no the tutor can do so
		let getassignments = await AssignmentModel.findById(assignmentId);
		if (String(req.userData._id) !== String(getassignments.tutorId)) {
			return res.json({
				result: false,
				message: "Sorry you are not the owner of the assignment",
			});
		}
		//updating the status of assignment to "deleted"
		await AssignmentModel.findOneAndUpdate(
			{ _id: assignmentId },
			{ status: "Deleted" }
		);
		res.json({
			result: true,
			message: "Assignment deleted successfully",
		});
	} catch (error) {
		res.status(400).json({
			result: false,
			msg: "There was a problem in deleting the assignment",
		});
	}
};

//get the details of an assignment by tutor
const getAssignByTutor = async (req, res) => {
	try {
		var currentDate = new Date();
		//get the details of the assignment from assignment model
		let assignment = await AssignmentModel.findById(
			req.query.assignmentId
		).populate("listOfStudents.studentId", "username assignments");

		//updating the status of assignment once it has reached beyond the deadline
		if (assignment.deadlineDate < currentDate) {
			assignment.status = "Over";
		}
		await AssignmentModel.findOneAndUpdate(
			{ _id: req.query.assignmentId },
			{ $set: assignment }
		);

		//getting the list of students to whom assignment was assigned
		let students = assignment.listOfStudents;

		let listOfStudents = [];
		students.forEach((student) => {
			//for getting assignments assigned to a student
			for (let i = 0; i < student.studentId.assignments.length; i++) {
				//finding the assignment from the list of assignments assigned to a student
				if (
					String(student.studentId.assignments[i].assignmentId) ==
					String(req.query.assignmentId)
				) {
					//pushing in array the status,username amd remarks of a student for that assignment
					listOfStudents.push({
						username: student.studentId.username,
						status: student.studentId.assignments[i].status,
						remark: student.studentId.assignments[i].remark,
						submission: student.studentId.assignments[i].submission,
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
			msg: "There was a problem in fetching the assignment",
		});
	}
};

//get the detail of an assignment assigned to a particular student
const getAssignByStudent = async (req, res) => {
	try {
		//getting the data from assignment model
		let assignment = await AssignmentModel.findById(
			req.query.assignmentId
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

		var currentdate = new Date();
		//getting the status of the student for that assignment
		let assignmentDetail = await UserModel.findById(req.userData._id);
		let assignmentArray = assignmentDetail.assignments;

		//looping through the list of assignments in user data
		for (let assignment of assignmentArray) {
			if (
				String(assignment.assignmentId) ==
				String(req.query.assignmentId)
			) {
				if (
					currentdate > data.deadlineDate &&
					assignment.status != "Submitted"
				) {
					assignment.status = "Overdue";
					await UserModel.findOneAndUpdate(
						{ _id: req.userData._id },
						{ $set: assignmentDetail }
					);
				}

				data.myStatus = assignment.status;
				data.mySubmission = assignment.submission;
				data.remark = assignment.remark;
			}
		}

		res.json({ result: true, data });
	} catch (error) {
		return res.status(500).json({
			msg: "There was a problem in fetching the assignment",
			result: false,
		});
	}
};

const getFilteredAssignment = async (req, res) => {
	try {
		function checkFilter(assignment) {
			return assignment.status == req.query.status;
		}
		let userDetails = await UserModel.findById(req.userData._id);
		let assignments = userDetails.assignments;
		if (req.query.status == "All") {
			return res.json({
				result: true,
				assignments,
			});
		}
		assignments = assignments.filter(checkFilter);
		if (assignments.length > 0) {
			return res.json({
				result: true,
				assignments,
			});
		} else {
			return res.json({
				result: false,
				msg: "No assignments found",
			});
		}
	} catch (error) {
		return res.status(401).json({
			result: true,
			msg: "There was a problem in fetching the assignment",
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
	getFilteredAssignment,
};
