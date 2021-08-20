const assignmentController = require("../controller/assignment");
const middleWare = require("../middleware/auth");
let setRouter = (app) => {
	let baseUrl = `/assignment`;
	app.post(
		`${baseUrl}/create`,
		middleWare.verifyToken,
		middleWare.admin,
		assignmentController.createAssignment
	);
	app.post(
		`${baseUrl}/update`,
		middleWare.verifyToken,
		middleWare.admin,
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
		assignmentController.deleteAssignment
	);
};
module.exports = {
	setRouter: setRouter,
};
