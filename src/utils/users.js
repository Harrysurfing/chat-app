const users = [];

//addUser
const addUser = ({ id, username, room }) => {
	username = username.trim().toLowerCase();
	room = room.trim().toLowerCase();

	if (!username || !room) {
		return { err: "Username and room name required" };
	}

	const existingUser = users.find((user) => {
		return user.room === room && user.username === username;
	});

	if (existingUser) {
		return { err: "Username in use" };
	}

	const user = { id, username, room };
	users.push(user);

	return { user };
};

//remove user
const removeUser = (id) => {
	const index = users.findIndex((user) => user.id === id);
	if (index !== -1) {
		const user = users.splice(index, 1);

		return user[0];
	}
};

//get user

const getUser = (id) => {
	const user = users.find((user) => user.id === id);
	if (!user) {
		return undefined;
	}

	return user;
};

//get users in room
const getUsersInRoom = (roomName) => {
	const usersInRoom = users.filter((user) => user.room === roomName);
	if (!usersInRoom) {
		return [];
	}

	return usersInRoom;
};

module.exports = {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
};
