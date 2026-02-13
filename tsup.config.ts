import path from "node:path";
import fs from "node:fs";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/**/*.ts"],
  outDir: "dist",
  format: ["esm"],
  target: "esnext",
  minify: true,
  clean: true,
  bundle: false,
  shims: true,
  external: ["**/prisma/**", "@prisma/client"],
  async onSuccess() {
    const srcDir = path.join(process.cwd(), "src", "locales");
    const distDir = path.join(process.cwd(), "dist", "locales");
    if (fs.existsSync(srcDir)) {
      if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

      const files = fs.readdirSync(srcDir).filter((f) => f.endsWith(".json"));

      for (const file of files) {
        const content = fs.readFileSync(path.join(srcDir, file), "utf-8");
        
        // Minify JSONs
        const minified = JSON.stringify(JSON.parse(content));
        fs.writeFileSync(path.join(distDir, file), minified);
      }
      console.log("✅ JSONs were minified and copied to dist/locales");
    }
  },
});
