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

app.get("/tech", async (req, res) => {
  console.log(`getting movie`);

  try {
    const { rows } = await pool.query(
      "SELECT * FROM tech ORDER BY release_date"
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
    // This query returns a single row, so we use rows[0] and selects all the columns from the movie table and the weblink table
    // by using LEFT JOIN it will return all the rows from the movie table and the matching rows from the weblink table. If there is no match, it will leave it out.
    const { rows } = await pool.query(
      "SELECT movie.*,weblink_links.links,video_links.videos FROM movie LEFT JOIN(SELECT movie_id,json_agg(json_build_object('title',title,'url',url,'date_added',date_added))AS links FROM weblink GROUP BY movie_id)AS weblink_links ON movie.id=weblink_links.movie_id LEFT JOIN(SELECT movie_id,json_agg(json_build_object('title',video.title,'description',video.description,'url',video.url))AS videos FROM video GROUP BY movie_id)AS video_links ON movie.id=video_links.movie_id WHERE movie.id=$1",
      [id]
    );
    res.send(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.get("/tech/:id", async (req, res) => {
  const id = req.params.id;
  console.log(`getting tech with ID ${id}`);

  try {
    // This query returns a single row, so we use rows[0] and selects all the columns from the movie table and the weblink table
    // by using LEFT JOIN it will return all the rows from the movie table and the matching rows from the weblink table. If there is no match, it will leave it out.
    const { rows } = await pool.query(
      "SELECT tech.*,weblink_links.links,video_links.videos FROM tech LEFT JOIN(SELECT tech_id,json_agg(json_build_object('title',title,'url',url,'date_added',date_added))AS links FROM weblink GROUP BY tech_id)AS weblink_links ON tech.id=weblink_links.tech_id LEFT JOIN(SELECT tech_id,json_agg(json_build_object('title',video.title,'description',video.description,'url',video.url))AS videos FROM video GROUP BY tech_id)AS video_links ON tech.id=video_links.tech_id WHERE tech.id=$1",
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
