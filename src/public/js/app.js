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

setTimeout(() => {
  backSocket.send("브라우저야!!!!!!!!!!!!");
}, 3000);
