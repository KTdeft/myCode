<template>
  <div class="singer" ref="singer">
    <list-view :data="this.singers" @select="selectSinger" ref="list"></list-view>
    <router-view></router-view>
  </div>
</template>

<script>
import Singer from 'common/js/singer'
import {getSingers} from 'src/api/singer'
import ListView from 'base/listview/listview'
// 语法糖：对Mutations的封装，使用更加简单
import {mapMutations} from 'vuex'
import {playlistMixin} from 'common/js/mixin'

const pinyin = require('pinyin')
const HOT_NAME = '热门'
const HOT_SINGERS = 10

export default {
  mixins: [playlistMixin],
  data () {
    return {
      singers: []
    }
  },
  created () {
    this._getSingers()
  },
  methods: {
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.singer.style.bottom = bottom
      this.$refs.list.refresh()
    },
    // 点击歌手时，跳转对应的歌手页面
    selectSinger (singer) {
      this.$router.push({
        path: `/singer/${singer.id}`
      })
      // 往 state写入数据
      // 相当于 this.$store.commit(SET_SINGER, singer)  同步
      this.setSinger(singer)
    },
    _getSingers () {
      getSingers().then((response) => {
        // console.log(response)
        // 添加属性initial：歌手首字母的大写→并放到新对象s里
        let s = response.data.artists
        s.map((item) => {
          let py = pinyin(item.name[0], {
            style: pinyin.STYLE_FIRST_LETTER
          })
          item.initial = py[0][0].toUpperCase()
        })
        // console.log(s)
        // 将一次处理过后的数据，调用以下方法进行二次处理，最终保存到singers
        this.singers = this._normalizeSinger(s)
        // console.log(this.singers)
      })
    },
    _normalizeSinger (list) {
      // 创建空对象map用来存放 热门歌手数据
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      }
      // 将前10条作为热门，并筛选每条所需的属性，封装为新的类，放到hot.items里
      list.forEach((item, index) => {
        if (index < HOT_SINGERS) {
          map.hot.items.push(new Singer({
            id: item.id, // 歌手id
            name: item.name, // 歌手名字
            avatar: item.img1v1Url // 歌手头像
          }))
        }
        // 将歌手首字母赋值给key
        const key = item.initial
        // 为map添加多个属性，属性名为首字母，属性值：{首字母 + [] }
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          }
        }
        // 为map属性名为首字母的对象，注入对应所需的数据
        map[key].items.push(new Singer({
          id: item.id,
          name: item.name,
          avatar: item.img1v1Url
        }))
      })
      // console.log(map)
      // 创建新容器 hot 和 ret
      let hot = []
      let ret = []
      // 遍历map，将热门和全部歌手分别装到 不同容器
      for (const key in map) {
        let val = map[key]
        if (val.title.match(/[A-Z]/)) {
          ret.push(val)
        } else if (val.title === HOT_NAME) {
          hot.push(val)
        }
      }
      // 排序
      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      })
      // 连接处理过后的(热门数据&排序后的所有数据) 作为返回值
      return hot.concat(ret)
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    })
  },
  components: {
    ListView
  }
}
</script>

<style lang="scss" scoped>
.singer {
  position: fixed;
  top: 88px;
  bottom: 0;
  width: 100%;
}
</style>
