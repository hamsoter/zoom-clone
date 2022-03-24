const socket = io();

const welcome = document.getElementById("welcome");
const room = document.getElementById("room");
const form = welcome.querySelector("form");

room.hidden = true;

let roomName;
let prevNickname;

const addMessage = (msg) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  ul.appendChild(li);
};

const handleMessageSubmit = (e) => {
  e.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`나: ${value}`);
  });
  input.value = "";
};

const handleNicknameSubmit = (e) => {
  e.preventDefault();
  const input = room.querySelector("#nickname input");
  const value = input.value;

  // 나한테만 보이는 이유가...?
  socket.emit("nickname", input.value, () => {
    addMessage(`닉네임 변경!( ﾉ ﾟｰﾟ)ﾉ ${prevNickname} => ${value}`);
    prevNickname = value;
  });
  input.value = "";
};

const showRoom = (anonNickname) => {
  welcome.hidden = true;
  room.hidden = false;

  prevNickname = anonNickname;

  const h3 = room.querySelector("h3");
  h3.innerText = `# ${roomName}`;

  const msgForm = room.querySelector("#msg");
  const nicknameForm = room.querySelector("#nickname");

  msgForm.addEventListener("submit", handleMessageSubmit);
  nicknameForm.addEventListener("submit", handleNicknameSubmit);
};

const handleRoomSubmit = (e) => {
  e.preventDefault();

  // prevNickname = { nickname };
  const input = form.querySelector("input");

  // 프론트 => 서버 데이터 전송
  socket.emit("enter_room", { roomName: input.value }, showRoom);
  roomName = input.value;
  input.value = "";
};

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (nickname) => {
  addMessage(`${nickname}(이)가 ${roomName}에 입장했습니다.`);
});

socket.on("bye", (nickname) => {
  addMessage(`${nickname}(이)가 ${roomName}을(를) 떠났습니다.`);
});

socket.on("new_message", (msg, nickname) => {
  addMessage(`${nickname}: ${msg}`);
});
