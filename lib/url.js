const url = require('url')

const getUrl = (req, id) => url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: id
})

module.exports = { getUrl }