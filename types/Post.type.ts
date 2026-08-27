import type { components } from './api'
import type { Defined } from './apiTypeHelpers'
import { User } from "./User.type"

export type Post = Defined<Omit<components["schemas"]["PostDTO"], "author" | "authorId">> & {
  author: User
}
