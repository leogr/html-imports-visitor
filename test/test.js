const { VisitorHelper, predicates } = require("../")
const { ok, equal } = require("assert")
const { resolve } = require("path")
const parse5 = require("parse5")
const { isElementNode } = parse5.treeAdapters.default

const assertDocument = (document, message) => {
  ok(!isElementNode(document) && document.nodeName === "#document", message)
}

const assertLink = (link, message) => {
  ok(isElementNode(link) && link.tagName === "link", message)
}

const assertElement = (element, message) => {
  ok(isElementNode(element), message)
}

const assertAnalysisResult = (traversalList, expectedList) => {
  equal(
    traversalList.length,
    expectedList.length,
    `expected ${expectedList.length} hooks, got ${traversalList.length}`
  )

  for (let i = 0; i < traversalList.length; i++) {
    const traversal = traversalList[i]
    const [ hook, path, location ] = expectedList[i]

    equal(traversal[0], hook, `expected "${hook}" hook at position ${i}, got "${traversal[0]}"`)

    let assertion
    let message
    switch (hook) {
    case "import":
      assertion = assertLink
      message =
        `expected that 1st argument of "${hook}" was a link, got "${typeof traversal[1]}"`
      break
    case "enter":
      assertion = assertDocument
      message =
        `expected that 1st argument of "${hook}" was a document, got "${typeof traversal[1]}"`
      break
    case "visit":
      assertion = assertElement
      message =
        `expected that 1st argument of "${hook}" was an element, got "${typeof traversal[1]}"`
      break
    default:
      // (todo) fail: invalid hook
    }

    assertion(traversal[1], message)

    equal(
      typeof traversal[2],
      "object",
      `expected that 2nd argument of "${hook}" was a "object", got "${typeof traversal[2]}"`
    )

    equal(
      traversal[2].path,
      path,
      `expected path of "${hook}" at position ${i} was "${path}", got "${traversal[2].path}"`
    )

    if (location) {
      equal(
        traversal[2].location,
        location,
        `expected location of "${hook}" at position ${i} was "${location}", got "${traversal[2].location}"`
      )
    }

  }
}

const performAnalysis = (entry, predicate) => {

  const traversalList = []
  const pushArgs = (...args) => traversalList.push([...args])

  const visitor = {
    import: (...args) => pushArgs("import", ...args),
    enter: (...args) => pushArgs("enter", ...args),
    visit: (...args) => pushArgs("visit", ...args)
  }

  const helper = new VisitorHelper(visitor, predicate)

  helper.enter(entry)

  return traversalList
}

describe("html-imports-visitor", () => {

  it("traverses dependents", () => {
    /*
  [ 'enter',
    { nodeName: '#document', mode: 'quirks', childNodes: [Object] },
    { path: '/path/to/html-imports-visitor/test/fixtures/simple/a.html',
      link: null } ],
  [ 'import',
    { nodeName: 'link',
      tagName: 'link',
      attrs: [Object],
      namespaceURI: 'http://www.w3.org/1999/xhtml',
      childNodes: [],
      parentNode: [Object] },
    { path: '/path/to/html-imports-visitor/test/fixtures/simple/a.html',
      location: '/path/to/html-imports-visitor/test/fixtures/simple/b.html',
      isLocal: true } ],
  [ 'enter',
    { nodeName: '#document', mode: 'quirks', childNodes: [Object] },
    { path: '/path/to/html-imports-visitor/test/fixtures/simple/b.html',
      link: [Object] } ],
  [ 'import',
    { nodeName: 'link',
      tagName: 'link',
      attrs: [Object],
      namespaceURI: 'http://www.w3.org/1999/xhtml',
      childNodes: [],
      parentNode: [Object] },
    { path: '/path/to/html-imports-visitor/test/fixtures/simple/b.html',
      location: '/path/to/html-imports-visitor/test/fixtures/simple/a.html',
      isLocal: true } ]
      */
    const fileA = resolve("test/fixtures/simple/a.html")
    const fileB = resolve("test/fixtures/simple/b.html")
    assertAnalysisResult(performAnalysis("test/fixtures/simple/a.html"), [
      ["enter", fileA], // a.html
      ["import", fileA, fileB], // a.html imports b.html
      ["enter", fileB], // b.html
      ["import", fileB, fileA] // b.html imports a.html
    ])
  })

  it("traverses spec example", () => {

    const [fileA, fileB, fileC, fileD, fileE, fileF, fileG, fileH] =
      ["a", "b", "c", "d", "e", "f", "g", "h"].map(
        (file) => resolve(`test/fixtures/spec-example/${file}.html`)
      )

    assertAnalysisResult(performAnalysis(fileA, [predicates.hasTagName("script")]), [
      ["enter", fileA], // a.html
      ["visit", fileA], // <script>console.log('a.html')</script>
      ["import", fileA, fileB], // a.html imports b.html
      ["enter", fileB], // b.html
      ["visit", fileB], // <script>console.log('b.html')</script>
      ["import", fileB, fileD], // b.html imports d.html
      ["enter", fileD], // d.html
      ["visit", fileD], // <script>console.log('d.html')</script>
      ["import", fileD, fileB], // d.html imports b.html
      ["import", fileD, fileF], // d.html imports f.html
      ["enter", fileF], // f.html
      ["visit", fileF], // <script>console.log('f.html')</script>
      ["import", fileA, fileC], // a.html imports c.html
      ["enter", fileC], // c.html
      ["visit", fileC], // <script>console.log('c.html')</script>
      ["import", fileC, fileD], // c.html imports d.html
      ["import", fileC, fileE], // c.html imports e.html
      ["enter", fileE], // e.html
      ["visit", fileE], // <script>console.log('e.html')</script>
      ["import", fileE, fileH], // e.html imports h.html
      ["enter", fileH], // h.html
      ["visit", fileH], // <script>console.log('h.html')</script>
      ["import", fileC, fileG], // c.html imports g.html
      ["enter", fileG], // g.html
      ["visit", fileG] // <script>console.log('g.html')</script>
    ])
  })

})
