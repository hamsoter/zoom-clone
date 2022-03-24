import express from "express";
import http from "http";
// import { WebSocketServer } from "ws";
import path, { dirname, parse } from "path";

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
const wsServer = new Server(httpServer);

wsServer.on("connection", (socket) => {
  socket.onAny((e) => {
    console.log("socket event: ", e);
  });

  // 입장
  socket.on("enter_room", ({ roomName }, done) => {
    socket.join(roomName);
    done(roomName);
    console.log(roomName);
    socket.to(roomName).emit("welcome");
  });

  // 퇴장
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye");
    });
  });

  socket.on("new_message", (msg, roomName, done) => {
    socket.to(roomName).emit("new_message", msg);
    done();
  });
});

// 같은 포트 공유
httpServer.listen(3000, handlerListen);
