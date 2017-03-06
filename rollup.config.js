import buble from "rollup-plugin-buble"
import nodeResolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"

export default {
  entry: "index.js",
  plugins: [
    buble({
      include: ["index.js", "src/**"],
      target: {
        node: "0.12"
      }
    }),
    nodeResolve({
      jsnext: true,
      main: true
    }),
    commonjs()
  ],
  external: [
    "fs",
    "path",
    "dom5",
    "parse5"
  ],
  sourceMap: true,
  moduleName: "html-imports-visitor",
  targets: [
    { dest: "dist/lib.js", format: "cjs" },
    { dest: "dist/lib.es.js", format: "es" }
  ]
}
