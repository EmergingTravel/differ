const fs = require("fs")

const matchFiles = (type) =>
    Array.from(fs.readdirSync(`public/${type}`))
        .filter(_ => new RegExp(`bundle.*${type}`).test(_))

const getBundles = () => ({
    css: matchFiles('css')[0],
    js: matchFiles('js')[0]
})

module.exports = { getBundles }