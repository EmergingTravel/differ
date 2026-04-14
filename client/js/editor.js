;(function () {
  /**
   * Editor component
   * @param {HTMLTextAreaElement} el
   */
  function Editor(el) {
    this.$el = el
    this.$num = el.querySelector('.line-num')
    this.$text = el.querySelector('textarea')
    this.$text.addEventListener('input', this.updateLineNumbers.bind(this))
  }

  Editor.prototype.getValue = function () {
    return this.$text.value || ''
  }

  Editor.prototype.getLines = function () {
    return this.getValue().split('\n')
  }

  Editor.prototype.updateLineNumbers = function () {
    const lines = this.getLines()
    this.$num.innerHTML = lines.reduce((a, x, i) => {
      a += `<div>${i + 1}</div>`
      return a
    }, '')
  }

  window.editors = Array.from(document.querySelectorAll('.editor')).map(
    (x) => new Editor(x)
  )
})()
