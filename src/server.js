import express from "express";
import http from "http";
// import { WebSocketServer } from "ws";
import path from "path";
import { instrument } from "@socket.io/admin-ui";

import { Server } from "socket.io";

const app = express();
const __dirname = path.resolve();

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
const httpServer = http.createServer(app);
// const io = socketIO(server);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

wsServer.on("connection", (socket) => {
  socket.on("join_room", (roomName, done) => {
    socket.join(roomName);
    done();
    // 타인의 입장 테스트
    socket.to(roomName).emit("welcome");
  });
});

instrument(wsServer, {
  // 패스워드 설정
  auth: false,
});

// 같은 포트 공유
httpServer.listen(3000, handlerListen);
