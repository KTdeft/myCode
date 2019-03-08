<template>
  <div class="recommend" ref="recommend">
    <scroll  ref="scroll" class="recommend-content" :data="playList">
      <div>
        <div class="recommend-list" ref="recommendList">
          <h1 class="title">推荐歌单</h1>
          <ul>
            <li class="item" v-for="item in playList" :key="item.id">
              <div class="icon" @click="selectList(item)">
                <div class="gradients"></div>
                <img v-lazy="item.picUrl">
              </div>
              <p class="play-count">
                <i class="fa fa-headphones"></i>
                {{Math.floor(item.playCount / 10000)}}万
              </p>
              <div class="text">
                <p class="name">{{item.name}}</p>
              </div>
            </li>
          </ul>
        </div>
        <div class="recommend-song" ref="recommendSong">
          <h1 class="title">推荐歌曲</h1>
          <ul>
            <li class="item" v-for="item in recommendMusic" :key="item.id" @click="selectSong(item)">
              <div class="icon">
                <img v-lazy="item.image">
              </div>
              <p class="text">{{item.name}}</p>
              <p class="singer">{{item.singer}}</p>
            </li>
          </ul>
        </div>
      </div>
      <div class="load-container" v-show="!playList.length">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
import Scroll from 'base/scroll/scroll'
import {getRecommendList, getRecommendMusic} from 'api/recommend'
import {createRecommendSong} from 'common/js/song'
import {ERR_OK} from 'common/js/config'
import Loading from 'base/loading/loading'
import {playlistMixin} from 'common/js/mixin'
import {mapMutations, mapActions} from 'vuex'

export default {
  mixins: [playlistMixin],
  data () {
    return {
      playList: [],
      recommendMusic: []
    }
  },
  created () {
    this._getRecommendList()
    this._getRecommendList()
    this._getRecommendMusic()
  },
  methods: {
    selectSong (item) {
      this.insertSong(item)
    },
    selectList (item) {
      this.$router.push({
        path: `/recommend/${item.id}`
      })
      // console.log(item)
      this.setMuiscList(item)
    },
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.recommend.style.bottom = bottom
      this.$refs.scroll.refresh()
    },
    _getRecommendList () {
      getRecommendList().then((response) => {
        if (response.status === ERR_OK) {
          this.playList = response.data.result
        } else {
          console.error('getRecommendList 获取失败')
        }
      })
    },
    _getRecommendMusic () {
      getRecommendMusic().then((res) => {
        if (res.status === ERR_OK) {
          let list = res.data.result.map((item) => {
            return createRecommendSong(item)
          })
          list.splice(9)
          this.recommendMusic = list
        } else {
          console.error('getRecommendMusic 获取失败')
        }
      })
    },
    ...mapMutations({
      setMuiscList: 'SET_MUSIC_LIST',
      setFullScreen: 'SET_FULL_SCREEN'
    }),
    ...mapActions([
      'insertSong'
    ])
  },
  components: {
    Scroll,
    Loading
  }
}
</script>

<style lang="scss" scoped>
  @import "~common/scss/variable";
  @import "~common/scss/mixin";
.recommend{
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
  z-index: 100;
  .recommend-content{
    width: 100%;
    height: 100%;
    overflow: hidden;
    .decorate {
      position: absolute;
      top: -30vh;
      z-index: -10;
      background: $color-theme;
      width: 100%;
      height: 50vh;
      vertical-align: inherit;
    }
    .recommend-list{
      position: relative;
      box-sizing: border-box;
      width: 100%;
      text-align: center;
      border-bottom: darkgrey 1px dotted;
      .title{
        height: 65px;
        line-height: 65px;
        padding-left: 2%;
        text-align: left;
        font-size: $font-size-medium;
        font-weight: normal;
        color: $color-text;
        letter-spacing: 1px;
      }
      .item{
        display: inline-block;
        position: relative;
        box-sizing: border-box;
        width: 33%;
        padding: 0 1%;
        .icon{
          position: relative;
          display: inline-block;
          width: 100%;
          margin-bottom: 5px;
          .gradients {
            position: absolute;
            top: 0;
            width: 100%;
            height: 35px;
            border-radius: 3px;
            background: linear-gradient(rgba(109, 109, 109, 0.4),rgba(255, 255, 255, 0));
          }
          img{
            width: 100%;
            height: 100%;
            border-radius: 3px;
          }
        }
        .play-count{
          position: absolute;
          top: 5px;
          right: 8px;
          font-size: $font-size-small-s;
          color: $color-text-l
        }
        .text{
          float: left;
          line-height: 16px;
          text-align: left;
          height: 33px;
          overflow: hidden;
          margin-bottom: 10px;
          font-size: $font-size-small;
          /*overflow: hidden;*/
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      }
    }
    .load-container{
      position: absolute;
      width: 100%;
      top: 50%;
      transform:  translateY(-50%);
    }
    .recommend-song {
      margin-top: -20px;
      box-sizing: border-box;
      width: 100%;
      text-align: center;
      .title {
        height: 65px;
        line-height: 65px;
        padding-left: 1.5%;
        text-align: left;
        font-size: $font-size-medium;
        font-weight: normal;
        color: $color-text;
      }
      .item {
        display: inline-block;
        position: relative;
        box-sizing: border-box;
        width: 33%;
        padding: 0 1%;
        .icon {
          position: relative;
          display: inline-block;
          width: 100%;
          margin-bottom: 5px;
          img {
            width: 100%;
            height: 100%;
            border-radius: 3px;
          }
        }
        .text {
          line-height: 16px;
          text-align: left;
          height: 16px;
          @include no-wrap();
          font-size: $font-size-small;
        }
        .singer {
          line-height: 16px;
          margin-bottom: 10px;
          text-align: left;
          @include no-wrap();
          font-size: $font-size-small;
          color: $color-text-g;
        }
      }
    }
  }
}
</style>
