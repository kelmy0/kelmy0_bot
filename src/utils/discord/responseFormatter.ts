import { ServiceResponse } from "../../types/ServiceResponse.js";

export function formatForDiscord(
  response: ServiceResponse,
  options?: {
    showEmoji?: boolean;
    showTimestamp?: boolean;
    embedColor?: string;
  },
): string | { content: string; embeds?: any[] } {
  const { showEmoji = true, showTimestamp = false, embedColor } = options || {};

  const emoji = showEmoji ? (response.success ? "✅" : "❌") : "";
  const timestamp = showTimestamp
    ? `\n\n_<t:${Math.floor(response.timestamp.getTime() / 1000)}:R>_`
    : "";

  const content = `${emoji} ${response.message}${timestamp}`;

  return content;
}
