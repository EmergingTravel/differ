const { replaceQuery } = require('./url')

const getPagedResponse = (req, limit, offset, data, total) => {
  const res = {
    prev: null,
    next: null,
    total,
    data,
  }

  if (offset > 0) {
    res.prev = replaceQuery(req, { limit, offset: Math.max(0, offset - limit) })
  }

  const nextOffset = offset + limit

  if (total > nextOffset) {
    res.next = replaceQuery(req, { limit, offset: nextOffset })
  }

  return res
}

module.exports = { getPagedResponse }
