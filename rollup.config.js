import buble from "rollup-plugin-buble"
import nodeResolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"

export default {
  input: "index.js",
  plugins: [
    buble({
      include: ["index.js", "src/**"],
      target: {
        node: "4"
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
  sourcemap: true,
  name: "html-imports-visitor",
  output: [
    { file: "dist/lib.js", format: "cjs" },
    { file: "dist/lib.es.js", format: "es" }
  ]
}
