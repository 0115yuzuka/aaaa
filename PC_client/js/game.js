class FishingGame {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext("2d");
    this.lurePosition = { x: window.innerWidth / 2, y: 100 };
    this.fishes = [];

    // センサー関連の設定
    this.setupSocketIo();
    this.setupMotionSensor();
    this.setupGyroscope();
    this.setupButtonClick(); // ボタンクリック処理のセットアップ

    this.createFishes();
    this.startGameLoop();
  }

  setupSocketIo() {
    this.socket = io("http://172.24.81.36:3000"); // サーバーのIPアドレスとポートを指定

    this.socket.on("connect", () => {
      console.log("Connected to server");
      this.socket.emit("register", { clientType: "pc" });
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

    this.socket.on("movement", (data) => {
      console.log("Received movement data:", data); // 受け取ったデータをコンソールに表示
      this.updateLurePosition(data.x, data.y, data.z);
    });

    this.socket.on("gyroscope", (data) => {
      console.log("Gyroscope data received:", data);
      this.updateLurePositionWithGyroscope(data.alpha, data.beta, data.gamma);
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

        this.socket.emit("movement", { x, y, z }, (response) => {
          console.log("Movement data sent, server response:", response);
        });
      });
    } else {
      console.error("モーションセンサーがサポートされていません。");
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

        this.socket.emit("gyroscope", { alpha, beta, gamma }, (response) => {
          console.log("Gyroscope data sent, server response:", response);
        });
      });
    } else {
      console.error("ジャイロセンサーがサポートされていません。");
      alert("このデバイスはジャイロセンサーをサポートしていません。");
    }
  }

  setupButtonClick() {
    const button = document.getElementById("sendButton"); // ボタンのIDを指定
    if (button) {
      button.addEventListener("click", () => {
        const message = "ボタンがクリックされました！"; // 送信するメッセージ
        console.log(message); // コンソールに表示

        // サーバーにメッセージを送信
        this.socket.emit("button_clicked", { message: message }, (response) => {
          console.log("Button click data sent, server response:", response);
        });
      });
    }
  }

  updateLurePosition(x, y, z) {
    // 加速度データに基づいてルアーの位置を更新
    this.lurePosition.x += x * 10;
    this.lurePosition.y = Math.max(
      100,
      Math.min(window.innerHeight - 100, this.lurePosition.y + y * 5)
    );
  }

  updateLurePositionWithGyroscope(alpha, beta, gamma) {
    // ジャイロデータに基づいてルアーの位置を更新 (角度の変更に基づいて位置を調整)
    this.lurePosition.x += gamma * 5; // gamma を x 軸の移動に使う
    this.lurePosition.y -= beta * 5; // beta を y 軸の移動に使う

    // 画面内に収めるように制限
    this.lurePosition.x = Math.max(
      0,
      Math.min(window.innerWidth, this.lurePosition.x)
    );
    this.lurePosition.y = Math.max(
      100,
      Math.min(window.innerHeight - 100, this.lurePosition.y)
    );
  }

  createFishes() {
    for (let i = 0; i < 5; i++) {
      this.fishes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * (window.innerHeight - 200) + 200,
        speed: Math.random() * 2 + 1,
        direction: Math.random() < 0.5 ? -1 : 1,
      });
    }
  }

  startGameLoop() {
    const update = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // 魚の描画と移動
      this.fishes.forEach((fish) => {
        fish.x += fish.speed * fish.direction;
        if (fish.x < 0 || fish.x > window.innerWidth) {
          fish.direction *= -1;
        }

        this.ctx.fillStyle = "#000080";
        this.ctx.beginPath();
        this.ctx.arc(fish.x, fish.y, 20, 0, Math.PI * 2);
        this.ctx.fill();
      });

      // ルアーの描画
      this.ctx.fillStyle = "#FF0000";
      this.ctx.beginPath();
      this.ctx.arc(
        this.lurePosition.x,
        this.lurePosition.y,
        10,
        0,
        Math.PI * 2
      );
      this.ctx.fill();

      // 釣り糸の描画
      this.ctx.strokeStyle = "#FFFFFF";
      this.ctx.beginPath();
      this.ctx.moveTo(this.lurePosition.x, 0);
      this.ctx.lineTo(this.lurePosition.x, this.lurePosition.y);
      this.ctx.stroke();

      requestAnimationFrame(update);
    };

    update();
  }
}

window.onload = () => {
  new FishingGame();
};
