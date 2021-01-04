import express, {static} from "express";
import {createServer} from "http";
import {join} from "path";
import fs from "fs";
import socketio from "socket.io";
import _ from "lodash";
require("better-logging")(console);

const app = express();
const server = createServer(app);

const io = socketio(server);

app.use(static(join(__dirname, "../client")));

io.on("connection", socket => {
	console.log("client connected");
});

server.listen(8080, () => {
	console.info("Server listening on port 8080");
});
