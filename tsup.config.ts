
const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["src/index.ts"], // Seu arquivo principal
    bundle: true,
    minify: true,
    platform: "node",
    format: "esm", 
    target: "esnext",
    outfile: "dist/index.js",
    // TRUQUE AQUI: Não deixa o esbuild entrar nessas pastas
    external: [
      "./generated/*", // Mantém o import do seu cliente como está
      "@prisma/client",
      "path",
      "fs",
      "os",
    ],
    banner: {
      // Resolve o erro de "require is not defined" em ESM
      js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
    },
  })
  .catch(() => process.exit(1));
