const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const outdir = "dist/";

esbuild
  .build({
    entryPoints: ["modules/keikaku.ts"],
    bundle: true,
    format: "esm",
    platform: "browser",
    sourcemap: true,
    minify: true,
    outbase: "./",
    outdir: outdir,
  })
  .then(() => {
    const staticAssets = [
      "module.json",

      "i18n/en.json",

      "styles/keikaku.css",

      "templates/todo-item-form.hbs",
      "templates/todo-list-control.hbs",
      "templates/todo-list-item.hbs",
      "templates/todo-list.hbs",
    ];

    staticAssets.map((source) => {
      const destination = path.join(outdir, source);
      const basedir = path.dirname(destination);
      fs.mkdirSync(basedir, { recursive: true });
      fs.copyFileSync(source, destination);
    });
  });
