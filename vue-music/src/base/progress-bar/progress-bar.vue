<template>
    <div class="progress-bar" ref="progressBar" @click="progressClick">
      <div class="bar-inner">
        <div class="progress" ref="progress"></div>
        <div class="progress-btn-wrapper" ref="progressBtn"
        @touchstart.prevent="progressTouchStart"
        @touchmove.prevent="progressTouchMove"
        @touchend.prevent="progressTouchEnd">
          <div class="progress-btn"></div>
        </div>
      </div>
    </div>
</template>

<script>
import {prefixStyle} from 'common/js/dom'
const progressBtnWidth = 16
const transform = prefixStyle('transform')
export default {
  data () {
    return {
      newPercent: 0
    }
  },
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  created () {
    // 共享touch数据
    this.touch = {}
  },
  methods: {
    progressClick (e) {
      // 这个有 bug
      // this._offset(e.offsetX)
      const rect = this.$refs.progressBar.getBoundingClientRect()
      // rect.left 元素距离左边的距离
      // 点击的点 距离开头的距离
      const offsetWidth = e.pageX - rect.left
      // 改变长度和位置样式
      this._offset(offsetWidth)
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      const percent = this.$refs.progress.clientWidth / barWidth
      this.$emit('percentChangeEnd', percent)
    },
    progressTouchStart (e) {
      this.touch.initiated = true
      // 第一个手指的横坐标
      this.touch.startX = e.touches[0].pageX
      // 当前进度条的长度
      this.touch.left = this.$refs.progress.clientWidth
    },
    progressTouchMove (e) {
      // 先判断是否有先touch
      if (!this.touch.initiated) {
        return
      }
      // 计算move距离
      const deltaX = e.touches[0].pageX - this.touch.startX
      const offsetWidth = Math.min(Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX)))
      this._offset(offsetWidth)
    },
    progressTouchEnd () {
      this.touch.initiated = false
      // 进度条总长度
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      // 移动后的长度百分比
      const percent = this.$refs.progress.clientWidth / barWidth
      this.$emit('percentChangeEnd', percent)
    },
    // _triggerPercent () {
    //   const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
    //   const percent = this.$refs.progress.clientWidth / barWidth
    //   this.$emit('percentChangeEnd', percent)
    // },
    // 设置偏移量，并改变样式
    _offset (offsetWidth) {
      this.$refs.progress.style.width = `${offsetWidth}px`
      this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
    }
  },
  watch: {
    // 计算偏移量
    percent (newPercent) {
      if (newPercent >= 0 && !this.touch.initiated) {
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        const offsetWidth = newPercent * barWidth
        this._offset(offsetWidth)
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "~common/scss/variable";

.progress-bar {
    height: 30px;
    .bar-inner {
      position: relative;
      top: 13px;
      height: 4px;
      background: rgba(0, 0, 0, 0.3);
      .progress {
        position: absolute;
        height: 100%;
        background: $color-theme;
      }
      .progress-btn-wrapper {
        position: absolute;
        left: -8px;
        top: -13px;
        width: 30px;
        height: 30px;
        .progress-btn {
          position: relative;
          top: 7px;
          left: 7px;
          box-sizing: border-box;
          width: 16px;
          height: 16px;
          border: 5px solid $color-theme-l;
          border-radius: 50%;
          background: $color-theme-l;
        }
      }
    }
  }
</style>
