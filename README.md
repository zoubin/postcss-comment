# postcss-comment
Allow postcss to support inline comments.

## Usage

```bash
npm i --save postcss postcss-comment

```

```javascript
require('postcss-comment')
var postcss = require('postcss')

// or
// var postcss = require('postcss-comment')

var fs = require('fs')

var file = __dirname + '/inline.css'

postcss()
  .process(
    fs.readFileSync(file, 'utf8'),
    { from: file }
  )
  .then(function (result) {
    console.log(result.css)
  })

```

inline.css:
```css
/*
 * comments//
 * //comments
 */
// comments
//* comments*/
.inline-comment { /// comments
  // com//ments
  color: red; // comments
} // /*comments
//*/ comments

```

outputs:
```css
/*
 * comments//
 * //comments
 */
/* comments */
/** comments*\/ */
.inline-comment { /*\/ comments */
  /* com//ments */
  color: red; /* comments */
} /* /*comments */
/**\/ comments */

```
