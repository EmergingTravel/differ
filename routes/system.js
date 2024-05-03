const express = require('express')
const db = require('../lib/db')

router = express.Router()

router.get('/__version__', async (req, res, next) => {
  const env = process.env
  res.json({
    build: env.PIPELINE_ID,
    commit: env.GIT_COMMIT,
    source: env.SOURCE,
    version: env.VERSION,
  })
})

router.get('/__lbheartbeat__', async (req, res, next) => {
  res.status(200).send('')
})

router.get('/__heartbeat__', async (req, res, next) => {
  const ok = x => x ? 'ok' : 'error'
  const db_status = await db.check()
  res.json({
    status: ok(db_status),
    random: Math.round(Math.random() * 1000),
    checks: {
      db: ok(db_status)
    }
  })
})

module.exports = router
