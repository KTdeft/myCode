// 获取min到max之间的随机整数
function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
// 洗牌===将按顺序遍历时a[i]和随机产生的a[j] 对换
export function shuffle (arr) {
  let _arr = arr.slice(0)
  for (let i = 0; i < arr.length; i++) {
    let j = getRandomInt(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }

  return _arr
}

// 截流函数
export function debounce (func, delay) {
  let timer

  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
