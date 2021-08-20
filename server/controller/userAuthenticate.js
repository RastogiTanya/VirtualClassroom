const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const UsersModel = require("../models/Users");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

//for registering a tutor
const tutorRegister = async (req, res) => {
	try {
		console.log("user register", req.body);

		let userData = await UsersModel.findOne({
			username: req.body.username,
		});
		console.log(userData);
		if (userData == null) {
			const salt = await bcrypt.genSalt(10);
			let password = await bcrypt.hash(req.body.password, salt);

			var createUser = await UsersModel.create({
				username: req.body.username,
				password: password,
				isAdmin: true,
			});
			let token;

			const payload = {
				user: {
					userId: createUser._id,
					username: req.body.username,
					isAdmin: createUser.isAdmin,
				},
			};
			token = jwt.sign(payload, process.env.secret, {});

			res.json({
				status: 1,
				message: "Tutor successfully registered",
				token: token,
			});
		} else {
			res.json({
				status: 0,
				message: "Tutor already exist",
			});
		}
	} catch (error) {
		res.status(401);
		throw new Error("Something wrong occurred");
	}
};

//for user login
const userLogin = async (req, res) => {
	try {
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
		} //if user account is there in database
		else {
			let token;
			let tempPass = userData.password;

			//checking if correct password is entered or not
			const comparePassword = async (p1, p2) => {
				const match = await bcrypt.compare(p1, p2);

				//if password entered matches the password in db
				if (match) {
					//deciding what data needs to be loaded in token
					const payload = {
						user: {
							userId: userData._id,
							username: req.body.username,
							isAdmin: userData.isadmin,
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

const userRegister = async (req, res) => {
	try {
		console.log("user register", req.body);

		const salt = await bcrypt.genSalt(10);
		let password = await bcrypt.hash(req.body.password, salt);

		var createUser = await UsersModel.create({
			username: req.body.username,
			password: password,
			isAdmin: false,
		});
		let token;

		const payload = {
			user: {
				userId: createUser._id,
				username: req.body.username,
				isadmin: createUser.isadmin,
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
			//console.log(err);
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

const getDetails = async (req, res) => {
	console.log("object");
	//const find = req.userData;
	//	console.log(find.isAdmin);
};

module.exports = {
	tutorRegister,
	userRegister,
	userLogin,
	getDetails,
};
