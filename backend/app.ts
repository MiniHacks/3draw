import { config } from "dotenv"
config()

import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

const app = express();
app.use(cors());
app.use(express.static("static"))

const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" },
    path: "/express/socket.io",
});

const PORT = parseInt(process.env.PORT || "3001");

app.get("/", (req, res) => {
    res.send("hello world :)");
});


io.on("connection", (socket) => {
    console.log({ id: socket.id, event: "connection" });
    socket.emit("message", "Connected to socket!");
    socket.emit("message", "ID: " + socket.id);
    socket.on("disconnect", (reason) => {
        console.log({ id: socket.id, event: "disconnect", reason });
    });
    socket.on("disconnecting", (reason) => {
        console.log({ id: socket.id, event: "disconnecting", reason });
    });
});

server.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT}`);
});