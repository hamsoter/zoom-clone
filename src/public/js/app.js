const socket = io();

const welcome = document.getElementById("welcome");

const form = welcome.querySelector("form");

const handleRoomSubmit = (e) => {
  e.preventDefault();
  const input = form.querySelector("input");

  // 프론트 => 서버 데이터 전송
  socket.emit("enter_room", { payload: input.value }, () => {
    console.log("server is done");
  });
  input.value = "";
};

form.addEventListener("submit", handleRoomSubmit);
