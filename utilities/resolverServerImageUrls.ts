import { Post } from "@/types/Post.type";
import { User } from "@/types/User.type";

export const resolveServerImageUrls = (posts: Post[]): Post[] => {
  return posts.map((post: Post) => ({
    ...post,
    author: {
      ...post.author,
      profilePicture: `${process.env.EXPO_PUBLIC_SERVER_URL}/${post.author.profilePicture}`,
    },
    image: `${process.env.EXPO_PUBLIC_SERVER_URL}/${post.image}`
  }));
}

export const resolveUserProfilePictureUrl = (user: User): User => {
  return {
    ...user,
    profilePicture: `${process.env.EXPO_PUBLIC_SERVER_URL}/${user.profilePicture}`
  };
}