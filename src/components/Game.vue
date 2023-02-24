<template>
  <div>
    <div v-if="!isGameStarted">
      <form>
        <label for="player-name">Enter your name:</label>
        <input
          v-show="!isGameStarted"
          type="text"
          id="player-name"
          v-model="username"
          required
        />
        <button type="submit" @click.prevent="startGame()">Start Game</button>
      </form>
    </div>
    <div v-else>
      <div>
        <div class="gameScore">
          {{ username }}'s Score: {{ score }} | Time: {{ elapsedTime }}s
        </div>
        <div class="gamePlayerName">
          Player Name: <input v-model="username" />
        </div>
        <div
          id="gameMain"
          class="gameBoard"
          :style="'grid-template-columns: repeat(' + maxXY + ', auto);'"
        >
          <template class="gameItem" v-for="rowItem in rows">
            <div
              class="gameItem"
              v-bind:class="{
                gameSnake: cellItem.IsBody,
                gamePrice: cellItem.IsPrice,
                gameCrashed: cellItem.IsBody && crashed,
              }"
              v-for="cellItem in rowItem"
              :key="cellItem.Index"
            ></div>
          </template>
        </div>
        <div class="gameActions">
          <button
            v-if="!crashed && paused"
            @click="changePause"
            type="button"
            class="btn btn-sm btn-primary"
          >
            Continue
          </button>
          <button
            v-if="!crashed && !paused"
            @click="changePause"
            type="button"
            class="btn btn-sm btn-secondary"
          >
            Pause
          </button>
          <button
            v-if="crashed"
            @click="resetGame"
            type="button"
            class="btn btn-sm btn-primary"
          >
            Restart
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SingleCell from "./singleCell.js";
import SnakeBodyPart from "./snakeBodyPart.js";
export default {
  name: "GameMain",
  data() {
    return {
      isGameStarted: false,
      rows: [],
      username: "",
      bodyParts: [],
      price: null,
      crashed: false,
      maxXY: 20,
      speedVal: 2,
      speedMultiplier: 100.0,
      dirX: 0,
      dirY: 0,
      dirNext: "R",
      score: 0,
      paused: false,
      timer: 0,
      startTime: null,
    };
  },
  created() {
    this.init();
  },
  mounted() {
    window.addEventListener("keypress", (e) => {
      this.setNextDirection(String.fromCharCode(e.keyCode));
    });
    window.addEventListener("keydown", (e) => {
      this.setNextDirection(e.keyCode);
    });
  },
  computed: {
    elapsedTime() {
      if (!this.startTime) {
        return 0;
      }
      const now = new Date();
      return Math.floor((now - this.startTime) / 1000); // in seconds
    },
  },
  methods: {
    startGame() {
      if (this.username) {
        this.isGameStarted = true;
      } else {
        alert("Please enter your name!");
      }
    },
    init() {
      let i = 0;
      for (let y = 0; y < this.maxXY; y++) {
        this.rows.push([]);
        for (let x = 0; x < this.maxXY; x++) {
          this.rows[y].push(new SingleCell(x, y, i));
          i++;
        }
      }

      this.setValuesOfDirection();

      this.snakeInit();

      this.setPrice();

      this.startingTimer();

      this.resetTimer();
    },
    resetGame() {
      this.rows = [];
      this.bodyParts = [];
      this.price = null;
      this.crashed = false;
      this.paused = false;
      this.score = 0;
      this.speedMultiplier = 100.0;
      this.timer = 0;
      this.startTime = new Date();

      this.init();
    },
    setNextDirection(key) {
      switch (key) {
        case "w":
        case 38:
          this.dirNext = "T";
          break;
        case "a":
        case 37:
          this.dirNext = "L";
          break;
        case "s":
        case 40:
          this.dirNext = "D";
          break;
        case "d":
        case 39:
          this.dirNext = "R";
          break;
      }
    },
    changePause() {
      this.paused = !this.paused;

      this.resetTimer();
    },
    setValuesOfDirection() {
      if (this.dirNext) {
        switch (this.dirNext) {
          case "T":
            if (this.dirY === 0) {
              this.dirX = 0;
              this.dirY = -1;
            }
            break;
          case "R":
            if (this.dirX === 0) {
              this.dirX = 1;
              this.dirY = 0;
            }
            break;
          case "D":
            if (this.dirY === 0) {
              this.dirX = 0;
              this.dirY = 1;
            }
            break;
          case "L":
            if (this.dirX === 0) {
              this.dirX = -1;
              this.dirY = 0;
            }
            break;
        }
        this.dirNext = "";
      }
    },
    startingTimer() {
      setInterval(() => {
        this.timer++;
      }, 1000);
    },

    moveSnake() {
      this.setValuesOfDirection();

      let head = this.bodyParts[0];

      let y = head.Y;
      let x = head.X;

      if (this.dirX != 0) {
        x = x + this.dirX;
      }
      if (this.dirY != 0) {
        y = y + this.dirY;
      }

      if (x > this.maxXY - 1) {
        x = 0;
      } else if (x < 0) {
        x = this.maxXY - 1;
      }

      if (y > this.maxXY - 1) {
        y = 0;
      } else if (y < 0) {
        y = this.maxXY - 1;
      }

      if (this.moveSnakeHead(x, y)) {
        if (this.price.IsBody) {
          //snake got the price
          this.price.IsPrice = false;
          this.price.IsPreviousPrice = true;
          this.setPrice();
          this.speedMultiplier -= 2;
          this.score += 10;
        }
        let tail = this.bodyParts[this.bodyParts.length - 1];
        let tailCell = this.rows[tail.Y][tail.X];

        if (tailCell.isPreviousPrice) {
          //tail is on the previous price. it must be added to the body
          tailCell.isPreviousPrice = false;
        } else {
          this.bodyParts.pop();
          tailCell.IsBody = false;
        }

        for (let item of this.bodyParts) {
          let cellItem = this.rows[item.Y][item.X];
          cellItem.isBody = true;
        }

        this.resetTimer();
      } else {
        this.crashed = true;
      }
    },
    snakeInit() {
      let x = this.randomInteger(3, this.maxXY - 1);
      let y = this.randomInteger(3, this.maxXY - 1);

      this.moveSnakeHead(x, y);
    },
    moveSnakeHead(x, y) {
      this.bodyParts.unshift(new SnakeBodyPart(x, y));

      let cellItem = this.rows[y][x];
      if (cellItem.IsBody) {
        return false;
      } else {
        cellItem.IsBody = true;
        return true;
      }
    },
    setPrice() {
      while (!(this.price && this.price.IsPrice)) {
        let x = this.randomInteger(0, this.maxXY - 1);
        let y = this.randomInteger(0, this.maxXY - 1);

        this.price = this.rows[y][x];

        if (this.price.IsBody) {
          //price is on the body. set a new one
          this.price = null;
        } else {
          this.price.IsPrice = true;
        }
      }
    },
    resetTimer() {
      if (!this.paused) {
        setTimeout(
          () => this.moveSnake(),
          this.speedVal * this.speedMultiplier
        );
      }
    },
    randomInteger(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
  },
};
</script>
