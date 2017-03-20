import { resolve as resolvePath, dirname } from "path"
import { readFileSync, existsSync } from "fs"

const isAbsoluteRegex = new RegExp("^([a-z]+://|//)", "i")

export const resolve = (basePath, href) => resolvePath(dirname(basePath), href)
export const isLocal = (href) => href && !isAbsoluteRegex.test(href)
export const load = (file) => readFileSync(file, "utf8")
export const fileExists = (path) => existsSync(path)
