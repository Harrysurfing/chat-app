const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
} = require("./utils/users");
const {
	generateMessage,
	generateLocationMessage,
} = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDir = path.join(__dirname, "../public");

app.use(express.static(publicDir));

let welcome = "Welcome~";

io.on("connection", (socket) => {
	socket.on("join", ({ username, room }, cb) => {
		const { err, user } = addUser({
			id: socket.id,
			username: username,
			room: room,
		});
		if (err) {
			return cb(err);
		}
		socket.join(user.room);
		socket.emit("message", generateMessage(welcome, "System"));
		socket.broadcast
			.to(user.room)
			.emit(
				"message",
				generateMessage(`${user.username} has joined the room`, "System")
			);
		io.to(user.room).emit("roomInfo", {
			room: user.room,
			users: getUsersInRoom(user.room),
		});

		cb();
	});

	socket.on("sendMessage", (inputMessage) => {
		const user = getUser(socket.id);

		io.to(user.room).emit(
			"message",
			generateMessage(inputMessage, user.username)
		);
	});

	socket.on("disconnect", () => {
		const user = removeUser(socket.id);

		if (user) {
			io.to(user.room).emit(
				"message",
				generateMessage(`User ${user.username} has left`, "System")
			);
			io.to(user.room).emit("roomInfo", {
				room: user.room,
				users: getUsersInRoom(user.room),
			});
		}
	});

	socket.on("sendLocation", (string, cb) => {
		const user = getUser(socket.id);

		io.to(user.room).emit(
			"locationMessage",
			generateLocationMessage(string, user.username)
		);
		cb(string);
	});
});

server.listen(process.env.PORT, () => {
	console.log("server started on port " + process.env.PORT);
});
