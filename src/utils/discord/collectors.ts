import { InteractionCollector } from "discord.js";

const activeCollectors: InteractionCollector<any>[] = [];

export function registerCollector(collector: InteractionCollector<any>) {
  activeCollectors.push(collector);

  collector.on("end", () => {
    const idx = activeCollectors.indexOf(collector);
    if (idx !== -1) activeCollectors.splice(idx, 1);
  });
}

export function stopAllCollectors() {
  for (const collector of activeCollectors) {
    try {
      collector.stop("shutdown");
    } catch {
      // ignora erros
    }
  }
}
