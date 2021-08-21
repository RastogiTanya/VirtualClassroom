const { body } = require("express-validator");
exports.userLogin = [
	body("username").not().isEmpty(),
	body("username").isEmail(),
	body("password").not().isEmpty(),
];
