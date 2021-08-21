const express = require("express");
const router = express.Router();
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

const giveRemark = async (req, res) => {
	try {
		let assignmentId = req.body.assignmentId;
		let assignments = await AssignmentModel.findById(assignmentId);

		//to check only the owner of the assignment is able to give the remark, no the tutor can do so
		if (String(req.userData._id) !== String(assignments.tutorId)) {
			return res.json({
				result: false,
				message: "Sorry you are not the owner of the assignment",
			});
		}

		//finding the student and assignment to which remark needs to be given
		let student = await UserModel.findById(req.body.studentId);
		let assignmentsArray = student.assignments;
		let emailId = student.username;
		for (let assignment of assignmentsArray) {
			if (assignment.assignmentId == assignmentId) {
				assignment.remark = req.body.remark;
				await UserModel.findOneAndUpdate(
					{ _id: req.body.studentId },
					{ $set: student }
				);
			}
		}

		res.json({
			result: true,
			message: "Successfully remarked",
		});

		//sending mail to the student
		const mailOptions = {
			from: process.env.email,
			to: emailId,
			subject: "Assignment Remarked",
			text: `Dear student ${student.username}, your assignment ${assignments.name} is remarked ! `,
		};
		transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.log(error);
			} else {
				console.log("Email sent: " + info.response);
			}
		});
	} catch (error) {
		res.status(400).json({
			result: false,
			error,
		});
	}
};
module.exports = {
	giveRemark,
};
