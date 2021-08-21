const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AssignmentSchema = new Schema({
	tutorId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Users",
	},
	name: {
		type: String,
		default: "NA",
	},
	description: {
		type: String,
		default: "NA",
	},
	listOfStudents: [
		{
			studentId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Users",
			},
			// status: {
			// 	type: String,
			// 	default: "Not submitted",
			// },
		},
	],//submission -> status:submitted !!
	deadlineDate: { type: Date, default: Date.now },

	publishingDate: { type: Date, default: Date.now },
	status: {
		type: String,
		default: "NA", //scheduled,ongoing
	},
});
module.exports = mongoose.model("Assignment", AssignmentSchema);
