<template>
    <div class="m-header">
      <h1 class="text">Lengens Never Die</h1>
      <router-link to="/search" class="search" tag="div">
        <i class="iconfont icon-search"></i>
      </router-link>
    </div>
</template>

<script>
export default {
}
</script>

<style lang="scss" scoped>
  @import "~common/scss/variable.scss";
.m-header{
  position: relative;
  height: 44px;
  width: 100%;
  text-align: center;
  background: $color-theme;
  .text{
    line-height: 44px;
    font-weight: normal;
    color: white;
    letter-spacing: 2px;
  }
  .search {
    position: absolute;
    top: 0;
    right: 2px;
    .iconfont {
      display: block;
      padding: 12px;
      font-size: 18px;
      color: $color-theme-l;
    }
  }
}
</style>
