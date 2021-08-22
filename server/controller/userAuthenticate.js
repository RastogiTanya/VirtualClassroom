const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const UsersModel = require("../models/Users");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { validationResult } = require("express-validator");
dotenv.config();

//for registering a tutor
const tutorRegister = async (req, res) => {
	try {
		//if any errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({
				error: errors.array()[0],
			});
		}

		//encrypting the password
		const salt = await bcrypt.genSalt(10);
		let password = await bcrypt.hash(req.body.password, salt);

		//creating the entry of tutor in database
		var createUser = await UsersModel.create({
			username: req.body.username,
			password: password,
			isTutor: true,
		});
		let token;

		//constructing the token so that user should have to login again
		const payload = {
			user: {
				userId: createUser._id,
				username: req.body.username,
				isTutor: createUser.isTutor,
			},
		};
		token = jwt.sign(payload, process.env.secret, {});

		res.json({
			status: 1,
			message: "Tutor successfully registered",
			token: token,
		});
	} catch (err) {
		//Duplicate field error !!
		if (err.name === "MongoError" && err.code === 11000) {
			res.status(401).json({
				result: false,
				msg: "user already exist",
				field: err.keyValue,
			});
		} else {
			res.status(401).json(err);
		}
	}
};

//for user login
const userLogin = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({
				error: errors.array()[0],
			});
		}
		let userData = await UsersModel.findOne({
			username: req.body.username,
		});

		//if user is not found
		if (userData == null) {
			res.json({
				status: 0,
				message:
					"Account not found. Please enter a registered username",
			});
		}
		//if user account is there in database
		else {
			let token;
			let tempPass = userData.password;

			const comparePassword = async (p1, p2) => {
				const match = await bcrypt.compare(p1, p2);

				//if password entered matches the password in db
				if (match) {
					//deciding what data needs to be loaded in token
					const payload = {
						user: {
							userId: userData._id,
							username: req.body.username,
							isTutor: userData.isTutor,
						},
					};
					//creating token and loading data in token
					token = jwt.sign(payload, process.env.secret, {});
					res.status(200).json({
						status: 1,
						message: "Successfully logged in ",
						token: token,
					});
				}

				//if password entered is wrong
				else {
					res.status(200).json({
						status: 0,
						message: "Wrong Password",
					});
				}
			};

			//calling the above defined function
			await comparePassword(req.body.password, tempPass);
		}
	} catch (error) {
		res.status(401);
		throw new Error("Invalid credentials");
	}
};

//for registering as a student
const userRegister = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({
				error: errors.array()[0],
			});
		}

		//encrypting the passoword
		const salt = await bcrypt.genSalt(10);
		let password = await bcrypt.hash(req.body.password, salt);

		//creating the entry in database
		var createUser = await UsersModel.create({
			username: req.body.username,
			password: password,
			isTutor: false,
		});
		let token;

		//constructing token so that he can be looged in automatically
		const payload = {
			user: {
				userId: createUser._id,
				username: req.body.username,
				isTutor: createUser.isTutor,
			},
		};
		token = jwt.sign(payload, process.env.secret, {});

		res.json({
			status: 1,
			message: "user successfully registered",
			token: token,
		});
	} catch (err) {
		//Duplicate field error !!
		if (err.name === "MongoError" && err.code === 11000) {
			res.status(401).json({
				result: false,
				msg: "user already exist",
				field: err.keyValue,
			});
		} else {
			res.status(401).json(err);
		}
	}
};

module.exports = {
	tutorRegister,
	userRegister,
	userLogin,
};
