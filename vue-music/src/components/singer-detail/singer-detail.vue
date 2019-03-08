<template>
  <transition name="slide">
    <div class="singer-detail">
      <div class="header" ref="header">
        <div class="back" @click = back>
          <i class="fa fa-angle-left"></i>
        </div>
        <div class="text">
          <h1 class="title" ref="title">{{headerTitle}}</h1>
        </div>
      </div>
      <scroll class="list"
      :probeType="probeType"
      @scroll="scroll"
      :listen-scroll="listenScroll"
      :data="songs"
      ref="list">
        <div class="music-list-wrapper">
          <div class="bg-image" :style="bgStyle" ref="bgImage">
            <div class="filter"></div>
            <div class="text">
              <h2 class="list-title">{{title}}</h2>
            </div>
          </div>
          <div class="song-list-wrapper">
            <div class="sequence-play" v-show="listDetail.length" @click="sequence">
              <i class="iconfont icon-bofangicon"></i>
              <span class="text">播放全部</span>
              <span class="count">(共{{listDetail.length}}首)</span>
            </div>
            <song-list @select="selectItem" :songs="listDetail"></song-list>
          </div>
        </div>
        <div class="loading-content">
          <loading></loading>
        </div>
      </scroll>
    </div>
  </transition>
</template>

<script>
import {getSingerDetail} from 'api/singer'
import {ERR_OK} from 'common/js/config'
import Scroll from 'base/scroll/scroll'
import {createSong} from 'common/js/song'
import SongList from 'base/song-list/song-list'
import Loading from 'base/loading/loading'
import {mapGetters, mapActions} from 'vuex'
import {playlistMixin} from 'common/js/mixin'

const RESERVED_HEIGHT = 44

export default {
  mixins: [playlistMixin],
  props: {
    songs: {
      type: Array
    }
  },
  data () {
    return {
      listDetail: [],
      scrollY: 0,
      headerTitle: '歌手',
      node: null
    }
  },
  created () {
    this._getDetail()
    this.probeType = 3
    this.listenScroll = true
  },
  mounted () {
    this.imageHeight = this.$refs.bgImage.clientHeight
    this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
    // this.handlePlaylist()
  },
  computed: {
    ...mapGetters([
      'singer' // 通过getter 获取store里的singer
    ]),
    bgStyle () {
      return `background-image: url(${this.singer.avatar})`
    },
    title () {
      return this.headerTitleTouchDown
    },
    headerTitleTouchDown () {
      let name = ''
      if (this.singer.aliaName) {
        name = this.singer.name + ` (${this.singer.aliaName})`
      } else {
        name = this.singer.name
      }
      return name
    }
  },
  methods: {
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.list.$el.style.bottom = bottom
      this.$refs.list.refresh()
    },
    // 初步获取歌手对应的歌曲
    _getDetail () {
      // 先确认当前页面是否传入了 singer
      if (!this.singer.id) {
        this.$router.push('/singer')
      }
      getSingerDetail(this.singer.id).then((response) => {
        if (response.status === ERR_OK) {
          this.node = response.data.hotSongs
          // console.log(this.node)
        }
      })
    },
    // 对每首歌的数据进行处理
    _normalizeSongs (list) {
      let ret = []
      list.forEach((item) => {
        ret.push(createSong(item))
      })
      // console.log(ret)
      return ret
    },
    back () {
      this.$router.back()
    },
    scroll (pos) {
      this.scrollY = pos.y
    },
    // 一次提交多个状态，用action 异步
    selectItem (item, index) {
      this.selectPlay({
        list: this.listDetail,
        index: index
      })
    },
    sequence () {
      let list = this.listDetail
      this.sequencePlay({
        list: list
      })
    },
    ...mapActions([
      'selectPlay',
      'sequencePlay'
    ])
  },
  watch: {
    node (val) {
      this.listDetail = this._normalizeSongs(val)
    },
    scrollY (newY) {
      // let translateY = Math.max(this.minTranslateY, newY)
      const percent = Math.abs(newY / this.imageHeight)
      if (newY < (this.minTranslateY + RESERVED_HEIGHT - 20)) {
        this.headerTitle = this.headerTitleTouchDown
      } else {
        this.headerTitle = '歌手'
      }
      if (newY < 0) {
        this.$refs.header.style.background = `rgba(88,88, 88, ${percent})`
        // this.$refs.title.style.color = `rgba(255, 255, 255, ${percent})`
      } else {
        this.$refs.header.style.background = `rgba(88, 88, 88, 0)`
      }
      // console.log(this.minTranslateY + RESERVED_HEIGHT)
      // if (translateY )
      // console.log(translateY)
    }
  },
  components: {
    SongList,
    Scroll,
    Loading
  }
}
</script>

<style lang="scss" scoped>
  @import "~common/scss/variable";
  @import "~common/scss/mixin";
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s;
}
.slide-enter, .slide-leave-to {
  transform: translate3d(100%, 0, 0);
  opacity: 0;
}
.loading-content {
  width: 100%;
  height: 100%;
}
.singer-detail{
  z-index: 100;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $color-background;
  .header {
    position: fixed;
    top: 0;
    width: 100%;
    height: 44px;
    z-index: 100;
    color: white;
    .back {
      position: absolute;
      top: 0;
      left: 4px;
      .fa-angle-left {
        padding: 5px 10px;
        font-size: 30px;
        color: #F16601;
      }
    }
    .text {
      position: absolute;
      left: 38px;
      line-height: 44px;
      font-size: $font-size-medium-x;
      @include no-wrap();
      .title {
        letter-spacing: 2px;
      }
    }
  }
  .list {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    background: $color-background;
    .music-list-wrapper {
      .bg-image {
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 75%;
        transform-origin: top;
        background-size: cover;
        background-position: 0 30%;
        .filter {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: black;
          opacity: 0.2;
        }
        .text {
          position: absolute;
          width: 80%;
          height: 40px;
          bottom: 40px;
          left: 20px;
          color: #fff;
          .list-title {
            position: absolute;
            bottom: 0;
            font-size: $font-size-large-s;
            line-height: 18px;
            font-weight: normal;
            letter-spacing: 3px;
          }
        }
      }
      .song-list-wrapper {
        padding: 41px 0 20px 0;
        border-radius: 10px;
        position: relative;
        top: -20px;
        background: $color-background;
        .sequence-play {
          position: absolute;
          // left: 8;
          top: 0px;
          display: flex;
          align-items: center;
          width: 100%;
          height: 40px;
          padding-left: 16px;
          border-bottom: 1px solid rgb(228, 228, 228);
          .iconfont {
            font-size: 18px;
            color: $color-text;
            padding-right: 14px;
          }
          .text {
            font-size: $font-size-medium-x;
          }
          .count {
            font-size: $font-size-medium;
            color: $color-text-g;
          }
        }
      }
    }
  }
}
</style>
