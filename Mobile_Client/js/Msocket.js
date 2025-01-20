// サーバーのIPアドレスとポートを指定して接続
const socket = io("http://172.24.81.36:3000");

// 接続確認
socket.on("connect", () => {
  console.log("サーバーに接続しました");
  // クライアントタイプを登録
  socket.emit("register", { clientType: "mobile" });
});

// 接続エラー時
socket.on("connect_error", (error) => {
  console.log("接続エラー:", error);
});
