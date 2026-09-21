import { useWindowDimensions } from "react-native";

export const POSTS_GRID_SPACING = 2;
const POSTS_GRID_COLUMNS = 3;

// Side of one square cell in the three-column posts grid on the profile screens.
//
// Read from useWindowDimensions rather than Dimensions.get at module load: the
// latter is captured once, so a window that is resized afterwards - a browser, a
// tablet in split view, a rotation - keeps the old cell size, and cells sized for
// a wider window wrap one per row.
export function usePostsGridItemSize(): number {
  const { width } = useWindowDimensions();
  return Math.floor((width - POSTS_GRID_SPACING * (POSTS_GRID_COLUMNS - 1)) / POSTS_GRID_COLUMNS);
}
