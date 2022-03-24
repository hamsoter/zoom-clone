import express from "express";
import http from "http";
// import { WebSocketServer } from "ws";
import path from "path";
import { instrument } from "@socket.io/admin-ui";

import { Server } from "socket.io";

const app = express();
const __dirname = path.resolve();

// privite + public rooms
const publicRoomsHandler = () => {
  // private room
  const sids = wsServer.sockets.adapter.sids;
  const rooms = wsServer.sockets.adapter.rooms;

  const publicRooms = [];

  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
};

// 방 인원수 체크
const countUsers = (roomName) => {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
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
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(wsServer, {
  // 패스워드 설정
  auth: false,
});

// 임의의 6자리 코드 생성
const randomHash = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

wsServer.on("connection", (socket) => {
  const randomCode = randomHash();
  // 초기 닉네임
  socket["nickname"] = `손님#${randomCode}`;

  socket.onAny((e) => {
    console.log("socket event: ", e);
  });

  wsServer.sockets.emit("room_change", publicRoomsHandler());
  // 입장
  socket.on("enter_room", ({ roomName }, done) => {
    socket.join(roomName);
    done(socket.nickname, countUsers(roomName));

    socket
      .to(roomName)
      .emit("enter_room", socket.nickname, countUsers(roomName));

    // 데이터를 하나의(특정방) 소켓에 전송
    socket.to(roomName).emit("welcome", socket.nickname, countUsers(roomName));

    // 데이터를(현재 public room) 모든 소켓에게 전송
    wsServer.sockets.emit("room_change", publicRoomsHandler());
  });

  // 퇴장 (소켓이 방을 떠나기 직전)
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", socket.nickname, countUsers(room) - 1);
    });
  });

  // 퇴장한 후
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRoomsHandler());
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
