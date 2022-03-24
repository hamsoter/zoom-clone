const socket = io();

const welcome = document.getElementById("welcome");
const room = document.getElementById("room");
const form = welcome.querySelector("form");

room.hidden = true;

let roomName;

function addMessage(msg) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  ul.appendChild(li);
}

const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;

  const h3 = room.querySelector("h3");
  h3.innerText = `# ${roomName}`;
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
  addMessage("누군가 채팅방에 입장했습니다.");
  console.log("누군가");
});
