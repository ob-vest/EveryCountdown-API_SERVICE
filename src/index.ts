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
      `SELECT item.id, category.name AS type, item.headline, item.subheadline FROM item JOIN category ON item.category_id = category.id WHERE headline ILIKE $1 OR subheadline ILIKE $1;`,
      [`%${search}%`]
    );
    console.log(rows);
    res.send(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.get("/popular", async (req, res) => {
  console.log(`getting popular items`);
  try {
    const { rows } = await pool.query(
      "SELECT item.*,category.name AS TYPE FROM item JOIN category ON category.id=item.category_id WHERE item.id IN(73,56,77,122,142,99,148,65,58);"
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
      `SELECT item.id, category."name" AS type, headline, subheadline, release_date, confirmed, image_url FROM item JOIN category ON item.category_id = category.id WHERE release_date>CURRENT_DATE ORDER BY release_date ASC LIMIT 12;`
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
app.get("/politics/catalog", getAllRows("politics"));
app.get("/sport/catalog", getAllRows("sport"));
app.get("/holiday/catalog", getAllRows("holiday"));

app.get("/other/catalog", async (req, res) => {
  console.log(`getting sport, game, holiday`);
  try {
    const { rows } = await pool.query(
      "SELECT item.*,category.name AS TYPE FROM item JOIN category ON category.id=item.category_id WHERE category.name IN('sport','politics','holiday')AND release_date>=CURRENT_DATE-INTERVAL'1 day' ORDER BY release_date;"
    );
    res.send(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.get("/movie/:id", getSelectedItem());
app.get("/tv/:id", getSelectedItem());
app.get("/anime/:id", getSelectedItem());
app.get("/tech/:id", getSelectedItem());
app.get("/game/:id", getSelectedItem());
app.get("/sport/:id", getSelectedItem());
app.get("/politics/:id", getSelectedItem());
app.get("/holiday/:id", getSelectedItem());

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

function getSelectedItem() {
  return async (req: Request, res: Response) => {
    const id = req.params.id;
    console.log(`getting item with ID ${id}`);

    try {
      // Selects tablename where its not the release date is not older than today by more than one day and orders it by release date
      const { rows } = await pool.query(
        `SELECT item.*,weblink_links.links,video_links.videos FROM item LEFT JOIN(SELECT item_id,json_agg(json_build_object('title',title,'url',url,'date_added',created_at))AS links FROM weblink GROUP BY item_id)AS weblink_links ON item.id=weblink_links.item_id LEFT JOIN(SELECT item_id,json_agg(json_build_object('title',video.title,'url',video.url))AS videos FROM video GROUP BY item_id)AS video_links ON item.id=video_links.item_id WHERE item.id=$1`,
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
        `SELECT item.*,category.name AS TYPE FROM item JOIN category ON category.id=item.category_id WHERE category."name"='${tableName}' AND release_date>=CURRENT_DATE-INTERVAL'1 day' ORDER BY release_date;`
      );
      res.send(rows);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  };
}
