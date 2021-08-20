const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	isAdmin: {
		type: Boolean,
		default: false,
	},
	assignments: [
		{
			assignmentId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Assignment",
			},
			status: {
				type: String,
			},
			submission: { type: String },
			remark: {
				type: String,
			},
		},
	],
});
module.exports = mongoose.model("Users", UserSchema);
