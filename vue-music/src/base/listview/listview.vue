<template>
  <scroll
    class="listview"
    :data="data"
    ref="listview"
    :listenScroll="listenScroll"
    @scroll="scroll"
    :probeType="probeType">
    <ul>
      <li v-for="group in data" class="list-group" :key="group.id" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li @click="selectItem(item)" v-for="item in group.items" class="list-group-item" :key="item.id">
            <img v-lazy="item.avatar" class="avatar">
            <span></span>
            <span class="name">{{ item.name }}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut" @touchstart="onShortcutStart" @touchmove.stop.prevent="onShortcutMove">
      <ul>
        <li v-for="(item, index) in shortcutList"
            class="item"
            :data-index="index"
            :key="item.id"
            :class="{'current': currentIndex === index}">
          {{ item }}
        </li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>
  </scroll>
</template>

<script>
import Scroll from 'base/scroll/scroll'
import {getData} from 'common/js/dom'

const ANCHOR_HEIGHT = 20
const TITLE_HEIGHT = 20

export default {
  created () {
    // 使两个start和move函数 共用数据
    this.touch = {}
    this.listenScroll = true
    this.listHeight = []
    this.probeType = 3 // 使scroll在快速滚动时能监听到快速滚动
  },
  // 设置接受的数据
  props: {
    data: {
      type: Array
      // default: []
    }
  },
  data () {
    return {
      scrollY: -1,
      currentIndex: 0, // 对应字母的高亮
      show: true,
      diff: -1
    }
  },
  computed: {
    // 返回只包含title的数组
    shortcutList () {
      return this.data.map((group) => {
        // console.log(group.title.substr(0, 1))
        return group.title.substr(0, 1)
      })
    },
    fixedTitle () {
      if (this.scrollY > 0) {
        return ''
      }
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  methods: {
    refresh () {
      this.$refs.listview.refresh()
    },
    // 派发点击item事件
    selectItem (item) {
      this.$emit('select', item)
    },
    // 触碰是触发函数
    onShortcutStart (e) {
      // 获取当前点击的字母索引 e.target相对this来说，固定不变
      let anchorIndex = getData(e.target, 'index')
      // 记录第一次触碰时的位置
      let firstTouch = e.touches[0]
      this.touch.y1 = firstTouch.pageY
      // 记录当前位置对应的索引
      this.touch.anchorIndex = anchorIndex
      // 滚动到相应位置 另外封装方法
      this._scrollTo(anchorIndex)
    },
    onShortcutMove (e) {
      // 计算右侧滚动的 距离
      // 先获取字母滚动后的位置
      let firstTouch = e.touches[0]
      this.touch.y2 = firstTouch.pageY
      // 计算偏差 并取整
      let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
      // 计算滑动后 应到的索引值
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta
      // 滚动到相应位置
      this._scrollTo(anchorIndex)
    },
    _scrollTo (index) {
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
    },
    // 实时获取better-scroll滚动的Y轴距离
    scroll (pos) {
      this.scrollY = pos.y
    },
    // 将每个group底部到原点的距离，装进数组
    _calculateHeight () {
      this.listHeight = []
      const list = this.$refs.listGroup
      let height = 0
      this.listHeight.push(height)
      // 计算每个group的bottom到listGroup顶部的距离
      for (let i = 0; i < list.length; i++) {
        let item = list[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
    }
  },
  watch: {
    data () {
      setTimeout(() => {
        this._calculateHeight()
      }, 20)
    },
    // 监听左侧落在哪个区间
    scrollY (newY) {
      const listHeight = this.listHeight
      // 顶部
      if (newY > 0) {
        this.currentIndex = 0
        return
      }
      // 中间部分
      for (let i = 0; i < listHeight.length - 1; i++) {
        let height1 = listHeight[i]
        let height2 = listHeight[i + 1]
        // 计算当前区间所对应的 右侧字母值
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i
          // console.log(this.currentIndex)
          this.diff = height2 + newY
          return
        }
      }
      // 底部
      this.currentIndex = listHeight.length - 2
    },
    diff (newVal) {
      let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
      if (this.fixedTop === fixedTop) {
        return
      }
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
    }
  },
  components: {
    Scroll
  }
}
</script>

<style lang="scss" scoped>
@import "~common/scss/variable";
  .listview {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: $color-background;
    .list-group {
      .list-group-title {
      height: 20px;
      line-height: 20px;
      padding-left: 12px;
      margin-bottom: 10px;
      font-size: $font-size-small;
      color: rgb(95, 95, 96);
      background:rgb(222, 222, 222);
      }
      .list-group-item {
        display: flex;
        align-items: center;
        padding: 5px 0;
        margin: 0 5px;
        border-bottom: 1px solid rgb(228, 228, 228);
      }
      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 3px;
      }
      .name {
        margin-left: 20px;
        color: $color-text;
        font-size: $font-size-medium;
      }
    }
    .list-shortcut {
      position: absolute;
      z-index: 30;
      right: 3px;
      top: 50%;
      transform:translateY(-50%);
      width: 20px;
      padding: 200px 0;
      border-radius: 3px;
      text-align: center;
      font-family:Helvetica;
      .item {
        padding: 5px 5px;
        line-height: 1;
        color: black;
        font-size: $font-size-small;
        font-weight: normal;
        &.current {
          color: #F16601;
        }
        }
    }
    .list-fixed{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 20px;
      line-height: 20px;
      padding-left: 12px;
      margin-bottom: 10px;
      font-size: $font-size-small;
      color: rgb(95, 95, 96);
      background:rgb(222, 222, 222);
    }
  }

</style>
