const div = (x, y) => Math.floor(x / y)

const divmod = (x, y) => [div(x, y), x % y]

module.exports = { divmod }