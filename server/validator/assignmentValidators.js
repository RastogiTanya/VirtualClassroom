const { body } = require("express-validator");
exports.assignmentCreate = [
	body("name").not().isEmpty(),
	body("description").not().isEmpty(),
	body("listOfStudents").not().isEmpty(),
	body("deadlineDate").not().isEmpty(),
	body("publishingDate").not().isEmpty(),
];
exports.assignmentUpdate = [body("assignmentId").not().isEmpty()];
