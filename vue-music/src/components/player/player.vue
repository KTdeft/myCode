<template>
    <div class="player" v-show="playlist.length > 0">
      <transition name="normal">
        <div class="normal-player" v-show="fullScreen">
          <div class="background">
            <!--<div class="filter"></div>-->
            <img width="100%" height="100%" :src="currentSong.image">
          </div>
          <div class="top">
            <div class="back" @click="back">
              <i class="fa fa-angle-down"></i>
            </div>
            <h1 class="title" v-html="currentSong.name"></h1>
            <h2 class="subtitle" >—&nbsp;&nbsp;{{currentSong.singer}}&nbsp;&nbsp;—</h2>
          </div>
          <div class="middle" @click="changeMiddle">
            <transition name="middleL">
              <div class="middle-l" v-show="currentShow === 'cd'">
                <div class="cd-wrapper" ref="cdWrapper">
                  <div class="cd" :class="cdCls" >
                    <img class="image" :src="currentSong.image">
                  </div>
                </div>
              </div>
            </transition>
            <transition name="middleR">
              <scroll class="middle-r" ref="lyricList" v-show="currentShow === 'lyric'" :data="currentLyric && currentLyric.lines">
                <div class="lyric-wrapper">
                  <div class="currentLyric" v-if="currentLyric">
                    <p ref="lyricLine" class="text" v-for="(line, index) in currentLyric.lines"
                       :class="{'current': currentLineNum === index}" :key="line.key">
                      {{line.txt}}
                    </p>
                  </div>
                  <p class="no-lyric" v-if="currentLyric === null">{{upDatecurrentLyric}}</p>
                </div>
              </scroll>
            </transition>
          </div>
          <div class="bottom">
            <div class="progress-wrapper">
              <span class="time time-l">{{format(currentTime)}}</span>
              <div class="progress-bar-wrapper">
                <progress-bar :percent="percent" @percentChangeEnd="percentChangeEnd"></progress-bar>
              </div>
              <span class="time time-r">{{format(duration)}}</span>
            </div>
            <div class="operators">
              <div class="icon i-left">
                <i class="iconfont mode" :class="iconMode" @click="changeMode"></i>
              </div>
              <div class="icon i-left" :class="disabelCls">
                <i class="iconfont icon-prev" @click="prev"></i>
              </div>
              <div class="icon i-center" :class="disabelCls">
                <i class="iconfont" @click="togglePlaying" :class="playIcon"></i>
              </div>
              <div class="icon i-right" :class="disabelCls">
                <i class="iconfont icon-test" @click="next"></i>
              </div>
              <div class="icon i-right">
                <i class="iconfont icon-caidan1" @click.stop="showPlaylist"></i>
              </div>
            </div>
          </div>
        </div>
      </transition>
      <transition name="mini">
        <div class="mini-player" v-show="!fullScreen" @click="open">
          <div class="icon">
            <img :class="cdCls" width="40" height="40" :src="currentSong.image">
          </div>
          <div class="text">
            <h2 class="name" v-html="currentSong.name"></h2>
            <h2 class="desc" v-html="currentSong.singer"></h2>
          </div>
          <div class="control" @click.stop="togglePlaying">
            <progress-circle :radius="radius" :percent="percent">
              <i class="fa" :class="miniIcon"></i>
            </progress-circle>
          </div>
          <div class="control" @click.stop="showPlaylist">
            <i class="iconfont icon-caidan1"></i>
          </div>
        </div>
      </transition>
      <playlist @stopMusic="stopMusic" ref="playlist"></playlist>
      <audio ref="audio" @canplay="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
    </div>
</template>

<script>
import {mapGetters, mapMutations, mapActions} from 'vuex'
import {getSong, getLyric} from 'api/song'
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/utl'
import Lyric from 'lyric-parser'
import Scroll from 'base/scroll/scroll'
import Playlist from 'cpnts/playlist/playlist'

