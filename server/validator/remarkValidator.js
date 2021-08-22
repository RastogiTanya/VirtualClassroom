const { body } = require("express-validator");
exports.giveRemark = [
	body("assignmentId").not().isEmpty(),
	body("studentId").not().isEmpty(),
	body("remark").not().isEmpty(),
];
