import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import path, { dirname } from "path";
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

// function handleConnection(frontSocket) {
//   console.log(frontSocket);
// }

wss.on("connection", (frontSocket) => {
  console.log("connented to Browser👀");

  //브라우저를 닫을시
  frontSocket.on("close", () => console.log("Disconnented from the Browser👋"));

  // 메세지를 받는 이벤트
  frontSocket.on("message", (message) => {
    console.log("message: " + message.toString("utf-8") + " from the Server");
  });
  // message를 전송
  frontSocket.send("후타바안즈 귀여워");
});

// 같은 포트 공유
server.listen(3000, handlerListen);
