import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import path, { dirname, parse } from "path";
import { Socket } from "dgram";

const app = express();
const __dirname = path.resolve();

console.log("hello");

// setting
app.set("view engine", "pug");
app.set("views", __dirname + "/src/views");

// static url
app.use("/public", express.static(__dirname + "/src/public"));

// home.pug render
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handlerListen = () => console.log(`Listening on ws://localhost:3000`);

// http server
const server = http.createServer(app);
// http server위에 websocket server 생성
const wss = new WebSocketServer({ server });

// 접속된 소켓을 담을 공간
const sockets = [];

wss.on("connection", (frontSocket) => {
  sockets.push(frontSocket);
  console.log("connented to Browser👀");

  frontSocket["nickname"] = "Anon";

  frontSocket.on("close", () => console.log("Disconnented from the Browser👋"));

  // 접속중인 모든 소켓에 메세지를 전송
  frontSocket.on("message", (msg) => {
    const message = JSON.parse(msg);

    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${frontSocket.nickname}: ${message.payload}`)
        );
      case "nickname":
        frontSocket["nickname"] = message.payload;
    }
  });
  // message를 전송
  frontSocket.send("후타바안즈 귀여워");
});

// 같은 포트 공유
server.listen(3000, handlerListen);
