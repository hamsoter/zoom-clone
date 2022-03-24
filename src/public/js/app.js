const socket = io();

const welcome = document.getElementById("welcome");
const room = document.getElementById("room");
const form = welcome.querySelector("form");

room.hidden = true;

let roomName;

const addMessage = (msg) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  ul.appendChild(li);
};

const handleMessageSubmit = (e) => {
  e.preventDefault();
  const input = room.querySelector("input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`나: ${value}`);
  });
  input.value = "";
};

const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;

  const h3 = room.querySelector("h3");
  h3.innerText = `# ${roomName}`;

  const form = room.querySelector("form");

  form.addEventListener("submit", handleMessageSubmit);
};

const handleRoomSubmit = (e) => {
  e.preventDefault();
  const input = form.querySelector("input");

  // 프론트 => 서버 데이터 전송
  socket.emit("enter_room", { roomName: input.value }, showRoom);
  roomName = input.value;
  input.value = "";
};

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", () => {
  addMessage(`누군가 ${roomName}에 입장했습니다.`);
});

socket.on("bye", () => {
  addMessage(`누군가 ${roomName}을(를) 떠났습니다.`);
});

socket.on("new_message", (msg) => {
  addMessage(`낯선 사람: ${msg}`);
});
