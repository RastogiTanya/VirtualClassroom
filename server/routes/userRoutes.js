const userController = require("../controller/userAuthenticate");
const middleWare = require("../middleware/auth");
const validator = require("../validator/userValidator");
let setRouter = (app) => {
	let baseUrl = `/user`;
	app.post(
		`${baseUrl}/register`,
		validator.userLogin,
		userController.userRegister
	);
	app.post(
		`${baseUrl}/tutorregister`,
		validator.userLogin,
		userController.tutorRegister
	);
	app.post(`${baseUrl}/login`, validator.userLogin, userController.userLogin);
};
module.exports = {
	setRouter: setRouter,
};
