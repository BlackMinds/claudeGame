<template>
  <div id="app">
    <GameMain />
  </div>
</template>

<script>
import GameMain from './components/game/GameMain.vue'

export default {
  name: 'App',
  components: {
    GameMain
  }
}
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
