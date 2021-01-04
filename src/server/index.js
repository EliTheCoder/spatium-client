const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const socketio = require("socket.io");
const _ = require("lodash");
require("better-logging")(console);

const app = express();
const server = http.createServer(app);

const io = socketio(server);

app.use(express.static(path.join(__dirname, "../client")));

io.on("connection", socket => {
	console.log("client connected");
});

server.listen(8080, () => {
	console.info("Server listening on port 8080");
});
