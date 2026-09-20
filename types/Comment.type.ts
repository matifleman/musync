import type { components } from './api'
import type { Defined } from './apiTypeHelpers'
import { User } from "./User.type"

// `postId`/`authorId` are dropped for the same reason Post.type.ts drops
// `authorId`: the app only ever needs the resolved `author` once it has it, and
// the modal already knows which post it is showing.
export type Comment = Defined<Omit<components["schemas"]["CommentDTO"], "author" | "authorId" | "postId">> & {
  author: User
}
