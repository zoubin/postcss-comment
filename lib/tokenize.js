'use strict'

/**
 * Cloned from https://github.com/postcss/postcss/blob/master/lib/tokenize.es6
 *
 */
const SINGLE_QUOTE      = '\''.charCodeAt(0);
const DOUBLE_QUOTE      =  '"'.charCodeAt(0);
const BACKSLASH         = '\\'.charCodeAt(0);
const SLASH             =  '/'.charCodeAt(0);
const NEWLINE           = '\n'.charCodeAt(0);
const SPACE             =  ' '.charCodeAt(0);
const FEED              = '\f'.charCodeAt(0);
const TAB               = '\t'.charCodeAt(0);
const CR                = '\r'.charCodeAt(0);
const OPEN_SQUARE       =  '['.charCodeAt(0);
const CLOSE_SQUARE      =  ']'.charCodeAt(0);
const OPEN_PARENTHESES  =  '('.charCodeAt(0);
const CLOSE_PARENTHESES =  ')'.charCodeAt(0);
const OPEN_CURLY        =  '{'.charCodeAt(0);
const CLOSE_CURLY       =  '}'.charCodeAt(0);
const SEMICOLON         =  ';'.charCodeAt(0);
const ASTERISK          =  '*'.charCodeAt(0);
const COLON             =  ':'.charCodeAt(0);
const AT                =  '@'.charCodeAt(0);

