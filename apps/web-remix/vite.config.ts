import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    host: true, // Разрешить доступ с внешних IP
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'famous-taxes-send.loca.lt',
      '.loca.lt', // Разрешить все поддомены loca.lt
      '4klnm84lswj4.share.zrok.io', // zrok домен
      '.share.zrok.io' // Разрешить все поддомены zrok
    ]
  }
});