export default {
  data () {
    return {
      url: '',
      songReady: false, // 解决快速切换歌曲问题
      currentTime: 0,
      duration: 0,
      percent: 0,
      radius: 32,
      currentLyric: null,
      currentLineNum: 0,
      playingLyric: '',
      currentShow: 'cd',
      noLyric: false
    }
  },
  computed: {
    iconMode () {
      return this.mode === playMode.sequence ? 'icon-next' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    disabelCls () {
      return this.songReady ? '' : 'disable'
    },
    // class唱片滚动
    cdCls () {
      return this.playing ? 'play' : 'play pause'
    },
    // 播放按钮样式跟随改变
    playIcon () {
      return this.playing ? 'icon-stop' : 'icon-bofangicon'
    },
    miniIcon () {
      return this.playing ? 'fa-stop' : 'fa-play'
    },
    upDatecurrentLyric () {
      if (this.noLyric) {
        return '暂无歌词'
      }
      if (!this.noLyric) {
        return '歌词加载中'
      }
    },
    ...mapGetters([
      'playlist',
      'fullScreen',
      'currentSong',
      'playing', // 获取当前播放状态
      'currentIndex',
      'mode',
      'sequenceList'
    ])
  },
  watch: {
    currentTime () {
      this.percent = this.currentTime / this.duration
    },
    // 根据ID变化，获取对应歌曲url,并改变date里的url
    currentSong (newVal, oldVal) {
      if (!newVal.id) {
        return
      }
      // 解决切换模式时的error
      if (newVal.id === oldVal.id) {
        return
      }
      this.$refs.audio.pause()
      this.$refs.audio.currentTime = 0
      this._getSong(newVal.id)
    },
    // 当data里的url变化时，audio对应的url也发生改变,并获取相应的时长
    url (newUrl) {
      this.$refs.audio.src = newUrl
      this._getLyric(this.currentSong.id)
      this.$refs.audio.play()
      let stop = setInterval(() => {
        this.duration = this.$refs.audio.duration
        if (this.duration) {
          clearInterval(stop)
        }
      }, 150)
      this.setPlayingState(true)
    }
  },
  methods: {
    stopMusic () {
      // 删除最后一首的时候暂停音乐
      this.$refs.audio.pause()
      console.log('删除最后一首的时候暂停音乐')
    },
    showPlaylist () {
      this.$refs.playlist.show()
    },
    changeMiddle () {
      if (this.currentShow === 'cd') {
        this.currentShow = 'lyric'
      } else {
        this.currentShow = 'cd'
      }
      // console.log(this.currentShow)
    },
    changeMode () {
      const mode = (this.mode + 1) % 3
      this.setPlayMode(mode)
      let list = null
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      this._resetCurrentIndex(list)
      this.setPlaylist(list)
    },
    // 设置list变化后当前播放的歌曲的新的index，避免切换模式时歌曲发生变化
    _resetCurrentIndex (list) {
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    percentChangeEnd (percent) {
      const currentTime = this.duration * percent
      this.$refs.audio.currentTime = currentTime
      if (!this.playing) {
        this.$refs.audio.play()
        this.setPlayingState(true)
      }
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000)
      }
    },
    end () {
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        this.next()
      }
    },
    loop () {
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
      if (this.currentLyric) {
        this.currentLyric.seek()
      }
    },
    prev () {
      if (!this.songReady) {
        return
      }
      let index = this.currentIndex - 1
      if (index === -1) {
        index = this.playlist.length - 1
      }
      this.setCurrentIndex(index)
      this.songReady = false
    },
    next () {
      // 看audio是否ready好
      if (!this.songReady) {
        return
      }
      let index = this.currentIndex + 1
      if (index === this.playlist.length) {
        index = 0
      }
      this.setCurrentIndex(index)
      this.songReady = false
    },
    ready () {
      this.songReady = true
    },
    error () {
      this.songReady = true
    },
    // 获取audio派发的 时间更新 事件
    updateTime (e) {
      // e.target.currentTime 可读写
      this.currentTime = e.target.currentTime
    },
    // 对时间进行格式化
    format (interval) {
      interval = interval | 0
      let minute = interval / 60 | 0
      let second = interval % 60
      if (minute < 10) {
        minute = '0' + minute
      }
      if (second < 10) {
        second = '0' + second
      }
      return `${minute}:${second}`
    },
    // 获取id对应的歌曲url和歌词
    _getSong (id) {
      getSong(id).then((response) => {
        this.url = response.data.data[0].url
        // console.log(this.url)
      })
    },
    _getLyric (id) {
      if (this.currentLyric) {
        this.currentLyric.stop()
        this.currentLyric = null
      }
      this.noLyric = false
      getLyric(id).then((res) => {
        console.log(res)
        this.currentLyric = new Lyric(res.data.lrc.lyric, this.handleLyric)
        if (this.playing) {
          this.currentLyric.play()
          // 歌词重载以后 高亮行设置为 0
          this.currentLineNum = 0
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
      }).catch(() => {
        this.currentLyric = null
        this.noLyric = true
        this.currentLineNum = 0
      })
    },
    handleLyric ({lineNum, txt}) {
      this.currentLineNum = lineNum
      // 大于5行时向上滚
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5]
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
    },
    // 提交 播放状态，并改变audio的播放状态
    togglePlaying () {
      const audio = this.$refs.audio
      this.setPlayingState(!this.playing)
      this.playing ? audio.play() : audio.pause()
      if (this.currentLyric) {
        this.currentLyric.togglePlay()
      }
    },
    back () {
      this.setFullScreen(false)
      this.currentShow = 'cd'
    },
    open () {
      this.setFullScreen(true)
    },
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN',
      setPlayingState: 'SET_PLAYING_STATE', // 用来提交播放状态
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlaylist: 'SET_PLAYLIST'
    }),
    ...mapActions([
      'savePlayHistory'
    ])
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    Playlist
  }
}
</script>

