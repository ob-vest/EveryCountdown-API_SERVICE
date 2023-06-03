import express from "express";

import pg from "pg";

const app = express();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

const pool = new pg.Pool();

const port = process.env.PORT || 3001;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/movies", async (req, res) => {
  console.log(`getting movie`);

  try {
    const { rows } = await pool.query(
      "SELECT * FROM movie ORDER BY release_date"
    );
    res.send(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.get("/movies/:id", async (req, res) => {
  const id = req.params.id;
  console.log(`getting movie with ID ${id}`);

  try {
    const { rows } = await pool.query(
      "SELECT movie.*, ARRAY_AGG(ROW(weblink.title, weblink.url, weblink.date_added)) AS link FROM movie LEFT JOIN weblink ON movie.id = weblink.movie_id WHERE movie.id = $1 GROUP BY movie.id, movie.headline;",
      [id]
    );
    res.send(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
