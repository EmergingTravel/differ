const url = require('url')

const getUrl = (req, id) =>
  url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: id,
  })

const replaceQuery = (req, query) =>
  url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: req.path,
    query: query,
  })

module.exports = { getUrl, replaceQuery }
