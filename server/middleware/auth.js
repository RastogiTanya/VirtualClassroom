const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const UserModel = require("../models/Users");
dotenv.config();

//authenticating students
const verifyToken = async (req, res, next) => {
	try {
		var authHeader =
			req.body.authorization ||
			req.query.authorization ||
			req.headers["x-access-token"] ||
			req.headers["authorization"];
		var decoded;
		//console.log("kkk");
		if (authHeader) {
			let token = authHeader.split(" ");
			decoded = jwt.verify(token[1], process.env.secret);
			if (!decoded) {
				return res.json({ success: 0, message: "token expired" });
			} else {
				let findUser = await UserModel.findOne({
					_id: decoded.user.userId,
				});
				if (findUser == null) {
					return res.json({ success: 0, message: "Invalid User" });
				} else {
					//console.log("object", findUser);
					req.userData = findUser;
					next();
				}
			}
		} else {
			return res.json({ success: 0, message: "Token Not Found" });
		}
	} catch (error) {
		return res.json({ success: 0, message: "Invalid token" });
	}
};

// middleware for admin/tutor only
const admin = async (req, res, next) => {
	//console.log(req.userData);
	if (req.userData && req.userData.isAdmin) {
		next();
	} else {
		res.status(401);
		throw new Error("Not authorized as an admin");
	}
};

module.exports = {
	verifyToken,
	admin,
};
