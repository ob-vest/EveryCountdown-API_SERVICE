import { Request, Response } from "express";
import { Item } from "../models/item";
import { pool } from "../database";

export const createItem = async (req: Request, res: Response) => {
  const item: Partial<Item> = req.body;

  const requiredFields: (keyof Item)[] = [
    "category_id",
    "headline",
    "subheadline",
    "release_date",
    "confirmed",
    "image_url",
  ];
  const missingFields = requiredFields.filter(
    (field) => item[field] === undefined
  );

  if (missingFields.length) {
    res
      .status(400)
      .send(`Missing required fields: ${missingFields.join(", ")}`);
    return;
  }

  try {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const itemResult = await client.query(
        `INSERT INTO item (category_id, headline, subheadline, release_date, confirmed, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          item.category_id,
          item.headline,
          item.subheadline,
          item.release_date,
          item.confirmed,
          item.image_url,
        ]
      );

      const itemId = itemResult.rows[0].id;

      if (item.video) {
        await client.query(
          `INSERT INTO video (title, url, item_id) VALUES ($1, $2, $3)`,
          [item.video.title, item.video.url, itemId]
        );
      }

      if (item.weblink) {
        await client.query(
          `INSERT INTO weblink (title, url, created_at, item_id) VALUES ($1, $2, $3, $4)`,
          [
            item.weblink.title,
            item.weblink.url,
            item.weblink.created_at,
            itemId,
          ]
        );
      }

      await client.query("COMMIT");

      res.send(itemResult.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

export const getSearchItems = async (req: Request, res: Response) => {
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
};

export const getPopularItems = async (req: Request, res: Response) => {
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
};

export const getEndingItems = async (req: Request, res: Response) => {
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
};

export function getAllRows(tableName: string) {
  return async (req: Request, res: Response) => {
    console.log(`getting ${tableName}`);

    try {
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

export const getOtherCatalogItems = async (req: Request, res: Response) => {
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
};

export const getSelectedItem = async (req: Request, res: Response) => {
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
