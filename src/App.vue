<template>
  <div id="app">
    <div class="app-wrap">
      <GameBoard />
      <div>
        <hr />
        <h3>Vue.js Snake</h3>
      </div>
    </div>
  </div>
</template>

<script>
import GameBoard from './components/Game.vue';

export default {
  name: 'App',
  components: {
    GameBoard
  }
};
</script>
<style>
@import "./assets/main.css";
</style>
