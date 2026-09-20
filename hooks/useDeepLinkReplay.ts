import { consumePendingLink, setPendingLink } from "@/auth/pendingLink";
import { useSession } from "@/contexts/AuthContext";
import { resolveDeepLinkPath } from "@/utilities/deepLinks";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import * as Linking from "expo-linking";

// Captures whatever musync:// URL launched or resurfaced the app, then navigates
// to it once there is a session. Called from RootNavigator, which mounts (and so
// runs effects) even while it renders null behind the splash screen - that is
// what makes the cold-start case work.
export function useDeepLinkReplay() {
  const { currentUser } = useSession();
  const router = useRouter();

  useEffect(() => {
    const capture = (url: string) => {
      const path = resolveDeepLinkPath(url);
      if (path) setPendingLink(path);
    };

    // Cold start: the app was launched by the link.
    void Linking.getInitialURL().then((url) => {
      if (url) capture(url);
    });

    // Already running: the link arrived while the app was open or backgrounded.
    const subscription = Linking.addEventListener('url', ({ url }) => capture(url));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const path = consumePendingLink();
    if (path) router.replace(path as never);
    // currentUser's identity changes on any profile update, so this effect
    // re-runs often - consumePendingLink returns null every time after the
    // first, which keeps those re-runs inert.
  }, [currentUser, router]);
}
