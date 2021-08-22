const submissionController = require("../controller/submission");
const middleWare = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/"); //uploading in uploads folder
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + "-" + file.originalname); //setting the name
	},
});

//function for checking whether the assignment uploaded is a pdf or not
function checkFileType(file, cb, next, res) {
	const filetypes = /pdf/;
	const extname = filetypes.test(
		path.extname(file.originalname).toLowerCase()
	);
	const mimetype = filetypes.test(file.mimetype);
	if (extname && mimetype) {
		return cb(null, true);
	} else {
		return cb("Invalid type", null);
	}
}
const upload = multer({
	storage,
	fileFilter: (req, file, cb, res) => {
		checkFileType(file, cb);
	},
});

let setRouter = (app) => {
	let baseUrl = `/assignment`;
	app.post(
		`${baseUrl}/submit`,
		middleWare.verifyUser,
		upload.single("pdfFile"), //for uploading only single file in submission.
		submissionController.submitAssignment,
		(error, req, res, next) => {
			res.status(400).send({ error });
		}
	);
};

module.exports = {
	setRouter: setRouter,
};
