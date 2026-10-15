// Vendors the Zoom Meeting SDK browser bundles into public/zoom-sdk/.
//
// Why vendored UMD <script>s instead of bundling: @zoom/meetingsdk pins
// React 18 while the app is on React 19. Rollup-bundling its CJS entry mixes
// React copies and dies with "ReactCurrentOwner" errors. Loaded as plain
// <script>s inside the React-free /zoom-embed.html iframe — with matching
// React 18 UMD globals first — the SDK boots exactly as Zoom ships it and
// exposes window.ReactWidgets. No bundler interop involved.
//
// Runs automatically as part of `npm run build` / `build:dev`. Devs need it
// once for `npm run dev` (the dev server serves public/ live).
// No dependencies beyond Node 18+.
import { copyFile, mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "zoom-sdk");
const REACT_VERSION = "18.3.1"; // must satisfy the SDK's peer range

const files = [
  {
    name: "zoomus-websdk-embedded.umd.min.js",
    local: join(
      root,
      "node_modules",
      "@zoom",
      "meetingsdk",
      "dist",
      "zoomus-websdk-embedded.umd.min.js",
    ),
  },
  {
    name: "react.production.min.js",
    urls: [
      `https://unpkg.com/react@${REACT_VERSION}/umd/react.production.min.js`,
      `https://cdn.jsdelivr.net/npm/react@${REACT_VERSION}/umd/react.production.min.js`,
    ],
  },
  {
    name: "react-dom.production.min.js",
    urls: [
      `https://unpkg.com/react-dom@${REACT_VERSION}/umd/react-dom.production.min.js`,
      `https://cdn.jsdelivr.net/npm/react-dom@${REACT_VERSION}/umd/react-dom.production.min.js`,
    ],
  },
];

async function download(urls, dest) {
  let lastErr = null;
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1024) throw new Error("suspiciously small response");
      await writeFile(dest, buf);
      return buf.length;
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(`all mirrors failed (last: ${String(lastErr)})`);
}

await mkdir(outDir, { recursive: true });
for (const f of files) {
  const dest = join(outDir, f.name);
  if (f.local) {
    await copyFile(f.local, dest);
    const { size } = await stat(dest);
    console.log(`copied ${f.name} (${size} bytes)`);
  } else {
    const size = await download(f.urls, dest);
    console.log(`downloaded ${f.name} (${size} bytes)`);
  }
}
console.log("zoom-sdk vendored OK");
