import express from "express";
import * as itemsController from "../controllers/items";
import { auth } from "../middleware/auth";

export const itemsRouter = express.Router();

itemsRouter.post("/item", auth, itemsController.createItem);

itemsRouter.get("/search", itemsController.getSearchItems);
itemsRouter.get("/popular", itemsController.getPopularItems);
itemsRouter.get("/ending", itemsController.getEndingItems);
itemsRouter.get("/movie/catalog", itemsController.getAllRows("movie"));
itemsRouter.get("/tv/catalog", itemsController.getAllRows("tv"));
itemsRouter.get("/anime/catalog", itemsController.getAllRows("anime"));
itemsRouter.get("/tech/catalog", itemsController.getAllRows("tech"));
itemsRouter.get("/game/catalog", itemsController.getAllRows("game"));
itemsRouter.get("/politics/catalog", itemsController.getAllRows("politics"));
itemsRouter.get("/sport/catalog", itemsController.getAllRows("sport"));
itemsRouter.get("/holiday/catalog", itemsController.getAllRows("holiday"));
itemsRouter.get("/other/catalog", itemsController.getOtherCatalogItems);
itemsRouter.get("/:category/:id", itemsController.getSelectedItem);
