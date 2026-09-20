import { Band, UserBand } from "@/types/Band.type";
import { Post } from "@/types/Post.type";
import { ReleaseDetail, ReleaseListItem } from "@/types/Release.type";

// Idempotent: a post whose urls are already absolute is returned untouched, so
// writing a server response into an already-resolved cache entry can't produce
// a double prefix.
export const resolvePostImageUrls = (post: Post): Post => ({
  ...post,
  author: resolveUserProfilePictureUrl(post.author),
  image: /^https?:\/\//.test(post.image)
    ? post.image
    : `${process.env.EXPO_PUBLIC_SERVER_URL}/${post.image}`,
});

export const resolveServerImageUrls = (posts: Post[]): Post[] => posts.map(resolvePostImageUrls);

export const resolveUserProfilePictureUrl = <T extends { profilePicture: string }>(user: T): T => {
  if (/^https?:\/\//.test(user.profilePicture)) return user
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

export const resolveUserBandProfilePictureUrl = (band: UserBand): UserBand => {
  return {
    ...band,
    profilePicture: band.profilePicture ? `${process.env.EXPO_PUBLIC_SERVER_URL}/${band.profilePicture}` : null
  };
}

export const resolveReleaseCoverUrl = <T extends ReleaseListItem | ReleaseDetail>(release: T): T => {
  return {
    ...release,
    cover: release.cover ? `${process.env.EXPO_PUBLIC_SERVER_URL}/${release.cover}` : null
  };
}