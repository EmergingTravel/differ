const express = require('express')
const createError = require('http-errors')
const db = require('../lib/db')
const { encode, decode } = require('../lib/key')
const { getUrl } = require('../lib/url')

const router = express.Router()

router.get('/', function (req, res, next) {
  res.render('index', { context: "{}" });
});

router.get('/:key', async function (req, res, next) {
  try {
    const id = decode(req.params.key)
    const item = await db.load(id)
    res.render('index', {
      context: JSON.stringify({
        id: req.params.key,
        created: item.created,
        title: item.title,
        data: Buffer.from(item.data).toString('hex')
      })
    })
  } catch (e) {
    next(createError(404))
  }
})

router.post('/api/save', async function (req, res, next) {
  const data = Buffer.from(req.body.data, 'hex')
  const title = req.body.title
  const id = await db.save(data, title)
  const result = { id: encode(id) }
  res.status(201).json(result)
});

router.get('/api/list', async function (req, res, next) {
  const items = await db.list()
  res.json(items.map(x => getUrl(req, encode(x))))
})

module.exports = router;
