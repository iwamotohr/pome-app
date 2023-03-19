const express = require("express");
const socketIO = require("socket.io");
// const { config } = require("webpack");

// Spin up server
const app = express();
app.use(express.static("dist"));

const port = process.env.PORT || 3000;
const server = app.listen(port);
console.log(`server listening on port ${port}`);

// canvasサイズ
const FIELD_WIDTH = 400,
  FIELD_HEIGHT = 400;

// player
class Player {
  constructor() {
    this.id = Math.floor(Math.random() * 1000000000);
    this.width = 47;
    this.height = 25;
    this.x = Math.random() * (FIELD_WIDTH - this.width);
    this.y = FIELD_HEIGHT - this.height;
    this.movement = {};
  }
  move(speed) {
    this.x += speed;
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > FIELD_WIDTH) this.x = FIELD_WIDTH - this.width;
  }
}
let players = {};

// pome
const pome = {
  x: null,
  y: null,
  width: 64,
  height: 30,
  speed: 5,
  dx: null,
  dy: null,
  move() {
    if (this.x < 0 || this.x + this.width > FIELD_WIDTH) this.dx *= -1;
    if (this.y < 0) this.dy *= -1;
    if (this.y + this.height > FIELD_HEIGHT) {
      this.dx = 0;
      this.dy = 0;
      io.sockets.emit("game-over");
    }
    this.x += this.dx;
    this.y += this.dy;
  },
};

// block
const block = {
  width: null,
  height: 20,
  data: [],
  remove() {
    this.data = [];
  },
};
const level_1 = {
  brick: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 0],
    [0, 0, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 2, 0],
    [0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0],
    [0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0],
  ],
  palette: ["#f5f5f5", "#d3d3d3", "#a9a9a9"],
};
const level_2 = {
  brick: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  palette: ["#FF0000", "#FF4500", "#a9a9a9"],
};
const level = [level_1.brick, level_2.brick];
const palette = [level_1.palette, level_2.palette];
let stage = 0;

// 当たり判定
const collide = (obj1, obj2) => {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj2.x < obj1.x + obj1.width &&
    obj1.y < obj2.y + obj2.height &&
    obj2.y < obj1.y + obj1.height
  );
};

const init = () => {
  // pome
  pome.x = FIELD_WIDTH / 2 - pome.width / 2;
  pome.y = (FIELD_HEIGHT * 3) / 5;
  // block
  block.width = FIELD_WIDTH / level[stage][0].length;
  for (let i = 0; i < level[stage].length; i++) {
    for (let j = 0; j < level[stage][i].length; j++) {
      if (level[stage][i][j]) {
        block.data.push({
          x: block.width * j,
          y: block.height * i,
          width: block.width,
          height: block.height,
          color: palette[stage][level[stage][i][j] - 1],
        });
      }
    }
  }
};

init();

// Socket通信中の処理
const io = socketIO(server);
io.on("connection", (socket) => {
  // player
  let player = null;
  player = new Player({
    socketId: socket.id,
  });
  players[socket.id] = player;
  console.log(players);
  // ゲームスタート
  socket.on("game-start", () => {
    pome.dx = pome.speed;
    pome.dy = pome.speed;
    io.sockets.emit("remove-startScreen");
  });
  // playerの操作
  socket.on("movement", function (movement) {
    if (!player) {
      return;
    }
    player.movement = movement;
  });
  // player通信切断時
  socket.on("disconnect", () => {
    if (!player) {
      return;
    }
    delete players[player.id];
    player = null;
  });
  socket.on("retry", () => {
    block.remove();
    init();
    io.sockets.emit("remove-gameOverScreen");
    pome.dx = pome.speed;
    pome.dy = pome.speed;
  });
});

// 画面のステータス送信（ループ処理）
setInterval(() => {
  Object.values(players).forEach((player) => {
    const movement = player.movement;
    if (movement.right) {
      player.move(8);
    }
    if (movement.left) {
      player.move(-8);
    }
    if (collide(player, pome)) {
      pome.dy *= -1;
      pome.y = player.y - pome.height;
    }
  });
  pome.move();
  block.data.forEach((el, index) => {
    if (collide(pome, el)) {
      pome.dy *= -1;
      block.data.splice(index, 1);
    }
  });
  if (!block.data.length) {
    io.sockets.emit("game-clear");
    pome.dx *= 0;
    pome.dy *= 0;
  }

  io.sockets.emit("state", players, pome, block);
}, 1000 / 30);