import express from "express";
import { Request, Response } from "express";

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

app.get("/movies", getAllRows("movie"));
app.get("/tv", getAllRows("tv"));
app.get("/anime", getAllRows("anime"));
app.get("/tech", getAllRows("tech"));
app.get("/games", getAllRows("game"));
// app.get("/politics", getAllRows("politics"));
app.get("/other", async (req, res) => {
  console.log(`getting sport, game, holiday`);
  try {
    const { rows } = await pool.query(
      "SELECT headline,release_date,description,confirmed,subheadline,image_url FROM sport WHERE release_date>=CURRENT_DATE-INTERVAL'1 day' UNION ALL SELECT headline,release_date,description,confirmed,subheadline,image_url FROM game WHERE release_date>=CURRENT_DATE-INTERVAL'1 day' UNION ALL SELECT headline,release_date,description,confirmed,subheadline,image_url FROM holiday WHERE release_date>=CURRENT_DATE-INTERVAL'1 day'"
    );
    res.send(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// app.get("/movies/:id", getSelectedItem("movie"));
app.get("/tv/:id", getSelectedItem("tv"));
app.get("/anime/:id", getSelectedItem("anime"));
app.get("/tech/:id", getSelectedItem("tech"));
app.get("/games/:id", getSelectedItem("game"));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

// app.get("/tech", async (req, res) => {
//   console.log(`getting movie`);

//   try {
//     const { rows } = await pool.query(
//       "SELECT * FROM tech ORDER BY release_date"
//     );
//     res.send(rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal server error");
//   }
// });

// app.get("/movies/:id", async (req, res) => {
//   const id = req.params.id;
//   console.log(`getting movie with ID ${id}`);

//   try {
//     // This query returns a single row, so we use rows[0] and selects all the columns from the movie table and the weblink table
//     // by using LEFT JOIN it will return all the rows from the movie table and the matching rows from the weblink table. If there is no match, it will leave it out.
//     const { rows } = await pool.query(
//       "SELECT movie.*,weblink_links.links,video_links.videos FROM movie LEFT JOIN(SELECT movie_id,json_agg(json_build_object('title',title,'url',url,'date_added',date_added))AS links FROM weblink GROUP BY movie_id)AS weblink_links ON movie.id=weblink_links.movie_id LEFT JOIN(SELECT movie_id,json_agg(json_build_object('title',video.title,'description',video.description,'url',video.url))AS videos FROM video GROUP BY movie_id)AS video_links ON movie.id=video_links.movie_id WHERE movie.id=$1",
//       [id]
//     );
//     res.send(rows[0]);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal server error");
//   }
// });

function getSelectedItem(tableName: string) {
  return async (req: Request, res: Response) => {
    const id = req.params.id;
    console.log(`getting ${tableName} with ID ${id}`);

    try {
      // Selects tablename where its not the release date is not older than today by more than one day and orders it by release date
      const { rows } = await pool.query(
        `SELECT ${tableName}.*,weblink_links.links,video_links.videos FROM ${tableName} LEFT JOIN(SELECT ${tableName}_id,json_agg(json_build_object('title',title,'url',url,'date_added',date_added))AS links FROM weblink GROUP BY ${tableName}_id)AS weblink_links ON ${tableName}.id=weblink_links.${tableName}_id LEFT JOIN(SELECT ${tableName}_id,json_agg(json_build_object('title',video.title,'description',video.description,'url',video.url))AS videos FROM video GROUP BY ${tableName}_id)AS video_links ON ${tableName}.id=video_links.${tableName}_id WHERE ${tableName}.id=$1`,
        [id]
      );
      res.send(rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  };
}
function getAllRows(tableName: string) {
  return async (req: Request, res: Response) => {
    console.log(`getting ${tableName}`);

    try {
      // Selects tablename where its not the release date is not older than today by more than one day and orders it by release date
      const { rows } = await pool.query(
        `SELECT*FROM ${tableName} WHERE release_date>=CURRENT_DATE-INTERVAL'1 day' ORDER BY release_date`
      );
      res.send(rows);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  };
}
