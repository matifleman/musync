import { User } from "./User.type";

export type Comment = {
  id:        number;
  author:    User;
  content:   string;
  createdAt: string;
}