import { Post } from "@/types/Post.type";
import { dummyUsers } from "./dummyUsers";

export const dummyPosts: Post[] = [
  {
    id: 1,
    author: dummyUsers[0],
    caption: "Nada como ensayar con la banda 🎸🥁",
    img: require("@/assets/dummyImages/posts/band.webp"),
    createdAt: "2025-09-27T10:00:00Z",
    liked: true,
  },
  {
    id: 2,
    author: dummyUsers[1],
    caption: "Mis instrumentos favoritos ❤️",
    img: require("@/assets/dummyImages/posts/instruments.png"),
    createdAt: "2025-09-27T12:15:00Z",
    liked: false,
  },
  {
    id: 3,
    author: dummyUsers[2],
    caption: "Con la orquesta suena mágico 🎶",
    img: require("@/assets/dummyImages/posts/orchestra.webp"),
    createdAt: "2025-09-27T15:30:00Z",
    liked: false,
  },
  {
    id: 4,
    author: dummyUsers[3],
    caption: "Volviendo a los ensayos con toda la energía 🔥",
    img: require("@/assets/dummyImages/posts/band.webp"),
    createdAt: "2025-09-27T18:45:00Z",
    liked: true,
  },
  {
    id: 5,
    author: dummyUsers[4],
    caption: "Mi setup de estudio 🎧",
    img: require("@/assets/dummyImages/posts/instruments.png"),
    createdAt: "2025-09-27T21:00:00Z",
    liked: false,
  },
];
