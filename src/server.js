import express from "express";
import http from "http";
// import { WebSocketServer } from "ws";
import path, { dirname, parse } from "path";

import { Server } from "socket.io";

const app = express();
const __dirname = path.resolve();

// privite + public rooms
const publicRoomsHandler = () => {
  const {
    socket: {
      adapter: { side, rooms },
    },
  } = wsServer;
  // private room
  // const sids = wsServer.sockets.adapter.sids;
  // const rooms = wsServer.sockets.adapter.rooms;

  const publicRooms = [];

  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
};

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
const wsServer = new Server(httpServer);

// 임의의 6자리 코드 생성
const randomHash = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

wsServer.on("connection", (socket) => {
  const randomCode = randomHash();
  // 초기 닉네임
  socket["nickname"] = `손님#${randomCode}`;

  console.log(socket.nickname);
  socket.onAny((e) => {
    console.log(wsServer.sockets.adapter);
    console.log("socket event: ", e);
  });

  // 입장
  socket.on("enter_room", ({ roomName }, done) => {
    socket.join(roomName);
    done(socket.nickname);
    socket.to(roomName).emit("welcome", socket.nickname);
  });

  // 퇴장
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", socket.nickname);
    });
  });

  socket.on("new_message", (msg, roomName, done) => {
    socket.to(roomName).emit("new_message", msg, socket.nickname);
    done();
  });

  socket.on("nickname", (nickname, done) => {
    socket["nickname"] = nickname;
    done();
  });
});

// 같은 포트 공유
httpServer.listen(3000, handlerListen);
