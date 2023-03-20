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
