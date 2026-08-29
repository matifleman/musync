import { User } from "@/types/User.type";

export const dummyUsers: User[] = [
  {
    id: 1,
    firstName: "Juan",
    lastName: "Pérez",
    userName: "juanito25",
    age: 25,
    profilePicture: require("@/assets/dummyImages/avatars/avatar0.jpg"),
    followersCount: 200,
    followedCount: 150,
    isFollowed: false,
    favoriteInstruments: []
  },
  {
    id: 2,
    firstName: "María",
    lastName: "López",
    userName: "mari_lo",
    age: 22,
    profilePicture: require("@/assets/dummyImages/avatars/avatar1.jpg"),
    followersCount: 200,
    followedCount: 150,
    isFollowed: false,
    favoriteInstruments: []
  },
  {
    id: 3,
    firstName: "Carlos",
    lastName: "Gómez",
    userName: "carlitros",
    age: 30,
    profilePicture: require("@/assets/dummyImages/avatars/avatar0.jpg"),
    followersCount: 200,
    followedCount: 150,
    isFollowed: false,
    favoriteInstruments: []
  },
  {
    id: 4,
    firstName: "Lucía",
    lastName: "Martínez",
    userName: "lucy_music",
    age: 27,
    profilePicture: require("@/assets/dummyImages/avatars/avatar1.jpg"),
    followersCount: 200,
    followedCount: 150,
    isFollowed: false,
    favoriteInstruments: []
  },
  {
    id: 5,
    firstName: "Pedro",
    lastName: "Fernández",
    userName: "pedro_rock",
    age: 29,
    profilePicture: require("@/assets/dummyImages/avatars/avatar0.jpg"),
    followersCount: 200,
    followedCount: 150,
    isFollowed: false,
    favoriteInstruments: []
  },
];
