import { parse } from "parse5"
import { predicates as dom5predicates, getAttribute, queryAll } from "dom5"
import { resolve, load, isLocal as isLocalPath } from "./path.js"
import { resolve as resolvePath } from "path"

export const predicates = dom5predicates

/**
 * Traverse the spanning tree of the HTML Imports graph starting from a given location
 *
 *
 * The linking structure of import link lists forms a directed graph.
 * Each node of the graph is a document and its edge is a link.
 * Branches are intended to form a spanning tree of the graph.
 * This tree gives the deterministic order of the script execution.
 * @see https://www.w3.org/TR/html-imports/#import-dependent
 *
 * @param {Object} visitor A visitor object that will be used for traversal
 * @param {string} path The path to start from
 * @param {Predicate} predicate A predicate to select HTML elements to be visited
 * @param {Object} [importMap] The set of traversed imports
 * @param {HTMLLinkElement} [link] The current <link rel="import"> element
 * @return {void}
 */
const traverse = (visitor, path, predicate, importMap = {}, link = null) => {

  // If location is already in the import map
  // OR <link rel="import"> has been removed by visitor
  // then STOP
  if (importMap[path] || link && !link.parentNode) {
    return
  }

  // The imported document
  const document = parse(load(path))
  importMap[path] = document

  visitor.enter(document, { path, link })

  const elements = queryAll(document, predicate)
  let index = 0

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]

    const linkHref = element.tagName === "link" &&
      String(getAttribute(element, "rel")).toLowerCase() === "import" &&
      getAttribute(element, "href")

    if (linkHref) {
      const location = resolve(path, linkHref)
      const isLocal = isLocalPath(linkHref)
      visitor.import(element, { path, location, isLocal })
      // Exclude remote locations
      if (isLocal) {
        // Recursively traverse any found import locations
        traverse(visitor, location, predicate, importMap, element)
      }
    } else {
      visitor.visit(element, { path, index })
      index++
    }
  }
}


const { AND, OR, hasTagName, hasAttrValue, hasAttr } = predicates

// Query selector for link[rel=import]
const htmlImportPredicate = AND( // eslint-disable-line new-cap
    hasTagName("link"),
    hasAttrValue("rel", "import"),
    hasAttr("href")
)

const noopVisitor = {
  import() {},
  enter() {},
  visit() {}
}

export class VisitorHelper {

  /**
   * Constructor
   *
   * @param {Object} visitor A visitor object that will be used for traversal
   * @param {(Predicate|Predicate[])} [predicatesList] An array of predicates to select elements
   */
  constructor(visitor, predicatesList) {
    if (predicatesList) {
      this.predicate = predicatesList instanceof Array ?
        OR(htmlImportPredicate, ...predicatesList) : // eslint-disable-line new-cap
        OR(htmlImportPredicate, predicatesList) // eslint-disable-line new-cap
    } else {
      this.predicate = htmlImportPredicate
    }
    this.visitor = Object.assign({}, noopVisitor, visitor)
    this.importMap = {}
  }

  /**
   * Traverse but not visit the spanning tree of the HTML Imports graph from a given entry
   *
   * Traversed branches will be omited in following traversals.
   * If called prior to enter(), branches already traversed by omit() will be not visited again.
   *
   * @param {string} entry An HTML file path
   * @return {VisitorHelper} This
   */
  omit(entry) {
    traverse(noopVisitor, resolvePath(entry), htmlImportPredicate, this.importMap)
    return this
  }

  /**
   * Traverse and visit the spanning tree of the HTML Imports graph from a given entry
   *
   * @param {string} entry An HTML file path
   * @return {VisitorHelper} This
   */
  enter(entry) {
    traverse(this.visitor, resolvePath(entry), this.predicate, this.importMap)
    return this
  }

}

export default VisitorHelper
