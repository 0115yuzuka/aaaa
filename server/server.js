const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const HOST = "172.24.81.53"; // 指定されたIPアドレスでリッスン

// 静的ファイルの提供
app.use("/pc", express.static(path.join(__dirname, "../PC_client")));
app.use("/mobile", express.static(path.join(__dirname, "../Mobile_client")));

app.get("/", (req, res) => {
  const userAgent = req.headers["user-agent"];
  if (/mobile/i.test(userAgent)) {
    res.redirect("/mobile");
  } else {
    res.redirect("/pc");
  }
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("register", (data) => {
    console.log(`Client registered as ${data.clientType}`);
  });

  socket.on("movement", (data) => {
    console.log("Movement data received:", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
