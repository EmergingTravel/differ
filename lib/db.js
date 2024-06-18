const postgres = require('postgres')

const sql = postgres(process.env.DB)

const load = async (id) => {
  const res =
    await sql`SELECT id, created, title, data FROM items WHERE id=${id}`
  return res.length ? res[0] : null
}

const save = async (data, title = null) => {
  const res =
    await sql`INSERT INTO items(data, title) VALUES (decode(${data}, 'hex'), ${title}) RETURNING id`
  return res[0].id
}

const list = async (limit = 100, offset = 0) => {
  const total = await sql`SELECT COUNT(*) AS count FROM items`
  const res =
    await sql`SELECT id FROM items ORDER BY id LIMIT ${limit} OFFSET ${offset}`
  return [res.map((x) => x.id), total[0].count]
}

const stats = async () => {
  const res =
    await sql`SELECT COUNT(*) AS cnt, SUM(LENGTH(data)) + (23 * COUNT(*)) AS sz FROM items`.simple()
  const row = res.pop()
  return {
    count: row.cnt,
    size: row.sz,
  }
}

const check = async () => {
  try {
    return (await sql`SELECT 1 as v`).pop().v === 1
  } catch (e) {
    console.log(e)
    return false
  }
}

module.exports = { load, save, list, check, stats }
