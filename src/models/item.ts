import { Video } from "./video";
import { WebLink } from "./weblink";

export interface Item {
  id?: number;
  category_id: number;
  headline: string;
  subheadline: string;
  release_date: Date;
  confirmed: boolean;
  image_url: string;
  video?: Video;
  weblink?: WebLink;
}
