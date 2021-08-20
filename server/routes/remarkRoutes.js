const remarkController = require("../controller/remark");
const middleWare = require("../middleware/auth");
let setRouter = (app) => {
	let baseUrl = `/assignment`;
	app.post(
		`${baseUrl}/remark`,
		middleWare.verifyToken,
		middleWare.admin,
		remarkController.giveRemark
	);
};
module.exports = {
	setRouter: setRouter,
};
