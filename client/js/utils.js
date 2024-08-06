Element.prototype.show = function () {
  this.classList.remove('hidden')
}

Element.prototype.hide = function () {
  this.classList.add('hidden')
}

Element.prototype.toggle = function () {
  this.classList.toggle('hidden')
}

Element.prototype.fadeOut = function () {
  this.classList.add('fade')
  setTimeout(() => {
    this.classList.add('fade-out')
  }, 1)
  setTimeout(() => {
    this.classList.remove('fade-out')
  }, 1000)
}

/**
 * Sequence generator
 * @param {number} start sequence start
 * @param {number} end sequence end non-inclusive
 * @param {number} step sequence step
 * @returns {Array[number]} array of items
 */
function seq(start, end, step) {
  if (typeof end === 'undefined') {
    end = start
    start = 0
  } else if (typeof step === 'undefined') {
    step = 1
  }
  const n = Math.floor(Math.abs(end - start) / step)
  console.log('SEQ n=%d start=%d end=%d step=%d', n, start, end, step)
  const a = Array(n)
  let v = start
  for (let i = 0; i < n; i++) {
    a[i] = v
    v += step
  }
  return a
}
