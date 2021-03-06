const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const colors = require("colors");
const logger = require("morgan");
const dotenv = require("dotenv");
dotenv.config();
// app.use(bodyParser.json({ limit: "50mb" }));
// app.use(
// 	bodyParser.urlencoded({
// 		extended: true,
// 		limit: "50mb",
// 		parameterLimit: 100000,
// 	})
// );
// app.use(bodyParser.raw({ type: "*/*" }));
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin,X-Requested-With,Content-Type,Accept,Authorization"
	);
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET,POST,PATCH,DELETE,PUT,OPTIONS"
	);
	//  res.setHeader("Content-Type","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
	if (req.method === "OPTIONS") {
		res.sendStatus(200);
	} else {
		next();
	}
});

// app.use(express.static(path.join(__dirname, "dist/winmyRfp")));

const modelsPath = "./server/models";
const routesPath = "./server/routes";

//Bootstrap models
fs.readdirSync(modelsPath).forEach(function (file) {
	if (~file.indexOf(".js")) require(modelsPath + "/" + file);
});
// end Bootstrap models

// Bootstrap route
fs.readdirSync(routesPath).forEach(function (file) {
	if (~file.indexOf(".js")) {
		let route = require(routesPath + "/" + file);
		route.setRouter(app);
	}
});
app.use("/uploads", express.static("./uploads"));
process.on("unhandledRejection", (err, p) => {
	console.log(`Rejection: ${err}`);
});
// end bootstrap route
/**
 * Create HTTP server.
 */
// console.log("object");
const server = http.createServer(app);

server.listen(process.env.PORT || 5000);
server.on("error", onError);

server.on("listening", onListening);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
	if (error.syscall !== "listen") {
		throw error;
	}
	//console.log(error);
	// handle specific listen errors with friendly messages
	switch (error.code) {
		case "EACCES":
			process.exit(1);
			break;
		case "EADDRINUSE":
			process.exit(1);
			break;
		default:
			throw error;
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
	//for add mongodb add %40 instead of @
	var addr = server.address();
	//console.log("lll");
	var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
	"Listening on " + bind;
	let db = mongoose.connect(
		process.env.MONGO_URL,

		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
			useCreateIndex: true,
		}
	);
}

/**
 * database connection settings
 */
mongoose.connection.on("error", function (err) {
	console.log("database connection error");
	console.log(err);
}); // end mongoose connection error

mongoose.connection.on("open", function (err) {
	if (err) {
		console.log(`database error`.red.bold);
		console.log(err);
	} else {
		console.log(
			`database connected successfully port no : ${process.env.PORT}`
				.yellow.bold
		);
		// logger.info("database connection open",
		//   'database connection open handler', 10)
	}
	//process.exit(1)
}); // enr mongoose connection open handler

// end socketio connection handler

module.exports = app;
