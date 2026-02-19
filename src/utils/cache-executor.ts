import { ChatInputCommandInteraction } from "discord.js";
import { ServiceResponse } from "../types/ServiceResponse.js";
import cache from "../lib/cache.js";
import { handleServiceResponse } from "./discord/responseHandler.js";

interface CacheOptions<T> {
  interaction: ChatInputCommandInteraction;
  cacheKey: string | null;
  executeService: () => Promise<ServiceResponse<T>>;
  renderSuccess: (data: T) => Promise<void>;
  handleError: (error: unknown) => Promise<void>;
  ttl?: number;
  ephemeral?: boolean;
}

export async function executeWithCache<T>({
  interaction,
  cacheKey,
  executeService,
  renderSuccess,
  handleError,
  ttl = 60,
  ephemeral = false,
}: CacheOptions<T>) {
  if (cacheKey) {
    //Verify cache
    const cached = cache.get<T>(cacheKey);
    if (cached) {
      return await renderSuccess(cached);
    }
  }

  try {
    ephemeral ? await interaction.deferReply({ flags: "Ephemeral" }) : await interaction.deferReply();
    const result = await executeService();

    if (!result.success || !result.data) {
      return await handleServiceResponse(interaction, result);
    }

    if (cacheKey) {
      cache.set(cacheKey, result.data, ttl); // Save in cache
    }

    await renderSuccess(result.data);
  } catch (error) {
    await handleError(error);
  }
}
