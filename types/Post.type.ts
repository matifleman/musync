import { User } from "./User.type";

export type Post = {
  id:        number;
  author:    User;
  caption:   string;
  image:     string;
  createdAt: string;  
  liked:     boolean;
}