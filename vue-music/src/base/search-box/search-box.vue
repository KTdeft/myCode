<template>
  <div class="search-box">
    <input :placeholder="placeholder" class="box" v-model="query" type="text">
    <i v-show="query" class="icon-delete" @click="clear"></i>
  </div>
</template>

<script>
import {debounce} from 'common/js/utl'
export default {
  props: {
    placeholder: {
      type: String,
      default: '搜索歌曲、歌手'
    }
  },
  data () {
    return {
      query: ''
    }
  },
  created () {
    this.$watch('query', debounce((newQuery) => {
      this.$emit('query', newQuery)
    }, 300))
  },
  methods: {
    clear () {
      this.query = ''
    },
    setQuery (query) {
      this.query = query
    }
  }
}
</script>

<style scoped lang="scss">
@import "~common/scss/variable";

.search-box{
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  height: 25px;
  /*border-bottom: 1px solid rgb(235, 235, 235);*/
  .box{
    flex: 1;
    line-height: 25px;
    background: rgb(50, 50, 50);
    color: floralwhite;
    font-size: $font-size-medium;
    border-radius: 7px;
    outline: medium;
    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
  }
  .icon-delete {
    position: absolute;
    right: 12px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    border: none;
  }
}

</style>
