export function validateScriptEnv() {
  const required = ["TOKEN", "CLIENT_ID"];

  if (process.env.NODE_ENV !== "production") {
    required.push("GUILD_TESTER_ID");
  }

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Vars missing: ${missing.join(", ")}`);
  }

  return {
    token: process.env.TOKEN!,
    clientId: process.env.CLIENT_ID!,
    guildTesterId: process.env.GUILD_TESTER_ID,
    isProduction: process.env.NODE_ENV === "production",
  };
}
