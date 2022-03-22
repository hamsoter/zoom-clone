const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nick");

const backSocket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

backSocket.addEventListener("oepn", () => {
  console.log("Connented to Server👀");
});

backSocket.addEventListener("message", (message) => {
  console.log("메세지: ", message.data, " from the Server");
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});

backSocket.addEventListener("close", () => {
  console.log("Disconnented to Server👋");
});

const handleSubmit = (e) => {
  e.preventDefault();
  const input = messageForm.querySelector("input");
  // backSocket.send(input.value);
  backSocket.send(makeMessage("new_message", input.value));
  console.log(input.value);
  input.value = "";
};

const handleNickSubmit = (e) => {
  e.preventDefault();
  const input = nickForm.querySelector("input");
  backSocket.send(makeMessage("nickname", input.value));

  console.log(input.value);
  input.value = "";
};

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
