import { Band } from "@/types/Band.type";
import { Post } from "@/types/Post.type";

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

export const resolveUserProfilePictureUrl = <T extends { profilePicture: string }>(user: T): T => {
  return {
    ...user,
    profilePicture: `${process.env.EXPO_PUBLIC_SERVER_URL}/${user.profilePicture}`
  };
}

export const resolveBandProfilePictureUrl = (band: Band): Band => {
  return {
    ...band,
    profilePicture: band.profilePicture ? `${process.env.EXPO_PUBLIC_SERVER_URL}/${band.profilePicture}` : null
  };
}