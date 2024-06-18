const express = require('express')
const createError = require('http-errors')
const db = require('../lib/db')
const { exec } = require('../lib/exec')
const { encode, decode } = require('../lib/key')
const { getUrl } = require('../lib/url')
const { getPagedResponse } = require('../lib/paging')
const { formatDataSize } = require('../lib/format')

const router = express.Router()

router.get('/', function (req, res, next) {
  res.render('index', { context: '{}' })
})

router.get('/:key', async function (req, res, next) {
  try {
    const id = decode(req.params.key)
    const item = await db.load(id)
    res.render('index', {
      context: JSON.stringify({
        id: req.params.key,
        created: item.created,
        title: item.title,
        data: Buffer.from(item.data).toString('hex'),
      }),
    })
  } catch (e) {
    next(createError(404))
  }
})

router.post('/api/save', async function (req, res, next) {
  const data = req.body.data
  const title = req.body.title
  let id
  try {
    id = await db.save(data, title)
  } catch (e) {
    return res.status(500).json({ error: e })
  }
  const result = { id: encode(id) }
  res.status(201).json(result)
})

router.get('/api/stats', async function (req, res, next) {
  const stats = await db.stats()

  stats.size = formatDataSize(stats.size)
  res.json(stats)
})

router.get('/api/list', async function (req, res, next) {
  const limit = Math.min(+req.query.limit || 100, 100)
  const offset = +req.query.offset || 0
  const [items, total] = await db.list(limit, offset)
  const data = items.map((x) => getUrl(req, encode(x)))
  res.json(getPagedResponse(req, limit, offset, data, total))
})

router.get('/api/system', async function (req, res, next) {
  const proc = await exec('npm list --json')
  const data = JSON.parse(proc.stdout)
  res.json(data)
})

module.exports = router
