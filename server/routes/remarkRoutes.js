const remarkController = require("../controller/remark");
const middleWare = require("../middleware/auth");
const validator = require("../validator/remarkValidator");
let setRouter = (app) => {
	let baseUrl = `/assignment`;
	app.post(
		`${baseUrl}/remark`,
		middleWare.verifyUser,
		middleWare.verifyTutor,
		validator.giveRemark,
		remarkController.giveRemark
	);
};
module.exports = {
	setRouter: setRouter,
};
