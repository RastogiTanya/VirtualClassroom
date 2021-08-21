const assignmentController = require("../controller/assignment");
const middleWare = require("../middleware/auth");
const validator = require("../validator/assignmentValidators");
let setRouter = (app) => {
	let baseUrl = `/assignment`;
	app.post(
		`${baseUrl}/create`,
		middleWare.verifyUser,
		middleWare.verifyTutor,
		validator.assignmentCreate,
		assignmentController.createAssignment
	);
	app.post(
		`${baseUrl}/update`,
		middleWare.verifyUser,
		middleWare.verifyTutor,
		validator.assignmentUpdate,
		assignmentController.updateAssignment
	);
	app.get(
		`${baseUrl}/get`,
		middleWare.verifyUser,
		assignmentController.getAssignments
	);
	app.get(
		`${baseUrl}/delete`,
		middleWare.verifyUser,
		middleWare.verifyTutor,
		validator.assignmentUpdate,
		assignmentController.deleteAssignment
	);
	app.get(
		`${baseUrl}/tutor`,
		middleWare.verifyUser,
		middleWare.verifyTutor,
		validator.assignmentByTutor,
		assignmentController.getAssignByTutor
	);
	app.get(
		`${baseUrl}/student`,
		middleWare.verifyUser,
		validator.assignmentByStudent,
		assignmentController.getAssignByStudent
	);
	app.get(
		`${baseUrl}/filter`,
		middleWare.verifyUser,
		//validator.assignmentByStudent,
		assignmentController.getFilteredAssignment
	);
};
module.exports = {
	setRouter: setRouter,
};
