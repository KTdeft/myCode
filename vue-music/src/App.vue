<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script>
import MHeader from 'cpnts/m-header/m-header'
import Tab from 'cpnts/tab/tab'
import Player from 'cpnts/player/player'

export default {
  data () {
    return {
    }
  },
  components: {
    MHeader,
    Tab,
    Player
  }
}
</script>

<style lang="scss">
@import 'common/scss/index.scss';
#app {
  position: fixed;
  top: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
