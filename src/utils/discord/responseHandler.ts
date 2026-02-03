import { ChatInputCommandInteraction } from "discord.js";
import { ServiceResponse } from "../../types/ServiceResponse.js";
import { formatForDiscord } from "./responseFormatter.js";
import { sendPaginatedResponse } from "./commandHelpers.js";

export async function handleServiceResponse(
  interaction: ChatInputCommandInteraction,
  response: ServiceResponse,
  options?: {
    paginate?: boolean;
    formatOptions?: Parameters<typeof formatForDiscord>[1];
  },
): Promise<void> {
  if (!response.success) {
    await interaction.editReply(
      formatForDiscord(response, options?.formatOptions),
    );
    return;
  }

  if (options?.paginate && response.message.length > 1900) {
    await sendPaginatedResponse(interaction, response.message);
  } else {
    await interaction.editReply(
      formatForDiscord(response, options?.formatOptions),
    );
  }
}
