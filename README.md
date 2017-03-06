# HTML Imports visitor

> *The linking structure of [import link lists](https://www.w3.org/TR/html-imports/#dfn-import-link-list) forms a directed graph. Each node of the graph is a document and its edge is a [link](https://www.w3.org/TR/html-imports/#dfn-import-link-link). [Branches](https://www.w3.org/TR/html-imports/#dfn-import-link-list-branch) are intended to form a spanning tree of the graph. This tree gives the deterministic order of the script execution.*
>
> &ndash; [HTML Imports Spec](https://www.w3.org/TR/html-imports/#import-dependent)

An helper library to traverse the spanning tree of the graph. Usefull to perform static analysis or to implement building system.

## Install

```
npm install [--save-dev] html-imports-visitor
```

## Example

### Visit `<script>`s in proper execution order

```js
import { VisitorHelper, predicates } from "html-imports-visitor"

const visitor = {
  /**
   * Function hook called when a `<link rel="import">` is found
   *
   * @param {Object} link the `<link rel="import">` element
   * @param {string} detail.path absolute file path of `<link rel="import">`'s parent element
   * @param {string} detail.location absolute file path of the linked resource
   */
  import(link, { path, location }) {
    // your code
  },

  /**
   * Function hook called when entering a branch of the tree
   *
   * @param {Object} element the entered document
   * @param {string} detail.path absolute file path of document
   */
  enter(document, { path }) {
    // your code
  },

  /**
   * Function hook called when a `<script>` is found
   *
   * @param {Object} element the found `<script>` element
   * @param {string} detail.path absolute file path of `<script>`'s parent element
   * @param {number} detail.index zero-based index of the visited element relative to its parent
   */
  visit(element, { path, index }) {
    // your code
  }
}

const helper = new VisitorHelper(visitor, predicates.hasTagName("script"))

helper.enter("index.html")
```

> `html-visitor-imports` uses [parse5](https://github.com/inikulin/parse5), documentation about parsed elements can be found [here](http://inikulin.github.io/parse5/modules/ast.html)


## License
MIT