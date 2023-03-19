"use strict";
// socket
import io from "socket.io-client";
const socket = io();
// canvas生成
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 400;

// 画像取得
const imgSrc = ["./img/pome_eat.png", "./img/spring.png"];
const img = [];
for (var i in imgSrc) {
  img[i] = new Image();
  img[i].src = imgSrc[i];
}
// 音声取得
/*
const audioSrc = ["./sound/se_bark.mp3", "./sound/se_eat.mp3"];
const audio = [];
for (var i in audioSrc) {
  audio[i] = new Audio();
  audio[i].src = audioSrc[i];
}
*/
// 画面変更のためのメッセージ
const startScreen = document.getElementById("game-start");
const startButton = document.getElementById("start-button");
const gameOverScreen = document.getElementById("game-over");
const retryButton = document.getElementById("retry-button");
const clearScreen = document.getElementById("game-clear");
// const nextButton = document.getElementById("next-button");

startButton.onclick = function () {
  socket.emit("game-start");
};
socket.on("remove-startScreen", () => {
  startScreen.remove();
});
socket.on("game-over", () => {
  gameOverScreen.style.display = "flex";
});
retryButton.onclick = function () {
  socket.emit("retry");
};
socket.on("remove-gameOverScreen", () => {
  gameOverScreen.style.display = "none";
});
socket.on("game-clear", () => {
  clearScreen.style.display = "flex";
});

// 移動処理
let movement = {};
// イベント通信
const KeyToCommand = {
  ArrowLeft: "left",
  ArrowRight: "right",
};
document.addEventListener("keydown", (e) => {
  const command = KeyToCommand[e.key];
  movement[command] = true;
  socket.emit("movement", movement);
});
document.addEventListener("keyup", (e) => {
  const command = KeyToCommand[e.key];
  movement[command] = false;
  socket.emit("movement", movement);
});

// player・ball描画
socket.on("state", (players, pome, block) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  Object.values(players).forEach((player) => {
    ctx.drawImage(
      img[1],
      0,
      0,
      94,
      50,
      player.x,
      player.y,
      player.width,
      player.height
    );
  });
  ctx.drawImage(img[0], 0, 0, 124, 60, pome.x, pome.y, pome.width, pome.height);
  block.data.forEach((el) => {
    ctx.fillStyle = el.color;
    ctx.fillRect(el.x, el.y, el.width - 1, el.height - 1);
    ctx.fill();
  });
});

socket.on("connect", console.log("client connected"));
/* 
// 構成要素
const paddle = {
  x: null,
  y: null,
  width: 39,
  height: 23,
  speed: 0,
  // 描画
  update: function () {
    ctx.drawImage(
      img[2],
      0,
      0,
      26,
      15,
      this.x,
      this.y,
      this.width,
      this.height
    );
    this.x += this.speed;
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
  },
};

// 処理関数
const init = () => {
  paddle.x = canvas.width / 2 - paddle.width / 2;
  paddle.y = canvas.height - paddle.height;

  ball.x = canvas.width / 2 - ball.width / 2;
  ball.y = (canvas.height * 3) / 5;
  ball.dx = ball.speed;
  ball.dy = ball.speed;

  block.width = canvas.width / level[levelFlag][0].length;
  for (let i = 0; i < level[levelFlag].length; i++) {
    for (let j = 0; j < level[levelFlag][i].length; j++) {
      if (level[levelFlag][i][j]) {
        block.data.push({
          x: block.width * j,
          y: block.height * i,
          width: block.width,
          height: block.height,
          color: palette[levelFlag][level[levelFlag][i][j] - 1],
        });
      }
    }
  }
};

const loop = () => {
  if (gameOverFlag) {
    return gameOver();
  }

  if (clearFlag) {
    return gameClear();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  paddle.update();
  ball.update();
  block.update();
  // 当たり判定
  if (collide(ball, paddle)) {
    ball.dy *= -1;
    ball.y = paddle.y - ball.height;
    audio[0].currentTime = 0;
    audio[0].play();
  }
  block.data.forEach((el, index) => {
    if (collide(ball, el)) {
      ball.dy *= -1;
      block.data.splice(index, 1);
      audio[1].currentTime = 0;
      audio[1].volume = 0.2;
      audio[1].play();
    }
  });
*/
