const { div, divmod } = require('./math')

const BASE = 62

const SALT = 5

const KEYS = {
    2: 'DXjwAeVL6WqTy0tmNzgu89K1ZBR4GcIFiPC2nxokbs7Er3vUQf5JMaYlhHdpSO',
    3: 'ePayD87NwhLrWsRgu9B6zSo13EmQvAk4J5ZI2XCtVHx0dKinFUOjbTlGYMcpfq',
    4: '7jZ9fcGP3mVpSJTARlBU0rzxNbH8uQwne5WOaMEs24KkIDFg6tyXC1ivohLdYq',
    5: 'iy0BOVC6vsjoFRaxzfmchS9wpMDUlX4QIALbTNYHunrZ178eKg5WqJG23tkPdE',
    6: '1DTlgnpvSasbRLP5BNcZoOuwjYz4Fy0eIfWr3Kt2VXh7MGmEUAxQJkiCHd6q98',
    7: '8VhiyO1UHqYgjRaz0rE6FNMmfsvLdCoSuIlWtTexJKcBXw7b3Q5APpk2n4DZG9',
    8: 'LEg7O3RGhrpcCydFtXe5DfUxsKA612a90nWiTPJvMbumk8IlHN4zjZqVYwBSoQ'
}

const getIndexes = (value, size) => {
    lim = Math.pow(BASE, size)
    val = value % lim
    out = []
    for (let i = 0; i < size; i++) {
        lim /= BASE
        const [idx, rem] = divmod(val, lim)
        out.push((idx + SALT) % BASE)
        val = rem
    }
    return out
}

const getKeySize = id => {
    for (const size in KEYS) {
        if (id <= Math.pow(BASE, size)) {
            return size
        }
    }
    throw Error(`ID ${id} is too large`)
}

const encode = (id) => {
    const size = getKeySize(id)
    const key = KEYS[size]
    const indexes = getIndexes(id, size)
    return indexes.reduce((a, x) => a + key[x], '')
}

const decode = (id) => {
    if (!id) {
        return null
    }
    const size = id.length
    const key = KEYS[size]

    if (!(size && key)) {
        console.error(`Unsupported id ${id}`)
        return null
    }

    let out = 0
    const chars = id.split('')
    for (let i = 0; i < size; i++) {
        const c = chars[i]
        const indexOf = key.indexOf(c)
        const idx = (indexOf - SALT + BASE) % BASE
        out += idx * Math.pow(BASE, size - i - 1)
    }
    return out
    // return id.split('')
    //     .map(x => (key.indexOf(x) - SALT + BASE) % BASE)
    //     .reduce((a, x, i) => a += x * Math.pow(BASE, size - i - 1), 0)
}

module.exports = { encode, decode }
