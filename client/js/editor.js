;(function () {
  function parseCSSValue(value) {
    if (value.endsWith('px')) {
      return +value.replace('px', '')
    }
    return +value
  }

  class LineEstimator {
    constructor(el) {
      this.$el = el
      this.canvas = document.createElement('canvas')
      this.context = this.canvas.getContext('2d')
      const style = this.getStyle()
      this.context.font = `${style.fontSize} ${style.fontFamily}`
      console.log('FONT', this.context.font)
    }

    getStyle() {
      return window.getComputedStyle(this.$el)
    }

    getContentWidth() {
      const width = this.$el.getBoundingClientRect().width
      const style = this.getStyle()
      if (style.visibility === 'hidden') {
        return 0
      }
      const padleft = parseCSSValue(style.paddingLeft)
      const padRight = parseCSSValue(style.paddingRight)
      console.log('WIDTH', width, typeof width)
      console.log('PADDING left=%d right=%d', padleft, padRight)
      return width - padleft - padRight
    }

    getTextWidth(text) {
      const val = this.context.measureText(text).width
      console.log('MEASURED', val, typeof val)
      return val
    }

    estimateLines() {
      const contentWidth = this.getContentWidth()
      if (contentWidth == 0) {
        return []
      }
      const lines = this.$el.value.split('\n')
      console.log(lines)
      const linesCount = lines.map((x) => {
        const textWidth = this.getTextWidth(x)
        const ratio = textWidth / contentWidth
        console.log(`RATIO (${textWidth} / ${contentWidth})`, ratio)
        return Math.ceil(ratio) || 1
      })
      console.log(linesCount)
      return linesCount
    }
  }

  class Editor {
    constructor(el) {
      const _ed = this
      this.$el = el
      this.$num = el.querySelector('.line-num')
      this.$text = el.querySelector('textarea')
      this.estimator = new LineEstimator(this.$text)
      this.observer = new ResizeObserver(() => {
        const rect = this.$text.getBoundingClientRect()
        _ed.$num.style.height = `${rect.height}px`
        _ed.updateLineNumbers()
      })
      // this.observer.observe(this.$text)

      this.$text.addEventListener('scroll', () => {
        console.log('SCROLL', _ed.$num.scrollTop, _ed.$text.scrollTop)
        _ed.$num.scrollTop = _ed.$text.scrollTop
        console.log('SCROLL BITCH!', _ed.$num.scrollTop, _ed.$text.scrollTop)
      })
      this.$text.addEventListener('input', () => _ed.updateLineNumbers())
      this.updateLineNumbers()
    }

    getValue() {
      return this.$text.value || ''
    }

    getLines() {
      return this.getValue().split('\n')
    }

    updateLineNumbers() {
      const counts = this.estimator.estimateLines()
      const len = counts.length
      console.log(counts, len)
      this.$num.innerHTML = counts.reduce((a, x, i) => {
        a += `<div>${i + 1}</div>`
        let s = x
        while (s > 1) {
          a += '<div>&nbsp;</div>'
          s--
        }
        return a
      }, '')
    }
  }

  window.editors = Array.from(document.querySelectorAll('.editor')).map(
    (x) => new Editor(x)
  )
})()
