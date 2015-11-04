# postcss-comment
Allow postcss to support inline comments.

## Usage

```javascript
var postcss = require('postcss-comment')

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
// comments
// comments
.inline-comment { // comments
  // comments
  color: red; // comments
} // comments
// comments

```

outputs:
```css
/* comments */
/* comments */
.inline-comment { /* comments */
  /* comments */
  color: red; /* comments */
} /* comments */
/* comments */

```
