class FishingController {
  constructor() {
    this.socket = io("http://172.24.81.53:3000"); // サーバーのIPアドレスとポートを指定
    this.setupSocketIo();
    this.setupMotionSensor();
  }

  setupSocketIo() {
    this.socket.on("connect", () => {
      this.socket.emit("register", { clientType: "mobile" });
      document.getElementById("status").textContent = "接続完了！";
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      document.getElementById("status").textContent = "接続エラー";
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
      document.getElementById("status").textContent = "切断されました";
    });
  }

  setupMotionSensor() {
    if (window.DeviceMotionEvent) {
      window.addEventListener("devicemotion", (event) => {
        const x = event.accelerationIncludingGravity.x;
        const y = event.accelerationIncludingGravity.y;
        const z = event.accelerationIncludingGravity.z;

        this.socket.emit("movement", { x, y, z });
      });
    } else {
      alert("このデバイスはモーションセンサーをサポートしていません。");
    }
  }
}

window.onload = () => {
  new FishingController();
};
