const { VisitorHelper, predicates } = require("../dist/lib.js")

const visitor = {
  /**
   * Function hook called when a `<script>` is found
   *
   * @param {Object} element the found `<script>` element
   * @param {string} detail.path absolute file path of `<script>`'s parent element
   * @param {number} detail.index zero-based index of the visited element relative to its parent
   */
  visit(element, { path, index }) {
    console.log(element.childNodes[0].value)
  }
}

const helper = new VisitorHelper(visitor, predicates.hasTagName("script"))

helper.enter("test/fixtures/spec-example/a.html")
