const { body } = require("express-validator");
exports.giveRemark = [body("assignmentId").not().isEmpty()];
exports.giveRemark = [body("studentId").not().isEmpty()];
exports.giveRemark = [body("remark").not().isEmpty()];
