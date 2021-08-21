const assignmentController = require("../controller/assignment");
const middleWare = require("../middleware/auth");
const validator = require("../validator/assignmentValidators");
let setRouter = (app) => {
	let baseUrl = `/assignment`;
	app.post(
		`${baseUrl}/create`,
		middleWare.verifyToken,
		middleWare.admin,
		validator.assignmentCreate,
		assignmentController.createAssignment
	);
	app.post(
		`${baseUrl}/update`,
		middleWare.verifyToken,
		middleWare.admin,
		validator.assignmentUpdate,
		assignmentController.updateAssignment
	);
	app.get(
		`${baseUrl}/get`,
		middleWare.verifyToken,
		assignmentController.getAssignments
	);
	app.post(
		`${baseUrl}/delete`,
		middleWare.verifyToken,
		middleWare.admin,
		validator.assignmentUpdate,
		assignmentController.deleteAssignment
	);
	app.get(
		`${baseUrl}/tutor`,
		middleWare.verifyToken,
		middleWare.admin,
		validator.assignmentByTutor,
		assignmentController.getAssignByTutor
	);
	app.get(
		`${baseUrl}/student`,
		middleWare.verifyToken,
		validator.assignmentByStudent,
		assignmentController.getAssignByStudent
	);
};
module.exports = {
	setRouter: setRouter,
};
