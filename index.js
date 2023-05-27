
const express = require('express')
const app = express()
const port = 3000
const { Pool } = require('pg');
require('dotenv').config();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/movies', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM movie LIMIT 1');
    res.send(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})