import Vue from 'vue'
import Router from 'vue-router'
// import Recommend from 'cpnts/recommend/recommend'
// import Singer from 'cpnts/singer/singer'
// import Rank from 'cpnts/rank/rank'
// import SingerDetail from 'cpnts/singer-detail/singer-detail'

Vue.use(Router)

const Recommend = (resolve) => {
  import('cpnts/recommend/recommend').then((module) => {
    resolve(module)
  })
}

const Singer = (resolve) => {
  import('cpnts/singer/singer').then((module) => {
    resolve(module)
  })
}

const Rank = (resolve) => {
  import('cpnts/rank/rank').then((module) => {
    resolve(module)
  })
}

const SingerDetail = (resolve) => {
  import('cpnts/singer-detail/singer-detail').then((module) => {
    resolve(module)
  })
}
const MusicList = (resolve) => {
  import('cpnts/music-list/music-list').then((module) => {
    resolve(module)
  })
}

const RankDetail = (resolve) => {
  import('cpnts/rank-detail/rank-detail').then((module) => {
    resolve(module)
  })
}

const Search = (resolve) => {
  import('cpnts/search/search').then((module) => {
    resolve(module)
  })
}

export default new Router({
  routes: [
    {
      // 默认跳转到 recommend
      path: '/',
      redirect: '/recommend'
    },
    {
      path: '/recommend',
      component: Recommend,
      children: [
        {
          path: ':id',
          component: MusicList
        }
      ]
    },
    {
      path: '/singer',
      component: Singer,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/rank',
      component: Rank,
      children: [
        {
          path: ':id',
          component: RankDetail
        }
      ]
    },
    {
      path: '/search',
      component: Search,
      children: [
        {
          path: 'singer/:id',
          component: SingerDetail
        },
        {
          path: 'list/:id',
          component: MusicList
        }
      ]
    }
  ]
})
