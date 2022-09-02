import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors"

import { addUser, removeUser, getUser, getUsersInRoom } from "./users.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  /* options */
  cors: true,
});

app.use(cors())

io.on("connection", (socket) => {
  console.log("connected");

  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to the room ${user.room}`,
    });
    socket.broadcast.to(user.room).emit("message", {
      user: "admin",
      text: `${user.name}, has joined!`,
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });

    callback();
  });

  socket.on("disconnect", () => {
    console.log("dc!!!");
  });
});

httpServer.listen(5000);