const RE_AT_END      = /[ \n\t\r\f\{\(\)'"\\;/\[\]#]/g;
const RE_WORD_END    = /[ \n\t\r\f\(\)\{\}:;@!'"\\\]\[#]|\/(?=\*)/g;
const RE_BAD_BRACKET = /.[\\\/\("'\n]/;
const RE_HEX_ESCAPE  = /[a-f0-9]/i;

module.exports = function tokenizer(input, options) {
    options = options || {}
    let css = input.css.valueOf();
    let ignore = options.ignoreErrors;

    let code, next, quote, lines, last, content, escape,
        nextLine, nextOffset, escaped, escapePos, prev, n, currentToken;

    let length = css.length;
    let offset = -1;
    let line = 1;
    let pos = 0;
    let buffer = [];
    let returned = [];

    function unclosed(what) {
        throw input.error('Unclosed ' + what, line, pos - offset);
    }

    function endOfFile() {
        return returned.length === 0 && pos >= length;
    }

    function nextToken() {
        if ( returned.length ) return returned.pop();
        if ( pos >= length ) return;

        code = css.charCodeAt(pos);
        if ( code === NEWLINE || code === FEED ||
             code === CR && css.charCodeAt(pos + 1) !== NEWLINE ) {
            offset = pos;
            line += 1;
        }

        switch ( code ) {
        case NEWLINE:
        case SPACE:
        case TAB:
        case CR:
        case FEED:
            next = pos;
            do {
                next += 1;
                code = css.charCodeAt(next);
                if ( code === NEWLINE ) {
                    offset = next;
                    line += 1;
                }
            } while ( code === SPACE   ||
                      code === NEWLINE ||
                      code === TAB     ||
                      code === CR      ||
                      code === FEED );

            currentToken = ['space', css.slice(pos, next)];
            pos = next - 1;
            break;

        case OPEN_SQUARE:
            currentToken = ['[', '[', line, pos - offset];
            break;

        case CLOSE_SQUARE:
            currentToken = [']', ']', line, pos - offset];
            break;

        case OPEN_CURLY:
            currentToken = ['{', '{', line, pos - offset];
            break;

        case CLOSE_CURLY:
            currentToken = ['}', '}', line, pos - offset];
            break;

        case COLON:
            currentToken = [':', ':', line, pos - offset];
            break;

        case SEMICOLON:
            currentToken = [';', ';', line, pos - offset];
            break;

        case OPEN_PARENTHESES:
            prev = buffer.length ? buffer.pop()[1] : '';
            n    = css.charCodeAt(pos + 1);
            if ( prev === 'url' &&
                 n !== SINGLE_QUOTE && n !== DOUBLE_QUOTE &&
                 n !== SPACE && n !== NEWLINE && n !== TAB &&
                 n !== FEED && n !== CR ) {
                next = pos;
                do {
                    escaped = false;
                    next    = css.indexOf(')', next + 1);
                    if ( next === -1 ) {
                        if ( ignore ) {
                            next = pos;
                            break;
                        } else {
                            unclosed('bracket');
                        }
                    }
                    escapePos = next;
                    while ( css.charCodeAt(escapePos - 1) === BACKSLASH ) {
                        escapePos -= 1;
                        escaped = !escaped;
                    }
                } while ( escaped );

                currentToken = ['brackets', css.slice(pos, next + 1),
                    line, pos  - offset,
                    line, next - offset
                ];

                pos = next;

            } else {
                next    = css.indexOf(')', pos + 1);
                content = css.slice(pos, next + 1);

                if ( next === -1 || RE_BAD_BRACKET.test(content) ) {
                    currentToken = ['(', '(', line, pos - offset];
                } else {
                    currentToken = ['brackets', content,
                        line, pos  - offset,
                        line, next - offset
                    ];
                    pos = next;
                }
            }

            break;

        case CLOSE_PARENTHESES:
            currentToken = [')', ')', line, pos - offset];
            break;

        case SINGLE_QUOTE:
        case DOUBLE_QUOTE:
            quote = code === SINGLE_QUOTE ? '\'' : '"';
            next  = pos;
            do {
                escaped = false;
                next    = css.indexOf(quote, next + 1);
                if ( next === -1 ) {
                    if ( ignore ) {
                        next = pos + 1;
                        break;
                    } else {
                        unclosed('string');
                    }
                }
                escapePos = next;
                while ( css.charCodeAt(escapePos - 1) === BACKSLASH ) {
                    escapePos -= 1;
                    escaped = !escaped;
                }
            } while ( escaped );

            content = css.slice(pos, next + 1);
            lines   = content.split('\n');
            last    = lines.length - 1;

            if ( last > 0 ) {
                nextLine   = line + last;
                nextOffset = next - lines[last].length;
            } else {
                nextLine   = line;
                nextOffset = offset;
            }

            currentToken = ['string', css.slice(pos, next + 1),
                line, pos  - offset,
                nextLine, next - nextOffset
            ];

            offset = nextOffset;
            line   = nextLine;
            pos    = next;
            break;

        case AT:
            RE_AT_END.lastIndex = pos + 1;
            RE_AT_END.test(css);
            if ( RE_AT_END.lastIndex === 0 ) {
                next = css.length - 1;
            } else {
                next = RE_AT_END.lastIndex - 2;
            }

            currentToken = ['at-word', css.slice(pos, next + 1),
                line, pos  - offset,
                line, next - offset
            ];

            pos = next;
            break;

        case BACKSLASH:
            next   = pos;
            escape = true;
            while ( css.charCodeAt(next + 1) === BACKSLASH ) {
                next  += 1;
                escape = !escape;
            }
            code = css.charCodeAt(next + 1);
            if ( escape && (code !== SLASH   &&
                            code !== SPACE   &&
                            code !== NEWLINE &&
                            code !== TAB     &&
                            code !== CR      &&
                            code !== FEED ) ) {
                next += 1;
                if ( RE_HEX_ESCAPE.test(css.charAt(next)) ) {
                    while ( RE_HEX_ESCAPE.test(css.charAt(next + 1)) ) {
                        next += 1;
                    }
                    if ( css.charCodeAt(next + 1) === SPACE ) {
                        next += 1;
                    }
                }
            }

            currentToken = ['word', css.slice(pos, next + 1),
                line, pos  - offset,
                line, next - offset
            ];

            pos = next;
            break;

        default:
            if ( code === SLASH && css.charCodeAt(pos + 1) === ASTERISK ) {
                next = css.indexOf('*/', pos + 2) + 1;
                if ( next === 0 ) {
                    if ( ignore ) {
                        next = css.length;
                    } else {
                        unclosed('comment');
                    }
                }

                content = css.slice(pos, next + 1);
                lines   = content.split('\n');
                last    = lines.length - 1;

                if ( last > 0 ) {
                    nextLine   = line + last;
                    nextOffset = next - lines[last].length;
                } else {
                    nextLine   = line;
                    nextOffset = offset;
                }

                currentToken = ['comment', content,
                    line,     pos  - offset,
                    nextLine, next - nextOffset
                ];

                offset = nextOffset;
                line   = nextLine;
                pos    = next;

            } else if ( code === SLASH && css.charCodeAt(pos + 1) === SLASH ) {
                next = css.indexOf('\n', pos + 2);
                if (next === -1) {
                  next = css.length - 1
                } else {
                  next = next - 1
                }

                content = '/*' + css.slice(pos + 2, next + 1);
                content = content.replace(/\*\//g, '*\\/') + ' */'

                currentToken = ['comment', content,
                    line,     pos  - offset,
                    line,     next - offset
                ];

                pos    = next;

            } else {
                RE_WORD_END.lastIndex = pos + 1;
                RE_WORD_END.test(css);
                if ( RE_WORD_END.lastIndex === 0 ) {
                    next = css.length - 1;
                } else {
                    next = RE_WORD_END.lastIndex - 2;
                }

                currentToken = ['word', css.slice(pos, next + 1),
                    line, pos  - offset,
                    line, next - offset
                ];

                buffer.push(currentToken);

                pos = next;
            }

            break;
        }

        pos++;
        return currentToken;
    }

    function back(token) {
        returned.push(token);
    }

    return {
        back,
        nextToken,
        endOfFile
    };
}

