import {readFileSync} from "node:fs";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {defineConfig} from "vite";
import dts from "vite-plugin-dts";

type PackageJson = {
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
};

const rootDir = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(rootDir, "package.json"), "utf8")) as PackageJson;
const external = [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
];

export default defineConfig({
    plugins: [
        dts({
            rollupTypes: true,
            tsconfigPath: "./tsconfig.build.json",
        }),
    ],
    build: {
        outDir: "dist",
        emptyOutDir: true,
        sourcemap: true,
        minify: false,
        lib: {
            entry: {
                index: resolve(rootDir, "src/index.ts"),
                tiptap: resolve(rootDir, "src/tiptap.ts"),
            },
            formats: ["es", "cjs"],
            fileName: (format, entryName) => format === "es" ? `${entryName}.es.js` : `${entryName}.cjs`,
        },
        rollupOptions: {
            external,
        },
    },
});
