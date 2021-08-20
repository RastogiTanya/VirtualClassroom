const userController = require("../controller/userAuthenticate");
const middleWare = require("../middleware/auth");
let setRouter = (app) => {
	let baseUrl = `/user`;
	app.post(`${baseUrl}/register`, userController.userRegister);
	app.post(`${baseUrl}/tutorregister`, userController.tutorRegister);
	app.post(`${baseUrl}/login`, userController.userLogin);
	app.get(
		`${baseUrl}/get`,
		middleWare.verifyToken,
		middleWare.admin,
		userController.getDetails
	);
};
module.exports = {
	setRouter: setRouter,
};
