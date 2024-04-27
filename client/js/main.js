(function () {
    const _UTC_OFFSET = new Date().getTimezoneOffset() * 60000

    Element.prototype.show = function () {
        this.classList.remove('hidden')
    }

    Element.prototype.hide = function () {
        this.classList.add('hidden')
    }

    Element.prototype.toggle = function () {
        this.classList.toggle('hidden')
    }

    Date.parseUTCTimestamp = function (value) {
        console.log(value, _UTC_OFFSET)
        return new Date(Date.parse(value) - _UTC_OFFSET)
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

        this.ui.compare.onclick = function () {
            try {
                _app.compare()
                _app.render()
                _app.toggleView(VIEW_MODE_DIFF)
            } catch (e) {
                _app.error(e)
            }
        }

        this.ui.edit.onclick = function () {
            _app.toggleView(VIEW_MODE_EDIT)
        }

        this.ui.save.onclick = function (e) {
            _app.save()
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
        let html = `<div>Name: <strong>${title}</strong></div>`
        if (this.state.created) {
            const date = dateFormat(Date.parseUTCTimestamp(this.state.created))
            html += `<div>Date: <strong>${date}</strong></div>`
        }
        header.innerHTML = html
    }

    App.prototype.getLink = function () {
        return this.state.id ? window.location.origin + '/' + this.state.id : null
    }

    App.prototype.clear = function () {
        this.ui.diff.innerHTML = ''
    }

    App.prototype.toggleView = function (mode) {
        if (mode == VIEW_MODE_DIFF) {
            this.ui.diff.show()
            this.ui.files.hide()
            this.ui.compare.hide()
            this.ui.edit.show()
            this.ui.save.show()
            this.ui.title.hide()
        } else if (mode === VIEW_MODE_EDIT) {
            this.ui.diff.hide()
            this.ui.files.show()
            this.ui.compare.show()
            this.ui.edit.hide()
            this.ui.save.hide()
            this.ui.title.show()
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
            window.location.href = '/' + data.id
        })
    }

    App.prototype.init = function () {
        MicroModal.init({ debug: true })
        if (this.state.id && this.state.data) {
            this.state.diff = new TextDecoder().decode(
                pako.inflate(buffer.Buffer.from(this.state.data, 'hex'))
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
