var test = require('tap').test
var postcss = require('..')
var path = require('path')
var fs = require('fs')
var fixtures = path.resolve.bind(path, __dirname, 'fixtures')

function readFile(file) {
  return fs.readFileSync(file, 'utf8')
}

test('inline comment', function (t) {
  t.plan(1)
  var file = fixtures('inline.css')
  postcss()
    .process(readFile(file), { from: file })
    .then(function (result) {
      t.equal(
        result.css,
        readFile(fixtures('inline.expected.css'))
      )
    })
})
