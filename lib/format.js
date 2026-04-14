const { KILOBYTE, MEGABYTE, GIGABYTE } = require('./const')

const formatDataSize = (value) => {
  let outValue = value,
    suffix = ''
  for (const mul of [
    [GIGABYTE, 'G'],
    [MEGABYTE, 'M'],
    [KILOBYTE, 'K'],
  ]) {
    if (value > mul[0]) {
      outValue = (value / mul[0]).toFixed(2)
      suffix = mul[1]
    }
  }
  return `${outValue}${suffix}`
}

module.exports = {
  formatDataSize,
}
