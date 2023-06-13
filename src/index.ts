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
app.get("/search", async (req, res) => {
  const search = req.query.text;
  console.log(`searching for items matching '${search}'`);
  try {
    const { rows } = await pool.query(
      `SELECT'movie' AS type,id,headline,subheadline FROM movie WHERE LOWER(headline)LIKE LOWER($1)OR LOWER(subheadline)LIKE LOWER($1)UNION SELECT'tv' AS type,id,headline,subheadline FROM tv WHERE LOWER(headline)LIKE LOWER($1)OR LOWER(subheadline)LIKE LOWER($1)UNION SELECT'anime' AS type,id,headline,subheadline FROM anime WHERE LOWER(headline)LIKE LOWER($1)OR LOWER(subheadline)LIKE LOWER($1)UNION SELECT'tech' AS type,id,headline,subheadline FROM tech WHERE LOWER(headline)LIKE LOWER($1)OR LOWER(subheadline)LIKE LOWER($1)UNION SELECT'game' AS type,id,headline,subheadline FROM game WHERE LOWER(headline)LIKE LOWER($1)OR LOWER(subheadline)LIKE LOWER($1)UNION SELECT'politics' AS type,id,headline,subheadline FROM politics WHERE LOWER(headline)LIKE LOWER($1)OR LOWER(subheadline)LIKE LOWER($1)UNION SELECT'sport' AS type,id,headline,subheadline FROM sport WHERE LOWER(headline)LIKE LOWER($1)OR LOWER(subheadline)LIKE LOWER($1)UNION SELECT'holiday' AS type,id,headline,subheadline FROM holiday WHERE LOWER(headline)LIKE LOWER($1)OR LOWER(subheadline)LIKE LOWER($1);`,
      [`%${search}%`]
    );
    res.send(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.get("/popular", async (req, res) => {
  console.log(`getting ending soon items`);
  try {
    const { rows } = await pool.query(
      "SELECT type,id,headline,subheadline,release_date,confirmed,image_url FROM(SELECT'anime' AS type,id,headline,subheadline,release_date,confirmed,image_url FROM anime WHERE id IN(27,22)UNION ALL SELECT'movie' AS type,id,headline,subheadline,release_date,confirmed,image_url FROM movie WHERE id IN(14,15,16)UNION ALL SELECT'game' AS type,id,headline,subheadline,release_date,confirmed,image_url FROM game WHERE id IN(19,20)UNION ALL SELECT'tv' AS type,id,headline,subheadline,release_date,confirmed,image_url FROM tv WHERE id IN(16,15))AS combined ORDER BY id;"
    );
    res.send(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});
app.get("/ending", async (req, res) => {
  console.log(`getting ending soon items`);
  try {
    const { rows } = await pool.query(
      `SELECT TYPE,id,headline,subheadline,release_date,confirmed,image_url FROM(SELECT'anime' AS TYPE,id,headline,subheadline,release_date,confirmed,image_url FROM anime UNION ALL SELECT'movie' AS TYPE,id,headline,subheadline,release_date,confirmed,image_url FROM movie UNION ALL SELECT'tv' AS TYPE,id,headline,subheadline,release_date,confirmed,image_url FROM tv UNION ALL SELECT'game' AS TYPE,id,headline,subheadline,release_date,confirmed,image_url FROM game UNION ALL SELECT'tech' AS TYPE,id,headline,subheadline,release_date,confirmed,image_url FROM tech UNION ALL SELECT'holiday' AS TYPE,id,headline,subheadline,release_date,confirmed,image_url FROM holiday UNION ALL SELECT'sport' AS TYPE,id,headline,subheadline,release_date,confirmed,image_url FROM sport UNION ALL SELECT'politics' AS TYPE,id,headline,subheadline,release_date,confirmed,image_url FROM politics)AS combined WHERE release_date>CURRENT_DATE ORDER BY release_date ASC LIMIT 12;`
    );
    res.send(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.get("/movie/catalog", getAllRows("movie"));
app.get("/tv/catalog", getAllRows("tv"));
app.get("/anime/catalog", getAllRows("anime"));
app.get("/tech/catalog", getAllRows("tech"));
app.get("/game/catalog", getAllRows("game"));
// app.get("/politics", getAllRows("politics"));
app.get("/other/catalog", async (req, res) => {
  console.log(`getting sport, game, holiday`);
  try {
    const { rows } = await pool.query(
      "SELECT*,'sport' AS TYPE FROM sport WHERE release_date>=CURRENT_DATE-INTERVAL'1 day' UNION ALL SELECT*,'politics' AS TYPE FROM politics WHERE release_date>=CURRENT_DATE-INTERVAL'1 day' UNION ALL SELECT*,'holiday' AS TYPE FROM holiday WHERE release_date>=CURRENT_DATE-INTERVAL'1 day'"
    );
    res.send(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.get("/movie/:id", getSelectedItem("movie"));
app.get("/tv/:id", getSelectedItem("tv"));
app.get("/anime/:id", getSelectedItem("anime"));
app.get("/tech/:id", getSelectedItem("tech"));
app.get("/game/:id", getSelectedItem("game"));
app.get("/sport/:id", getSelectedItem("sport"));
app.get("/politics/:id", getSelectedItem("politics"));
app.get("/holiday/:id", getSelectedItem("holiday"));

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
        `SELECT*,'${tableName}' AS type FROM ${tableName} WHERE release_date>=CURRENT_DATE-INTERVAL'1 day' ORDER BY release_date`
      );
      res.send(rows);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  };
}
