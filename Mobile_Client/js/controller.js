class FishingController {
  constructor() {
    this.socket = io("http://172.24.81.36:3000"); // サーバーのIPアドレスとポートを指定
    this.setupSocketIo();
    this.setupMotionSensor();
    this.setupGyroscope(); // ジャイロセンサーの設定を追加
    this.setupButtonClick();
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

        console.log("Sending movement data to server (Acceleration):", {
          x,
          y,
          z,
        });

        this.socket.emit("movement", { x, y, z });
      });
    } else {
      alert("このデバイスはモーションセンサーをサポートしていません。");
    }
  }

  setupGyroscope() {
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", (event) => {
        const alpha = event.alpha; // 回転角 (z軸)
        const beta = event.beta; // 回転角 (x軸)
        const gamma = event.gamma; // 回転角 (y軸)

        console.log("Sending gyroscope data to server:", {
          alpha,
          beta,
          gamma,
        });

        this.socket.emit("gyroscope", { alpha, beta, gamma });
      });
    } else {
      alert("このデバイスはジャイロセンサーをサポートしていません。");
    }
  }

  setupButtonClick() {
    const button = document.getElementById("actionButton"); // actionButtonというIDを指定
    if (button) {
      button.addEventListener("click", () => {
        const message = "ボタンが押されました！"; // ボタンクリック時のメッセージ
        console.log(message); // コンソールにメッセージを表示

        // サーバーにボタンクリックメッセージを送信
        this.socket.emit("button_clicked", { message: message }, (response) => {
          console.log("Button click data sent, server response:", response);
        });
      });
    }
  }
}

window.onload = () => {
  new FishingController();
};
