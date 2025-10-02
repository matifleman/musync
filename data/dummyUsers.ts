import { User } from "@/types/User.type";

export const dummyUsers: User[] = [
  {
    id: 1,
    first_name: "Juan",
    last_name: "Pérez",
    username: "juanito25",
    age: "25",
    email: "juan.perez@example.com",
    profile_picture: require("@/assets/dummyImages/avatars/avatar0.jpg"),
  },
  {
    id: 2,
    first_name: "María",
    last_name: "López",
    username: "mari_lo",
    age: "22",
    email: "maria.lopez@example.com",
    profile_picture: require("@/assets/dummyImages/avatars/avatar1.jpg"),
  },
  {
    id: 3,
    first_name: "Carlos",
    last_name: "Gómez",
    username: "carlitros",
    age: "30",
    email: "carlos.gomez@example.com",
    profile_picture: require("@/assets/dummyImages/avatars/avatar0.jpg"),
  },
  {
    id: 4,
    first_name: "Lucía",
    last_name: "Martínez",
    username: "lucy_music",
    age: "27",
    email: "lucia.martinez@example.com",
    profile_picture: require("@/assets/dummyImages/avatars/avatar1.jpg"),
  },
  {
    id: 5,
    first_name: "Pedro",
    last_name: "Fernández",
    username: "pedro_rock",
    age: "29",
    email: "pedro.fernandez@example.com",
    profile_picture: require("@/assets/dummyImages/avatars/avatar0.jpg"),
  },
];