<style lang="scss" scoped>
@import "~common/scss/variable";
@import "~common/scss/mixin";
.player {
  .normal-player {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 150;
    background: grey;
    .background {
      position: absolute;
      left: -36%;
      top: 0;
      width: 166%;
      height: 100%;
      z-index: -1;
      opacity: 0.7;
      filter: blur(12px);
      .filter {
        position: absolute;
        width: 100%;
        height: 100%;
        background: black;
        opacity: 0.6;
      }
      /*.filterR {*/
        /*position: absolute;*/
        /*width: 100%;*/
        /*height: 100%;*/
        /*background: black;*/
        /*opacity: 0.4;*/
        /*&.filterR-enter-active, &.filterR-leave-active {*/
          /*transition: all  0.3s*/
        /*}*/
        /*&.filterR-leave-to, &.filterR-enter {*/
          /*opacity: 0*/
        /*}*/
        /*&.filterR-leave {*/
          /*opacity: 0.4;*/
        /*}*/
      /*}*/
    }
    .top {
      position: relative;
      margin-bottom: 25px;
      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;
        .fa-angle-down {
          display: block;
          padding: 5px 9px;
          font-size: 35px;
          color: $color-theme-l;
        }
      }
      .title {
        width: 70%;
        margin: 0 auto;
        padding-top: 20px;
        line-height: 20px;
        text-align: center;
        @include no-wrap();
        font-size: $font-size-large;
        font-weight: normal;
        color: $color-text-l;
        letter-spacing: 2px;
      }
      .subtitle {
        width: 70%;
        padding-top: 10px;
        margin: 0 auto;
        line-height: 20px;
        text-align: center;
        @include no-wrap();
        font-size: $font-size-medium;
        color: $color-text-l;
        letter-spacing: 2px;
      }
    }
    .middle {
      display: flex;
      align-items: center;
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;
      .middle-l {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;
        &.middleL-enter-active, &.middleL-leave-active {
          transition: all 0.3s
        }
        &.middleL-enter, &.middleL-leave-to {
          opacity: 0
        }
        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          height: 100%;
          .cd {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            border: 15px solid rgba(0, 0, 0, 0.4);
            border-radius: 50%;
            &.play {
              animation: rotate 20s linear infinite;
            }
            &.pause {
              animation-play-state: paused;
            }
            .image {
              position: absolute;
              left: -2%;
              top: -2%;
              width: 104%;
              height: 104%;
              border-radius: 50%;
            }
          }
        }
      }
      .middle-r {
        display: inline-block;
        position: absolute;
        top: 0;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;
        &.middleR-enter-active, &.middleR-leave-active {
          transition: all 0.2s;
        }
        &.middleR-enter, &.middleR-leave-to {
          opacity: 0;
        }
        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;
          .text {
            line-height: 40px;
            color: $color-text-ggg;
            font-size: $font-size-medium;
            &.current {
              color: #FFF;
            }
          }
          .no-lyric {
            line-height: 40px;
            margin-top: 60%;
            color: $color-text-ggg;
            font-size: $font-size-medium;
          }
        }
      }
    }
    .bottom {
      position: absolute;
      bottom: 50px;
      width: 100%;
      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 95%;
        margin: 0 auto;
        padding: 10px 0;
        .time {
          color: $color-text-l;
          font-size: $font-size-small;
          flex: 0 0 35px;
          line-height: 30px;
          width: 30px;
          &.time-l {
            text-align: left;
          }
          &.time-r {
            text-align: right;
          }
        }
        .progress-bar-wrapper {
          flex: 1;
        }
      }
      .operators {
        display: flex;
        align-items: center;
        .icon {
          flex: 1;
          color: $color-theme-l;
          &.disable {
            color: #C3C3C3;
          }
          i {
            font-size: 30px;
          }
          .mode {
            font-size: 25px;
          }
          &.i-left {
            text-align: right;
          }
          &.i-center {
            padding: 0 20px;
            text-align: center;
            i {
              font-size: 40px;
            }
          }
          &.i-right {
            text-align: left;
          }
          .icon-like {
            color: $color-sub-theme;
          }
        }
      }
    }
    &.normal-enter-active, &.normal-leave-active {
      transition: all 0.4s;
      .top, .bottom {
        transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
      }
    }
    &.normal-enter, &.normal-leave-to {
      opacity: 0;
      .top{
        transform: translate3d(0,-100px,0);
      }
      .bottom{
        transform: translate3d(0,100px,0);
      }
    }
  }
  .mini-player {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 180;
    width: 100%;
    height: 60px;
    background: rgba(255, 255, 255, 0.95);
    &.mini-enter-active, &.mini-leave-active {
      transition: all 0.4s
    }
    &.mini-enter, &.mini-leave-to {
      opacity: 0
    }
    .icon {
      flex: 0 0 40px;
      width: 40px;
      padding: 0 15px 0 20px;
      img {
        border-radius: 50%;
        &.play {
          animation: rotate 10s linear infinite;
        }
        &.pause {
          animation-play-state: paused;
        }
      }
    }
    .text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      overflow: hidden;
      .name {
        margin-bottom: 4px;
        line-height: 14px;
        @include no-wrap();
        font-size: $font-size-medium;
        color: $color-text;
        letter-spacing: 1px;
      }
      .desc {
        @include no-wrap();
        font-size: $font-size-small;
        color: $color-text;
        letter-spacing: 1px;
      }
    }
    .control {
      flex: 0 0 30px;
      width: 30px;
      padding: 0 10px;
      .icon-play-mini, .icon-pause-mini, .icon-playlist, .iconfont {
        font-size: 30px;
        color: $color-theme-d;
      }
      .iconfont {
        position: relative;
        left: -5px;
        top: -3px;
      }
      .fa-play {
        color: $color-theme-d;
        font-size: 14px;
        position: absolute;
        left: 12px;
        top: 8.5px;
      }
      .fa-stop {
        color: $color-theme-d;
        font-size: 12px;
        position: absolute;
        left: 11px;
        top: 10px;
      }
    }
  }
}
@keyframes rotate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
