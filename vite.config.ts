import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

function syncWechatCloudfunctions(): Plugin {
  let copiedInCurrentBundle = false;
  let outputDir = "";

  function copyCloudfunctions() {
    if (process.env.UNI_PLATFORM !== "mp-weixin") return;

    const source = resolve(process.cwd(), "cloudfunctions");
    const target = resolve(outputDir, "cloudfunctions");

    if (!outputDir || !existsSync(source)) return;
    mkdirSync(dirname(target), { recursive: true });
    cpSync(source, target, { recursive: true, force: true });
    copiedInCurrentBundle = true;
    console.log(`[sync-cloudfunctions] copied ${source} -> ${target}`);
  }

  return {
    name: "sync-wechat-cloudfunctions",
    configResolved(config) {
      outputDir = resolve(process.cwd(), config.build.outDir);
    },
    buildStart() {
      copiedInCurrentBundle = false;
    },
    writeBundle() {
      copyCloudfunctions();
    },
    closeBundle() {
      if (!copiedInCurrentBundle) copyCloudfunctions();
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni(), syncWechatCloudfunctions()],
});
