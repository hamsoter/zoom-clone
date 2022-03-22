const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");

const backSocket = new WebSocket(`ws://${window.location.host}`);

backSocket.addEventListener("oepn", () => {
  console.log("Connented to Server👀");
});

backSocket.addEventListener("message", (message) => {
  console.log("메세지: ", message.data, " from the Server");
});

backSocket.addEventListener("close", () => {
  console.log("Disconnented to Server👋");
});

const handleSubmit = (e) => {
  e.preventDefault();
  const input = messageForm.querySelector("input");
  backSocket.send(input.value);
  console.log(input.value);
  input.value = "";
};

messageForm.addEventListener("submit", handleSubmit);
