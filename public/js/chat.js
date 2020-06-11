const socket = io();

const $messages = document.querySelector("#messages");
const messageTemplate = document.getElementById("message-template").innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

//options
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true,
});

const autoScroll = () => {
	const $newMessage = $messages.lastElementChild;
	const newMessageStyles = getComputedStyle($newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

	const visibleHeight = $messages.offsetHeight;
	const containerHeight = $messages.scrollHeight;

	const scrollOffset = $messages.scrollTop + visibleHeight;

	if (containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight;
	}
};

socket.on("message", ({ text, createdAt, username }) => {
	const html = Mustache.render(messageTemplate, {
		message: text,
		createdAt: moment(createdAt).format("h:mm a"),
		username: username,
	});
	$messages.insertAdjacentHTML("beforeend", html);
	autoScroll();
});

socket.on("locationMessage", ({ location, createdAt, username }) => {
	const html = Mustache.render(messageTemplate, {
		location: location,
		info: "my address",
		createdAt: moment(createdAt).format("h:mm a"),
		username: username,
	});
	$messages.insertAdjacentHTML("beforeend", html);
	autoScroll();
});

socket.on("roomInfo", ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, { room, users });
	document.getElementById("sidebar").innerHTML = html;
});

document.getElementById("message-form").addEventListener("submit", (e) => {
	e.preventDefault();
	let inputMessage = document.getElementById("message").value;
	socket.emit("sendMessage", inputMessage);
	document.getElementById("message").value = null;
});

const $getGeoLocationButton = document.getElementById("send-location");

$getGeoLocationButton.addEventListener("click", () => {
	if (!navigator.geolocation) {
		return alert("Geo location not supported");
	}

	$getGeoLocationButton.setAttribute("disabled", "disabled");
	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit(
			"sendLocation",
			`https://google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`,
			(ack) => {
				$getGeoLocationButton.removeAttribute("disabled");
			}
		);
	});
});

socket.emit("join", { username, room }, (err) => {
	if (err) {
		alert(err);
		location.href = "/";
	}
});
