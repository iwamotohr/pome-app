import io from "socket.io-client";

// フラグ
var clearFlag = false;
var gameOverFlag = false;
var levelFlag = 0;
// canvas生成
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 400;
canvas.setAttribute(
  "style",
  "display: block; margin: auto; border: solid 3px #666;"
);
document.body.appendChild(canvas);
// 画像取得
const imgSrc = [
  "./img/pome_jump.png",
  "./img/pome_eat.png",
  "./img/spring.png",
];
const img = [];
for (var i in imgSrc) {
  img[i] = new Image();
  img[i].src = imgSrc[i];
}
// 音声取得
const audioSrc = ["./sound/se_bark.mp3", "./sound/se_eat.mp3"];
const audio = [];
for (var i in audioSrc) {
  audio[i] = new Audio();
  audio[i].src = audioSrc[i];
}
// 構成要素
const ball = {
  x: null,
  y: null,
  width: 64,
  height: 30,
  speed: 2,
  dx: null,
  dy: null,
  // 描画
  update: function () {
    ctx.drawImage(
      img[0],
      0,
      0,
      32,
      15,
      this.x,
      this.y,
      this.width,
      this.height
    );

    if (this.x < 0 || this.x + this.width > canvas.width) this.dx *= -1;
    if (this.y < 0) this.dy *= -1;
    if (this.y + this.height > canvas.height) {
      this.dx = 0;
      this.dy = 0;
      gameOverFlag = true;
    }
    this.x += this.dx;
    this.y += this.dy;
  },
};
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
const block = {
  width: null,
  height: 20,
  data: [],
  // 描画
  update: function () {
    this.data.forEach((el) => {
      ctx.fillStyle = el.color;
      ctx.fillRect(el.x, el.y, el.width - 1, el.height - 1);
      ctx.fill();
    });
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
const level_3 = {
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
    [0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0],
  ],
  palette: ["#f5f5f5", "#d3d3d3", "#8b4513"],
};
const level = [level_1.brick, level_2.brick, level_3.brick];
const palette = [level_1.palette, level_2.palette, level_3.palette];

// user通信
const sockets = {
  sockets: null,

  init() {
    const socketProtocol = window.location.protocol.includes("https")
      ? "wss"
      : "ws";
    this.socket = io(`${socketProtocol}://${window.location.host}`, {
      reconnection: false,
    });
    this.registerConnection();
  },

  registerConnection() {
    const connectedPromise = new Promise((resolve) => {
      this.socket.on("connect", () => {
        console.log("client connected to server");
        resolve();
      });
    });

    connectedPromise.then(() => {
      const syncUpdate = (update) => (renderer.gameUpdate = update);
      this.socket.on("update", syncUpdate);
    });
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
const collide = (obj1, obj2) => {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj2.x < obj1.x + obj1.width &&
    obj1.y < obj2.y + obj2.height &&
    obj2.y < obj1.y + obj1.height
  );
};

const gameOver = () => {
  ctx.fillStyle = " #333";
  ctx.font = "24px monospace";
  ctx.strokeText(
    "GAME OVER...",
    canvas.width / 2 - 110 / 2,
    (canvas.height * 3) / 5
  );
  ctx.strokeText(
    "Press ENTER key to retry",
    canvas.width / 2 - 300 / 2,
    (canvas.height * 3) / 5 + 32
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      window.location.reload();
    }
  });
};

const gameClear = () => {
  ctx.fillStyle = " #333";
  ctx.font = "24px monospace";
  ctx.strokeText(
    "GAME CLEAR!!",
    canvas.width / 2 - 110 / 2,
    (canvas.height * 1) / 2
  );
  ctx.strokeText(
    "Press ENTER key to next stage",
    canvas.width / 2 - 340 / 2,
    (canvas.height * 1) / 2 + 32
  );
  levelFlag += 1;
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
  if (!block.data.length)
    setTimeout(() => {
      clearFlag = true;
    }, 200);

  // ブラウザ適正タイミングで繰り返し処理実行
  window.requestAnimationFrame(loop);
};

const nextStage = () => {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      clearFlag = false;
      init();
      loop();
    }
  });
};

// 処理実行
sockets.init();
init();
loop();
nextStage();

// イベント処理
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") paddle.speed = -6;
  if (e.key === "ArrowRight") paddle.speed = 6;
});
document.addEventListener("keyup", () => {
  paddle.speed = 0;
});
