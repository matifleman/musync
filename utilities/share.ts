import { Share } from 'react-native'

// Share is React Native core, so no expo-sharing is needed for a text/URL share.
//
// Note the links these carry are musync:// scheme URLs. The app has no
// associated domain or intent filter for https, so a recipient without Musync
// installed gets a link their OS cannot open. Producing a web fallback would
// need a real domain and the matching native config, neither of which exists.
export async function shareLink(url: string, message?: string): Promise<void> {
  try {
    await Share.share({ message: message ? `${message}\n${url}` : url })
  } catch {
    // Dismissing the sheet rejects on some platforms, and there is nothing
    // actionable to tell the user about a share that didn't happen.
  }
}
