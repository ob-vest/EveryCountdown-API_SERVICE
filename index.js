
const express = require('express')
const app = express()
const port = 3000
const { Pool } = require('pg');
require('dotenv').config();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/movies', async (req, res) => {
  console.log(`getting movie`)
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