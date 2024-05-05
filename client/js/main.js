(function () {
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
    setTimeout(() => { this.classList.add('fade-out') }, 1)
    setTimeout(() => { this.classList.remove('fade-out') }, 1000)
  }

  const restoreDiff = diff => {
    const lines = diff.split("\n").slice(3)
    const [fileA, fileB] = [[], []]
    for (const line of lines) {
      const [op, content] = [line[0], line.slice(1)]
      if (op === ' ' || op === '-') {
        fileA.push(content)
      }
      if (op === ' ' || op === '+') {
        fileB.push(content)
      }
    }
    return [fileA.join("\n"), fileB.join("\n")]
  }

  const diffStats = diff => {
    const lines = diff.split("\n").slice(3)
    let added = 0, removed = 0
    for (const line of lines) {
      if (line[0] === '+') added++
      else if (line[0] === '-') removed++
    }
    return [added, removed]
  }

  const $ = document.querySelector.bind(document),
    MODAL_ID = 'modal-1',
    VIEW_MODE_EDIT = 'edit',
    VIEW_MODE_DIFF = 'diff'

  function App() {
    const _app = this
    const _context = window._diffContext || {}

    this.ui = {
      controls: $('form#main .controls'),
      compare: $('button.compare'),
      edit: $('button.edit'),
      save: $('button.save'),
      files: $('form#main .files'),
      fileA: $('#fileA'),
      fileB: $('#fileB'),
      form: $('form#main'),
      diff: $('.diff'),
      modalContent: $('#modal-1-content'),
      modalTitle: $('#modal-1-title'),
      title: $('input#title')
    }

    this.state = {
      id: _context.id || null,
      created: _context.created || null,
      title: _context.title || null,
      data: _context.data || null,
      diff: null,
    }

    function compareHandler() {
      try {
        _app.compare()
        _app.render()
        _app.toggleView(VIEW_MODE_DIFF)
      } catch (e) {
        _app.error(e.message)
      }
    }

    this.ui.compare.onclick = compareHandler

    this.ui.edit.onclick = function () {
      _app.restore()
      _app.toggleView(VIEW_MODE_EDIT)
    }

    this.ui.save.onclick = function (e) {
      _app.save()
    }

    this.ui.form.onsubmit = function (e) {
      e.preventDefault()
      compareHandler()
    }
  }

  App.prototype.compare = function () {
    const fileA = this.ui.fileA.value
    const fileB = this.ui.fileB.value

    if (fileA == fileB) {
      const msg = `Files are ${fileA ? "equal" : "empty"}`
      throw Error(msg)
    }
    this.state.diff = Diff.createTwoFilesPatch(
      'fileA', 'fileB', fileA, fileB, 'old', 'new', {
      context: Infinity
    })
    this.state.data = buffer.Buffer(pako.deflate(this.state.diff)).toString('hex')
    this.state.title = this.ui.title.value
    this.state.created = null
  }

  App.prototype.render = function () {
    const configuration = {
      drawFileList: false,
      fileListToggle: false,
      fileListStartVisible: false,
      fileContentToggle: false,
      matching: 'words',
      outputFormat: 'side-by-side',
      synchronisedScroll: true,
      highlight: true,
      renderNothingWhenEmpty: true,
      stickyHeaders: false
    }
    const diff2htmlUi = new Diff2HtmlUI(this.ui.diff, this.state.diff, configuration)
    diff2htmlUi.draw()
    diff2htmlUi.highlightCode()
    this.setDiffInfo()
  }

  App.prototype.setDiffInfo = function () {
    const header = $('.d2h-file-header')
    const title = this.state.title || 'Untitled'
    // let copyButton = false
    let html = `<div class="diff-info">`

    if (this.state.title) {
      html += `<div>Name: <strong>${title}</strong></div>`
    }

    if (this.state.created) {
      const date = dateFormat(new Date(Date.parse(this.state.created)))
      html += `<div>Date: <strong>${date}</strong></div>`
    }

    if (this.state.id) {
      const url = this.getUrl()
      // copyButton = true
      html +=
        `<div class="url">`
        + `URL: <a href="${url}">${url}</a>`
        // + `<span class="copy" data-url="${url}"></span>`
        // + `<span class="copy-success fade hidden">Copied</span>`
        + `</div>`
    }

    html += `</div>`

    const [added, removed] = diffStats(this.state.diff)
    html += ''
      + `<div class="diff-stats flex-row">`
      + `<span class="grow">➖ ${removed} removed</span>`
      + `<span class="grow">➕ ${added} added</span>`
      + `</div>`

    header.innerHTML = html

    // if (copyButton) {
    // $('.diff-info .url .copy').onclick = this.copyUrl
    // }
  }

  App.prototype.getUrl = function () {
    return this.state.id ? window.location.origin + '/' + this.state.id : null
  }

  App.prototype.copyUrl = async function (e) {
    const target = e.currentTarget
    const url = target.getAttribute('data-url');
    await navigator.clipboard.writeText(url)

    // const success = target.nextSibling
    // success.show()
    // success.fadeOut()
    // setTimeout(() => success.hide(), 1000)
  }

  App.prototype.restore = function () {
    const [fileA, fileB] = restoreDiff(this.state.diff)
    this.ui.title.value = this.state.title
    this.ui.fileA.value = fileA
    this.ui.fileB.value = fileB
    this.state.id = null
    this.state.data = null
    this.state.diff = null
  }

  App.prototype.toggleView = function (mode) {
    if (mode == VIEW_MODE_DIFF) {
      this.ui.diff.show()
      this.ui.form.hide()
      this.ui.compare.hide()
      this.ui.edit.show()
      if (!this.state.id) {
        this.ui.save.show()
      }
    } else if (mode === VIEW_MODE_EDIT) {
      this.ui.diff.hide()
      this.ui.form.show()
      this.ui.compare.show()
      this.ui.edit.hide()
      this.ui.save.hide()
    }
  }

  App.prototype.modal = function (title, content) {
    if (!content) {
      throw Error('Empty content')
    }
    this.ui.modalTitle.innerHTML = title || ''
    this.ui.modalContent.innerHTML = content
    MicroModal.show(MODAL_ID)
  }

  App.prototype.error = function (msg) {
    this.modal('ERROR', msg)
  }

  App.prototype.save = function () {
    this.ui.save.disabled = true
    const body = {
      title: this.state.title,
      data: this.state.data
    }
    fetch("/api/save", {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' }
    }).then(r => r.json()).then(data => {
      this.state.id = data.id
      this.ui.save.hide()
      window.location.href = '/' + data.id
    }).catch(err => {
      this.error(err)
    }).finally(() => {
      this.ui.save.disabled = false
    })
  }

  App.prototype.init = function () {
    MicroModal.init({ debug: true })
    if (this.state.id && this.state.data) {
      this.state.diff = new TextDecoder().decode(
        pako.inflate(
          buffer.Buffer.from(this.state.data, 'hex')
        )
      )
      this.render()
      this.toggleView(VIEW_MODE_DIFF)
    } else {
      this.toggleView(VIEW_MODE_EDIT)
    }
    return this
  }

  window.onload = function () { window.app = new App().init() }
})()
