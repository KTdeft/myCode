<template class="tab">
  <div class="tab">
    <router-link tag="div" class="tab-item" to="/recommend">
      <span>推荐</span>
    </router-link>
    <router-link tag="div" class="tab-item" to="/rank">
      <span>排行</span>
    </router-link>
    <router-link tag="div" class="tab-item" to="/singer">
      <span>歌手</span>
    </router-link>
    <!-- <router-link tag="div" class="tab-item" to="/search">
      <span>搜索</span>
    </router-link> -->
  </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
  @import "~common/scss/variable.scss";
.tab{
  display: flex;
  line-height: 44px;
  width: 100%;
  font-size: $font-size-medium;
  background: $color-theme;
  .tab-item{
    flex: 1;
    text-align: center;
    color: $color-text-lm;
    span{
      padding-bottom:3px;
      letter-spacing: 2px;
    }
    &.router-link-active {
      span {
        font-weight: normal;
        color: $color-text-l;
        border-bottom: 1px solid $color-text-l
      }
    }
  }
}
</style>
