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
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
  // Bloqueia o esbuild de tentar resolver o conteúdo do schema
  esbuildOptions(options) {
    options.loader = {
      ".prisma": "empty", // Se ele encontrar um .prisma, ele ignora o conteúdo
    };
  },
});
