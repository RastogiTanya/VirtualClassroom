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
		assignmentController.deleteAssignment
	);
	app.get(
		`${baseUrl}/tutor`,
		middleWare.verifyUser,
		middleWare.verifyTutor,
		assignmentController.getAssignByTutor
	);
	app.get(
		`${baseUrl}/student`,
		middleWare.verifyUser,
		assignmentController.getAssignByStudent
	);
	app.get(
		`${baseUrl}/filter`,
		middleWare.verifyUser,
		assignmentController.getFilteredAssignment
	);
};
module.exports = {
	setRouter: setRouter,
};
