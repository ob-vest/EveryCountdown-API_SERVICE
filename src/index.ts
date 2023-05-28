import express from "express";

import pg from "pg";

const app = express();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

const pool = new pg.Pool();

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/movies", async (req, res) => {
  console.log(`getting movie`);

  try {
    const { rows } = await pool.query("SELECT * FROM movie");
    res.send(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// app.listen(port, () => {
//   console.log(`App listening on port ${port}`);
// });
const server = app.listen(port, () => {
  const address = server.address() as { address: string; port: number };
  console.log(
    `Example app listening on http://${address.address}:${address.port}`
  );
});
