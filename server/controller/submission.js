const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const UserModel = require("../models/Users");
const AssignmentModel = require("../models/Assignment");
const nodemailer = require("nodemailer");

const submitAssignment = async (req, res) => {
	try {
        
	} catch (error) {
		res.status(400).json({
			result: false,
			error,
		});
	}
};
module.exports = {};
