import type { components } from './api'
import type { Defined } from './apiTypeHelpers'
import { User } from "./User.type"

// `caption` stays nullable on purpose: clearing a caption is a supported edit
// and the backend stores the blank value as null.
export type Post = Defined<Omit<components["schemas"]["PostDTO"], "author" | "authorId" | "caption">> & {
  author: User
  caption: string | null
}
