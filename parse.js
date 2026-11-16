/**
 * marked v18.1.3 - a markdown parser
 * Copyright (c) 2018-2026, MarkedJS. (MIT License)
 * Copyright (c) 2011-2018, Christopher Jeffrey. (MIT License)
 * https://github.com/markedjs/marked
 */ /**
 * markdown-speed fork: this file started as marked's generated build and IS
 * edited here — it is a fork of marked 18.1.3 (MIT, see LICENSE and NOTICE
 * in this repository) specialised for marked's default options and tuned
 * for speed. Output stays byte-identical to marked 18.1.3's marked.parse
 * with default options for every input.
 */ function H ( ) {
  return {
    async : ! 1 , breaks : ! 1 , extensions : null , gfm : ! 0 , hooks : null , pedantic : ! 1 , renderer : null , silent : ! 1 , tokenizer : null , walkTokens : null
  }
 
}
var S = H ( ) ;
function se ( a ) {
  S = a
}
var B = {
  exec : ( ) => null
}
;
function D ( a ) {
  let e = [ ] ;
  return t => {
    let n = Math . max ( 0 , Math . min ( 3 , t - 1 ) ) , s = e [ n ] ;
    return s || ( s = a ( n ) , e [ n ] = s ) , s
  }
 
}
function c ( a , e = "" ) {
  let t = typeof a == "string" ? a : a . source , n = {
    replace : ( s , r ) => {
      let o = typeof r == "string" ? r : r . source ;
      return o = o . replace ( T . caret , "$1" ) , t = t . replace ( s , o ) , n
    }
    , getRegex : ( ) => new RegExp ( t , e )
  }
  ;
  return n
}
var Te = ( ( a = "" ) => {
  try {
    return ! ! new RegExp ( "(?<=1)(?<!1)" + a )
  }
  catch {
    return ! 1
  }
 
}
) ( ) , T = {
  codeRemoveIndent : /^(?: {0,3}\t| {1,4})/gm , outputLinkReplace : /\\([\[\]])/g , indentCodeCompensation : /^(\s+)(?:```)/ , beginningSpace : /^\s+/ , endingHash : /#$/ , startingSpaceChar : /^ / , endingSpaceChar : / $/ , endingSpaceTabChar : /[ \t]$/ , nonSpaceChar : /[^ ]/ , newLineCharGlobal : /\n/g , tabCharGlobal : /\t/g , leadingSpaceTab : /^[ \t]+/ , multipleSpaceGlobal : /\s+/g , blankLine : /^[ \t]*$/ , doubleBlankLine : /\n[ \t]*\n[ \t]*$/ , blockquoteStart : /^ {0,3}>/ , blockquoteSetextReplace : /\n {0,3}((?:=+|-+)[ \t]*)(?=\n|$)/g , blockquoteSetextReplace2 : /^ {0,3}>[ \t]?/gm , blockquoteMarkerWhitespace : /^( {0,3}>)([ \t]+)/gm , listReplaceNesting : /^ {1,4}(?=( {4})*[^ ])/g , listIsTask : /^\[[ xX]\][ \t]+\S/ , listReplaceTask : /^\[[ xX]\][ \t]+/ , listTaskCheckbox : /\[[ xX]\]/ , anyLine : /\n.*\n/ , hrefBrackets : /^<(.*)>$/ , tableDelimiter : /[:|]/ , tableAlignChars : /^\||\| *$/g , tableRowBlankLine : /\n[ \t]*$/ , tableAlignRight : /^ *-+: *$/ , tableAlignCenter : /^ *:-+: *$/ , tableAlignLeft : /^ *:-+ *$/ , startATag : /^<a /i , endATag : /^<\/a>/i , startPreScriptTag : /^<(pre|code|kbd|script)(\s|>)/i , endPreScriptTag : /^<\/(pre|code|kbd|script)(\s|>)/i , startAngleBracket : /^</ , endAngleBracket : />$/ , pedanticHrefTitle : /^([^'"]*[^\s])\s+(['"])(.*)\2/ , unicodeAlphaNumeric : /[\p{L}\p{N}]/u , numericCharacterReference : /&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));/ , numericCharacterReferenceOrAmpersand : /&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g , escapeTest : /[&<>"']/ , escapeReplace : /[&<>"']/g , escapeTestNoEncode : /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/ , escapeReplaceNoEncode : /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g , caret : /(^|[^\[])\^/g , percentDecode : /%25/g , findPipe : /\|/g , splitPipe : / \|/ , slashPipe : /\\\|/g , carriageReturn : /\r\n|\r/g , spaceLine : /^ +$/gm , notSpaceStart : /^\S*/ , endingNewline : /\n$/ , listItemRegex : a => new RegExp ( `^( {0,3}${a})((?:[	 ][^\\n]*)?(?:\\n|$))` ) , nextBulletRegex : D ( a => new RegExp ( `^ {0,${a}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))` ) ) , hrRegex : D ( a => new RegExp ( `^ {0,${a}}((?:-[ 	]*){3,}|(?:_[ 	]*){3,}|(?:\\*[ 	]*){3,})(?:\\n+|$)` ) ) , fencesBeginRegex : D ( a => new RegExp ( `^ {0,${a}}(?:\`\`\`|~~~)` ) ) , headingBeginRegex : D ( a => new RegExp ( `^ {0,${a}}#{1,6}(?:\\s|$)` ) ) , pedanticHeadingBeginRegex : D ( a => new RegExp ( `^ {0,${a}}#` ) ) , htmlBeginRegex : D ( a => new RegExp ( `^ {0,${a}}(?:</?(?:${K})(?: +|$|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)` , "i" ) ) , blockquoteBeginRegex : D ( a => new RegExp ( `^ {0,${a}}>` ) )
}
, ve = /^(?:[ \t]*(?:\n|$))+/ , Ze = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/ , He = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}(?:(?=`)\1`*|(?=~)\1~*) *(?=\n|$)|$)/ , W = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/ , je = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/ , oe = / {0,3}(?:[*+-]|\d{1,9}[.)])/ , Oe = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |fences|blockquote|heading|hr|html|table))+?)\n {0,3}(=+|-+)[ \t]*(?:\n+|$)/ , we = c ( Oe ) . replace ( /bull/g , oe ) . replace ( /blockCode/g , /(?: {4}| {0,3}\t)/ ) . replace ( /fences/g , / {0,3}(?:`{3,}|~{3,})/ ) . replace ( /blockquote/g , / {0,3}>/ ) . replace ( /heading/g , / {0,3}#{1,6}(?:\s|$)/ ) . replace ( /hr/g , / {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/ ) . replace ( /html/g , / {0,3}<[^\n>]+>\n/ ) . replace ( /\|table/g , "" ) . getRegex ( ) , Ge = c ( Oe ) . replace ( /bull/g , oe ) . replace ( /blockCode/g , /(?: {4}| {0,3}\t)/ ) . replace ( /fences/g , / {0,3}(?:`{3,}|~{3,})/ ) . replace ( /blockquote/g , / {0,3}>/ ) . replace ( /heading/g , / {0,3}#{1,6}(?:\s|$)/ ) . replace ( /hr/g , / {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/ ) . replace ( /html/g , / {0,3}<[^\n>]+>\n/ ) . replace ( /table/g , / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/ ) . getRegex ( ) , ae = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/ , Ne = /^[^\n]+/ , le = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\\n]|\n(?![ \t]*\n))+/ , Fe = c ( /^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/ ) . replace ( "label" , le ) . replace ( "title" , /(?:"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\\n]|\n(?!\n))*'|\((?:\\[\s\S]|[^()\\])*\))/ ) . getRegex ( ) , Qe = c ( /^(bull)([ \t][^\n]*?)?(?:\n|$)/ ) . replace ( /bull/g , oe ) . getRegex ( ) , K = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul" , ue = /<!--(?:-?>|[\s\S]*?(?:-->|$))/ , Ue = c ( "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?:[ \\t]+|\\n|/?>|$)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!(?:script|pre|style|textarea)(?![a-z0-9-]))([a-z][a-z0-9-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</[a-z][a-z0-9-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))" , "i" ) . replace ( "comment" , ue ) . replace ( "tag" , K ) . replace ( "attribute" , / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/ ) . getRegex ( ) , Pe = a => c ( ae ) . replace ( "hr" , W ) . replace ( "heading" , " {0,3}#{1,6}(?:\\s|$)" ) . replace ( "|lheading" , "" ) . replace ( "|table" , "" ) . replace ( "blockquote" , " {0,3}>" ) . replace ( "fences" , " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)" ) . replace ( "list" , a ) . replace ( "html" , " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)" ) . replace ( "tag" , K ) . getRegex ( ) , We = Pe ( / {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/ ) , Ke = Pe ( / {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/ ) , Xe = c ( /^( {0,3}> ?(?:(?![ \t]*(?:\n|$))(paragraph)|[^\n]*)(?:\n|$))+/ ) . replace ( "paragraph" , Ke ) . getRegex ( ) , pe = {
  blockquote : Xe , code : Ze , def : Fe , fences : He , heading : je , hr : W , html : Ue , lheading : we , list : Qe , newline : ve , paragraph : We , table : B , text : Ne
}
, xe = c ( "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)" ) . replace ( "hr" , W ) . replace ( "heading" , " {0,3}#{1,6}(?:\\s|$)" ) . replace ( "blockquote" , " {0,3}>" ) . replace ( "code" , "(?: {4}| {0,3}	)[^\\n]" ) . replace ( "fences" , " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)" ) . replace ( "list" , " {0,3}(?:[*+-]|1[.)])[ \\t]" ) . replace ( "html" , " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)" ) . replace ( "tag" , K ) . getRegex ( ) , Ve = {
  ... pe , lheading : Ge , table : xe , paragraph : c ( ae ) . replace ( "hr" , W ) . replace ( "heading" , " {0,3}#{1,6}(?:\\s|$)" ) . replace ( "|lheading" , "" ) . replace ( "table" , xe ) . replace ( "blockquote" , " {0,3}>" ) . replace ( "fences" , " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)" ) . replace ( "list" , " {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]" ) . replace ( "html" , " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)" ) . replace ( "tag" , K ) . getRegex ( )
}
, Je = {
  ... pe , html : c ( `^ *(?:comment(?: *\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1>(?: *\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?>(?: *\\n{2,}|\\s*$))` ) . replace ( "comment" , ue ) . replace ( /tag/g , "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b" ) . getRegex ( ) , def : /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/ , heading : /^(#{1,6})(.*)(?:\n+|$)/ , fences : B , lheading : /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/ , paragraph : c ( ae ) . replace ( "hr" , W ) . replace ( "heading" , ` *#{1,6} *[^
]` ) . replace ( "lheading" , we ) . replace ( "|table" , "" ) . replace ( "blockquote" , " {0,3}>" ) . replace ( "|fences" , "" ) . replace ( "|list" , "" ) . replace ( "|html" , "" ) . replace ( "|tag" , "" ) . getRegex ( )
}
, Ye = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/ , et = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/ , Se = /^( {2,}|\\)\n(?!\s*$)[ \t]*/ , tt = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/ , $ = /[\p{P}\p{S}]/u , j = /[\s\p{P}\p{S}]/u , X = /[^\s\p{P}\p{S}]/u , nt = c ( /^((?![*_])punctSpace)/ , "u" ) . replace ( /punctSpace/g , j ) . getRegex ( ) , rt = /[\p{Pi}\p{Ps}"']/u , ye = /(?!~)[\p{P}\p{S}]/u , st = /(?!~)[\s\p{P}\p{S}]/u , it = /(?:[^\s\p{P}\p{S}]|~)/u , ot = c ( /link|precode-code|html/ , "g" ) . replace ( "link" , /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/ ) . replace ( "precode-" , Te ? "(?<!`)()" : "(^^|[^`])" ) . replace ( "code" , /(?<b>`+)[^`]+\k<b>(?!`)/ ) . replace ( "html" , /<(?! )[^<>]*?>/ ) . getRegex ( ) , _e = /^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/ , at = c ( _e , "u" ) . replace ( /punct/g , $ ) . getRegex ( ) , lt = c ( _e , "u" ) . replace ( /punct/g , ye ) . getRegex ( ) , ut = /^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/ , pt = c ( ut , "u" ) . replace ( /openQuote/g , rt ) . replace ( /punct/g , $ ) . getRegex ( ) , $e = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)" , ct = c ( $e , "gu" ) . replace ( /notPunctSpace/g , X ) . replace ( /punctSpace/g , j ) . replace ( /punct/g , $ ) . getRegex ( ) , ht = c ( $e , "gu" ) . replace ( /notPunctSpace/g , it ) . replace ( /punctSpace/g , st ) . replace ( /punct/g , ye ) . getRegex ( ) , dt = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)" , gt = c ( dt , "gu" ) . replace ( /notPunctSpace/g , X ) . replace ( /punctSpace/g , j ) . replace ( /punct/g , $ ) . getRegex ( ) , kt = c ( "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)" , "gu" ) . replace ( /notPunctSpace/g , X ) . replace ( /punctSpace/g , j ) . replace ( /punct/g , $ ) . getRegex ( ) , ft = "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)" , mt = c ( ft , "gu" ) . replace ( /notPunctSpace/g , X ) . replace ( /punctSpace/g , j ) . replace ( /punct/g , $ ) . getRegex ( ) , xt = c ( /^~~?(?:((?!~)punct)|[^\s~])/ , "u" ) . replace ( /punct/g , $ ) . getRegex ( ) , bt = "^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)" , Rt = c ( bt , "gu" ) . replace ( /notPunctSpace/g , X ) . replace ( /punctSpace/g , j ) . replace ( /punct/g , $ ) . getRegex ( ) , Tt = c ( /\\(punct)/ , "gu" ) . replace ( /punct/g , $ ) . getRegex ( ) , Ot = c ( /(`+)(?:[^`]|[^`][\s\S]*?[^`])\1(?!`)|`+|\\(punct)/ , "gu" ) . replace ( /punct/g , $ ) . getRegex ( ) , wt = c ( /^<(scheme:[^\s\x00-\x1f<>]*|email)>/ ) . replace ( "scheme" , /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/ ) . replace ( "email" , /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/ ) . getRegex ( ) , Pt = c ( ue ) . replace ( "(?:-->|$)" , "-->" ) . getRegex ( ) , St = c ( "^comment|^</[a-zA-Z][a-zA-Z0-9-]*\\s*>|^<[a-zA-Z][a-zA-Z0-9-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>" ) . replace ( "comment" , Pt ) . replace ( "attribute" , /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/ ) . getRegex ( ) , Le = /\[(?:\\[\s\S]|[^\[\]\\])*\]/ , re = c ( /(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/ ) . replace ( "brackets" , Le ) . getRegex ( ) , yt = c ( /^!?\[(label)\]\([ \t\n]*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?[ \t\n]*\)/ ) . replace ( "label" , re ) . replace ( "href" , /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/ ) . replace ( "title" , /"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\((?:\\[\s\S]|[^)\\])*\)/ ) . getRegex ( ) , _t = c ( /^!?\[(label)\]\[(ref)\]/ ) . replace ( "label" , re ) . replace ( "ref" , le ) . getRegex ( ) , $t = c ( /^!?\[(ref)\](?:\[\])?/ ) . replace ( "ref" , le ) . getRegex ( ) , be = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\]){1,999}/ , Lt = c ( /(?:[^\[\]\\`]*(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\]))){0,999}?[^\[\]\\`]*?/ ) . replace ( "brackets" , Le ) . getRegex ( ) , Ct = c ( "reflink|nolink(?!\\()" , "g" ) . replace ( "reflink" , c ( /^!?\[(label)\]\[(ref)\]/ ) . replace ( "label" , Lt ) . replace ( "ref" , be ) . getRegex ( ) ) . replace ( "nolink" , c ( /^!?\[(ref)\](?:\[\])?/ ) . replace ( "ref" , be ) . getRegex ( ) ) . getRegex ( ) , Re = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/ , It = /[A-Za-z0-9._+-]+@[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/ , At = c ( /(?:mailto:email|xmpp:email(?:\/[A-Za-z0-9@.]+)?)/ ) . replace ( /email/g , It ) . getRegex ( ) , ce = {
  _backpedal : B , anyPunctuation : Tt , anyPunctuationOutsideCode : Ot , autolink : wt , blockSkip : ot , br : Se , code : et , del : B , delLDelim : B , delRDelim : B , emStrongLDelim : at , emStrongRDelimAst : ct , emStrongRDelimUnd : kt , escape : Ye , link : yt , nolink : $t , punctuation : nt , reflink : _t , reflinkSearch : Ct , tag : St , text : tt , url : B
}
, Et = {
  ... ce , emStrongLDelim : pt , emStrongRDelimAst : gt , emStrongRDelimUnd : mt , link : c ( /^!?\[(label)\]\((.*?)\)/ ) . replace ( "label" , re ) . getRegex ( ) , reflink : c ( /^!?\[(label)\]\s*\[([^\]]*)\]/ ) . replace ( "label" , re ) . getRegex ( )
}
, ie = {
  ... ce , emStrongRDelimAst : ht , emStrongLDelim : lt , delLDelim : xt , delRDelim : Rt , url : c ( /^emailProtocol|^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/ ) . replace ( "emailProtocol" , At ) . replace ( "protocol" , Re ) . replace ( "email" , /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/ ) . getRegex ( ) , _backpedal : /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/ , del : /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/ , text : c ( /^(?:[^a-zA-Z0-9](?=emailProtocol)|(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|wwwStart|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9](?=emailProtocol)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))))/ ) . replace ( "protocol" , Re ) . replace ( /emailProtocol/g , /(?:mailto|xmpp):/ ) . replace ( "wwwStart" , Te ? "(?<![^\\s*_~(])www\\." : "www\\." ) . getRegex ( )
}
, zt = {
  ... ie , br : c ( Se ) . replace ( "{2,}" , "*" ) . getRegex ( ) , text : c ( ie . text ) . replace ( "\\b_" , "\\b_| {2,}\\n" ) . replace ( /\{2,\}/g , "*" ) . getRegex ( )
}
, V = {
  normal : pe , gfm : Ve , pedantic : Je
}
, G = {
  normal : ce , gfm : ie , breaks : zt , pedantic : Et
}
;
var Mt = {
  "&" : "&amp;" , "<" : "&lt;" , ">" : "&gt;" , '"' : "&quot;" , "'" : "&#39;"
}
, Ce = a => Mt [ a ] ;
function P ( a , e ) {
  if ( e ) {
    if ( T . escapeTest . test ( a ) ) return a . replace ( T . escapeReplace , Ce )
  }
  else if ( T . escapeTestNoEncode . test ( a ) ) return a . replace ( T . escapeReplaceNoEncode , Ce ) ;
  return a
}
function Ie ( a ) {
  return T . numericCharacterReference . test ( a ) ? a . replace ( T . numericCharacterReferenceOrAmpersand , ( e , t , n ) => {
    if ( t === void 0 && n === void 0 ) return "&amp;" ; let s = t === void 0 ? Number . parseInt ( n , 16 ) : Number . parseInt ( t , 10 ) ; return s === 0 || s > 1114111 || s >= 55296 && s <= 57343 ? "\uFFFD" : s === 38 ? "&amp;" : String . fromCodePoint ( s )
  }
  ) : a
}
function he ( a ) {
  try {
    // markdown-speed: the %25 decode only changes the encoded string
    // when it contains "%25", which requires a '%' in the input.
    a = encodeURI ( a ) ;
    if ( a . includes ( "%25" ) ) a = a . replace ( T . percentDecode , "%" )
  }
  catch {
    return null
  }
  return a
}
function de ( a , e ) {
  // markdown-speed: without a backslash no pipe is escaped, so the
  // replace-then-split below reduces to splitting on '|' directly (the
  // inserted spaces land exactly where the split pattern looks, and
  // every cell is trimmed afterwards either way).
  let n , s = 0 ;
  if ( a . includes ( "\\" ) ) {
    let t = a . replace ( T . findPipe , ( r , o , i ) => {
      let l = ! 1 , p = o ; for ( ; -- p >= 0 && i [ p ] === "\\" ; ) l = ! l ; return l ? "|" : " |"
    }
    ) ;
    n = t . split ( T . splitPipe )
  }
  else n = a . split ( "|" ) ;
  if ( n [ 0 ] . trim ( ) || n . shift ( ) , n . length > 0 && ! n . at ( - 1 ) ?. trim ( ) && n . pop ( ) , e ) if ( n . length > e ) n . splice ( e ) ;
  else for ( ; n . length < e ; ) n . push ( "" ) ;
  for ( ; s < n . length ; s ++ ) n [ s ] = n [ s ] . trim ( ) . replace ( T . slashPipe , "|" ) ;
  return n
}
function L ( a , e , t ) {
  let n = a . length ;
  if ( n === 0 ) return "" ;
  let s = 0 ;
  for ( ; s < n ; ) {
    let r = a . charAt ( n - s - 1 ) ;
    if ( r === e && ! t ) s ++ ;
    else if ( r !== e && t ) s ++ ;
    else break
  }
  return a . slice ( 0 , n - s )
}
// markdown-speed: ge drops trailing blank lines (lines of only spaces
// and tabs) but keeps the string untouched when there is at most one.
// The original split the whole string into a line array to find that;
// scanning lines from the end finds the same cut without allocating.
function ge ( a ) {
  let pos = a . length , trailing = 0 ;
  for ( ; ; ) {
    let nl = pos === 0 ? - 1 : a . lastIndexOf ( "\n" , pos - 1 ) , lineStart = nl + 1 , blank = ! 0 ;
    for ( let i = lineStart ; i < pos ; i ++ ) {
      let c = a . charCodeAt ( i ) ;
      if ( c !== 32 && c !== 9 ) {
        blank = ! 1 ;
        break
      }

    }
    if ( ! blank ) break ;
    trailing ++ ;
    if ( nl < 0 ) {
      pos = 0 ;
      break
    }
    pos = nl
  }
  return trailing <= 1 ? a : a . slice ( 0 , pos )
}
// markdown-speed: can the anyPunctuationOutsideCode masking in #n
// change t? It cannot when no backslash is followed by a punctuation
// or symbol character and no backtick run is longer than one — see
// the note at the call site. Non-ASCII followers count as live: some
// are punctuation or symbols, and telling which is not worth it.
function maskPunctInert ( t ) {
  for ( let i = 0 ; i < t . length ; i ++ ) {
    let c = t . charCodeAt ( i ) ;
    if ( c === 92 ) {
      let d = t . charCodeAt ( i + 1 ) ;
      if ( d >= 128 || d >= 33 && d <= 47 || d >= 58 && d <= 64 || d >= 91 && d <= 96 || d >= 123 && d <= 126 ) return ! 1
    }
    else if ( c === 96 && t . charCodeAt ( i + 1 ) === 96 ) return ! 1
  }
  return ! 0
}
// markdown-speed: does a end with a blank line — a newline, only
// spaces/tabs, another newline, only spaces/tabs? That is exactly the
// other.doubleBlankLine pattern, checked from the end.
function endsDoubleBlank ( a ) {
  let i = a . length ;
  while ( i > 0 && ( a . charCodeAt ( i - 1 ) === 32 || a . charCodeAt ( i - 1 ) === 9 ) ) i -- ;
  if ( i === 0 || a . charCodeAt ( i - 1 ) !== 10 ) return ! 1 ;
  i -- ;
  while ( i > 0 && ( a . charCodeAt ( i - 1 ) === 32 || a . charCodeAt ( i - 1 ) === 9 ) ) i -- ;
  return i > 0 && a . charCodeAt ( i - 1 ) === 10
}
function F ( a ) {
  return a . trim ( ) . replace ( T . multipleSpaceGlobal , " " ) . toLowerCase ( ) . toUpperCase ( ) . toLowerCase ( )
}
function ke ( a , e ) {
  if ( a . indexOf ( e [ 0 ] ) === - 1 && a . indexOf ( e [ 1 ] ) === - 1 ) return - 1 ;
  let t = 0 ;
  for ( let n = 0 ; n < a . length ; n ++ ) if ( a [ n ] === "\\" ) n ++ ;
  else if ( a [ n ] === e [ 0 ] ) t ++ ;
  else if ( a [ n ] === e [ 1 ] && ( t -- , t < 0 ) ) return n ;
  return t > 0 ? - 2 : - 1
}
var N = new WeakMap ;
// markdown-speed: lastCloser finds what fe's left-to-right scan recorded
// for one delimiter character: the start of the last run of that character
// whose preceding character is not a space, tab, newline, CR or FF (a run
// at index 0 counts its predecessor as a newline, so it never records).
// Walking lastIndexOf backwards run by run gives the same index.
function lastCloser ( a , d ) {
  let from = a . length ;
  for ( ; ; ) {
    let s = a . lastIndexOf ( d , from - 1 ) ;
    if ( s < 0 ) return - 1 ;
    while ( s > 0 && a [ s - 1 ] === d ) s -- ;
    if ( s === 0 ) return - 1 ;
    let o = a [ s - 1 ] ;
    if ( o !== " " && o !== "\t" && o !== "\n" && o !== "\r" && o !== "\f" ) return s ;
    from = s
  }

}
function fe ( a ) {
  return {
    maskedSrc : a , lastPossibleEmStrongCloserIndex : {
      "*" : lastCloser ( a , "*" ) , _ : lastCloser ( a , "_" )
    }
    , lastPossibleDelCloserIndex : lastCloser ( a , "~" )
  }

}
function Ae ( a , e ) {
  let t = fe ( e ) , n = N . get ( a ) ;
  n ? n . push ( t ) : N . set ( a , [ t ] )
}
function Ee ( a ) {
  let e = N . get ( a ) ;
  e && ( e . pop ( ) , e . length === 0 && N . delete ( a ) )
}
function ze ( a , e , t ) {
  let n = N . get ( a ) ?. at ( - 1 ) ;
  return n && n . maskedSrc === e ? n . lastPossibleEmStrongCloserIndex [ t ] : fe ( e ) . lastPossibleEmStrongCloserIndex [ t ]
}
function Me ( a , e ) {
  let t = N . get ( a ) ?. at ( - 1 ) ;
  return t && t . maskedSrc === e ? t . lastPossibleDelCloserIndex : fe ( e ) . lastPossibleDelCloserIndex
}
function J ( a , e = 0 ) {
  let t = e , n = "" ;
  for ( let s of a ) if ( s === "	" ) {
    let r = 4 - t % 4 ;
    n += " " . repeat ( r ) , t += r
  }
  else n += s , t ++ ;
  return n
}
function De ( a , e , t , n , s ) {
  let r = e . href , o = e . title || null , i = a [ 1 ] . replace ( s . other . outputLinkReplace , "$1" ) , l = a [ 0 ] . charAt ( 0 ) === "!" , p = n . state . inLink , h = n . state . linkEmitted , u = n . state . inRawBlock ;
  n . state . inLink = ! 0 , n . state . linkEmitted = ! 1 ;
  let d = n . inlineTokens ( i ) , k = n . state . linkEmitted ;
  if ( n . state . linkEmitted = h , n . state . inLink = p , ! l ) {
    if ( k ) {
      n . state . inRawBlock = u ;
      return
    }
    n . state . linkEmitted = ! 0
  }
  return {
    type : l ? "image" : "link" , raw : t , href : r , title : o , text : i , tokens : d
  }
 
}
function Dt ( a , e , t ) {
  let n = a . match ( t . other . indentCodeCompensation ) ;
  if ( n === null ) return e ;
  let s = n [ 1 ] ;
  return e . split ( `
` ) . map ( r => {
    let o = r . match ( t . other . beginningSpace ) ; if ( o === null ) return r ; let [ i ] = o ; return r . slice ( Math . min ( i . length , s . length ) )
  }
  ) . join ( `
` )
}
// markdown-speed: the first line of a string, without split()'s array.
// Identical to a.split('\n', 1)[0] for every string.
function firstLine ( a ) {
  let i = a . indexOf ( "\n" ) ;
  return i < 0 ? a : a . slice ( 0 , i )
}
// markdown-speed: listItemRegex builds a fresh RegExp on every list();
// the bullet pattern repeats constantly, so cache the compiled regexes
// (they carry no /g flag, so sharing one changes nothing).
var listItemCache = new Map ;
// markdown-speed: could the GFM url tokenizer match at the start of e?
// Its regex opens with an email (local part of [A-Za-z0-9._+-] then '@'),
// a mailto:/xmpp: address, a www. prefix or an http/https/ftp URL. When
// none of those shapes is present the exec is a guaranteed miss, so the
// inline loop skips the call. This is a pure pre-filter: whenever it says
// true the real tokenizer runs unchanged.
// markdown-speed: could the GFM table pattern match e? It needs a header
// line, then a delimiter line made only of '|', ':', '-' and spaces with
// at least one '-'. Anything else is a guaranteed miss.
function tablePossible ( e ) {
  let nl = e . indexOf ( "\n" ) ;
  if ( nl < 0 ) return ! 1 ;
  let dash = ! 1 ;
  for ( let i = nl + 1 ; i < e . length ; i ++ ) {
    let c = e . charCodeAt ( i ) ;
    if ( c === 10 ) break ;
    if ( c === 45 ) {
      dash = ! 0 ;
      continue
    }
    if ( c === 124 || c === 58 || c === 32 ) continue ;
    return ! 1
  }
  return dash
}
// markdown-speed: could the setext (lheading) pattern match e? It needs
// an underline line — up to 3 spaces, then a run of '=' or '-', then only
// spaces/tabs — and its text part cannot cross a blank line, so the
// search stops at the first blank line.
function setextPossible ( e ) {
  let start = e . indexOf ( "\n" ) ;
  if ( start < 0 ) return ! 1 ;
  start ++ ;
  while ( start < e . length ) {
    let end = e . indexOf ( "\n" , start ) ;
    if ( end < 0 ) end = e . length ;
    let i = start , spaces = 0 ;
    while ( i < end && e . charCodeAt ( i ) === 32 ) {
      i ++ ;
      spaces ++
    }
    if ( i === end ) return ! 1 ;
    if ( spaces <= 3 ) {
      let c = e . charCodeAt ( i ) ;
      if ( c === 61 || c === 45 ) {
        let j = i ;
        while ( j < end && e . charCodeAt ( j ) === c ) j ++ ;
        let k = j ;
        while ( k < end && ( e . charCodeAt ( k ) === 32 || e . charCodeAt ( k ) === 9 ) ) k ++ ;
        if ( k === end ) return ! 0
      }

    }
    start = end + 1
  }
  return ! 1
}
// markdown-speed: f.replace(/^[ \t]+/, run => J(run)) — J expands tabs
// to spaces; a leading run with no tab in it comes back unchanged, as
// does a line with no leading run at all, so both skip the replace.
function detabLead ( f , col = 0 ) {
  let tab = ! 1 ;
  for ( let i = 0 ; i < f . length ; i ++ ) {
    let c = f . charCodeAt ( i ) ;
    if ( c === 9 ) {
      tab = ! 0 ;
      continue
    }
    if ( c !== 32 ) break
  }
  return tab ? f . replace ( T . leadingSpaceTab , me => J ( me , col ) ) : f
}
// markdown-speed: could any of the "line begins a block" patterns used
// inside list() match this line? Each is anchored to at most n leading
// spaces (n = clamp(indent - 1, 0, 3), the cache key the pattern builder
// uses) and then one distinctive character: a fence backtick or tilde, a
// heading '#', an HTML '<', a blockquote '>', a bullet '*', '+' or '-',
// a thematic-break '_' or a digit. Without one, all six tests fail.
function blockBeginAt ( line , n ) {
  let i = 0 ;
  while ( i < n && line . charCodeAt ( i ) === 32 ) i ++ ;
  let c = line . charCodeAt ( i ) ;
  return c === 96 || c === 126 || c === 35 || c === 60 || c === 62 || c === 42 || c === 43 || c === 45 || c === 95 || ( c >= 48 && c <= 57 )
}
function urlPossible ( e ) {
  if ( e . startsWith ( "www." ) || e . startsWith ( "mailto:" ) || e . startsWith ( "xmpp:" ) ) return ! 0 ;
  let c = e . charCodeAt ( 0 ) ;
  if ( ( c === 104 || c === 72 || c === 102 || c === 70 ) && /^(?:https?|ftp):\/\//i . test ( e ) ) return ! 0 ;
  let i = 0 , n = e . length ;
  for ( ; i < n ; i ++ ) {
    c = e . charCodeAt ( i ) ;
    if ( ! ( c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57 || c === 46 || c === 95 || c === 43 || c === 45 ) ) break
  }
  return i > 0 && e . charCodeAt ( i ) === 64
}
function Be ( a , e , t , n ) {
  if ( ! e . includes ( "<" ) ) return ! 1 ;
  for ( let s = 0 ; s < e . length ; s ++ ) {
    if ( e [ s ] === "\\" ) {
      s ++ ;
      continue
    }
    if ( e [ s ] === "`" ) {
      let i = n . inline . code . exec ( e . slice ( s ) ) ;
      if ( i ) {
        s += i [ 0 ] . length - 1 ;
        continue
      }
     
    }
    if ( e [ s ] !== "<" ) continue ;
    let r = a . slice ( t + s ) , o = n . inline . tag . exec ( r ) || n . inline . autolink . exec ( r ) ;
    if ( o ) {
      if ( o [ 0 ] . length > e . length - s ) return ! 0 ;
      s += o [ 0 ] . length - 1
    }
   
  }
  return ! 1
}
var _ = class {
  options ;
  rules ;
  lexer ;
  constructor ( e ) {
    this . options = e || S
  }
  space ( e ) {
    let t = this . rules . block . newline . exec ( e ) ;
    if ( t && t [ 0 ] . length > 0 ) return {
      type : "space" , raw : t [ 0 ]
    }
   
  }
  code ( e ) {
    let t = this . rules . block . code . exec ( e ) ;
    if ( t ) {
      let n = this . options . pedantic ? t [ 0 ] : ge ( t [ 0 ] ) , s = n . replace ( this . rules . other . codeRemoveIndent , "" ) ;
      return {
        type : "code" , raw : n , codeBlockStyle : "indented" , text : s
      }
     
    }
   
  }
  fences ( e ) {
    let t = this . rules . block . fences . exec ( e ) ;
    if ( t ) {
      let n = t [ 0 ] , s = Dt ( n , t [ 3 ] || "" , this . rules ) ;
      return {
        type : "code" , raw : n , lang : t [ 2 ] ? t [ 2 ] . trim ( ) . replace ( this . rules . inline . anyPunctuation , "$1" ) : t [ 2 ] , text : s
      }
     
    }
   
  }
  heading ( e ) {
    let t = this . rules . block . heading . exec ( e ) ;
    if ( t ) {
      let n = t [ 2 ] . trim ( ) ;
      if ( this . rules . other . endingHash . test ( n ) ) {
        let s = L ( n , "#" ) ;
        ( this . options . pedantic || ! s || this . rules . other . endingSpaceTabChar . test ( s ) ) && ( n = s . trim ( ) )
      }
      return {
        type : "heading" , raw : L ( t [ 0 ] , `
` ) , depth : t [ 1 ] . length , text : n , tokens : this . lexer . inline ( n )
      }
     
    }
   
  }
  hr ( e ) {
    let t = this . rules . block . hr . exec ( e ) ;
    if ( t ) return {
      type : "hr" , raw : L ( t [ 0 ] , `
` )
    }
   
  }
  blockquote ( e ) {
    let t = this . rules . block . blockquote . exec ( e ) ;
    if ( t ) {
      let n = L ( t [ 0 ] , `
` ) . split ( `
` ) , s = "" , r = "" , o = [ ] ;
      for ( ; n . length > 0 ; ) {
        let i = ! 1 , l = [ ] , p ;
        for ( p = 0 ; p < n . length ; p ++ ) if ( this . rules . other . blockquoteStart . test ( n [ p ] ) ) l . push ( n [ p ] ) , i = ! 0 ;
        else if ( ! i ) l . push ( n [ p ] ) ;
        else break ;
        n = n . slice ( p ) ;
        let h = l . join ( `
` ) , u = h . replace ( this . rules . other . blockquoteMarkerWhitespace , ( g , b , m ) => b + J ( m , b . length ) ) . replace ( this . rules . other . blockquoteSetextReplace , `
    $1` ) . replace ( this . rules . other . blockquoteSetextReplace2 , "" ) ;
        s = s ? `${s}
${h}` : h , r = r ? `${r}
${u}` : u ;
        let d = this . lexer . state . top ;
        if ( this . lexer . state . top = ! 0 , this . lexer . blockTokens ( u , o , ! 0 ) , this . lexer . state . top = d , n . length === 0 ) break ;
        let k = o . at ( - 1 ) ;
        if ( k ?. type === "code" || k ?. type === "heading" || k ?. type === "hr" || k ?. type === "html" || k ?. type === "table" ) break ;
        if ( k ?. type === "blockquote" ) {
          let g = k , b = n . join ( `
` ) , m = g . raw + `
` + b . replace ( this . rules . other . blockquoteSetextReplace2 , "" ) , f = this . blockquote ( m ) ;
          o [ o . length - 1 ] = f ;
          let y = m . substring ( f . raw . length ) . replace ( /^\n/ , "" ) , R = y ? y . split ( `
` ) . length : 0 , A = R ? n . slice ( 0 , - R ) : n ;
          if ( A . length > 0 && ( s = `${s}
${A.join(`
`)}` ) , r = r . substring ( 0 , r . length - g . text . length ) + f . text , n = n . slice ( A . length ) , n . length > 0 && this . rules . other . blockquoteStart . test ( n [ 0 ] ) ) continue ;
          break
        }
        else if ( k ?. type === "list" ) {
          let g = k , b = g . raw + `
` + n . join ( `
` ) , m = this . list ( b ) ;
          o [ o . length - 1 ] = m ;
          let f = m . raw . length > g . raw . length ? b . slice ( g . raw . length + 1 , m . raw . length ) . split ( `
` ) . length : 0 ;
          if ( f > 0 ) {
            let y = n . slice ( 0 , f ) . join ( `
` ) ;
            s = `${s}
${y}` , r = `${r}
${y}`
          }
          n = n . slice ( f ) ;
          continue
        }
       
      }
      return {
        type : "blockquote" , raw : s , tokens : o , text : r
      }
     
    }
   
  }
  list ( e ) {
    let t = this . rules . block . list . exec ( e ) ;
    if ( t ) {
      let n = e , s = ( ) => n . length - e . length , r = t [ 1 ] . trim ( ) , o = r . length > 1 , i = {
        type : "list" , raw : "" , ordered : o , start : o ? + r . slice ( 0 , - 1 ) : "" , loose : ! 1 , items : [ ]
      }
      ;
      r = o ? `\\d{1,9}\\${r.slice(-1)}` : `\\${r}` , this . options . pedantic && ( r = o ? r : "[*+-]" ) ;
      let l = listItemCache . get ( r ) ;
      if ( ! l ) {
        l = this . rules . other . listItemRegex ( r ) , listItemCache . set ( r , l )
      }
      let p = ! 1 ;
      for ( ; e ; ) {
        let u = ! 1 , d = "" ;
        if ( ! ( t = l . exec ( e ) ) ) break ;
        {
          let sp2 = 0 ;
          while ( e . charCodeAt ( sp2 ) === 32 ) sp2 ++ ;
          let c2 = e . charCodeAt ( sp2 ) ;
          if ( sp2 <= 3 && ( c2 === 45 || c2 === 95 || c2 === 42 ) && this . rules . block . hr . test ( e ) ) break
        }
        let k = s ( ) ;
        e = e . substring ( t [ 0 ] . length ) ;
        let g = firstLine ( t [ 2 ] ) , b = t [ 1 ] . length , m = this . options . pedantic ? J ( g , b ) : detabLead ( g , b ) , f = firstLine ( e ) , y = ! m . trim ( ) , R = 0 ;
        if ( this . options . pedantic ? ( R = 2 , d = m . trimStart ( ) ) : y ? R = b + 1 : ( R = m . search ( this . rules . other . nonSpaceChar ) , R = R > 4 ? 1 : R , d = m . slice ( R ) , R += b ) , y && this . rules . other . blankLine . test ( f ) && ( e = e . substring ( f . length + 1 ) , u = ! 0 ) , ! u ) {
          let v = this . rules . other . nextBulletRegex ( R ) , Q = this . rules . other . hrRegex ( R ) , ee = this . rules . other . fencesBeginRegex ( R ) , te = this . options . pedantic ? this . rules . other . pedanticHeadingBeginRegex ( R ) : this . rules . other . headingBeginRegex ( R ) , M = this . rules . other . htmlBeginRegex ( R ) , ne = this . rules . other . blockquoteBeginRegex ( R ) , bn = Math . max ( 0 , Math . min ( 3 , R - 1 ) ) ;
          for ( ; e ; ) {
            let U = firstLine ( e ) , Z ;
            if ( f = U , this . options . pedantic ? ( f = f . replace ( this . rules . other . listReplaceNesting , "  " ) , Z = f ) : Z = detabLead ( f ) , blockBeginAt ( f , bn ) && ( ee . test ( f ) || te . test ( f ) || M . test ( f ) || ne . test ( f ) || v . test ( f ) || Q . test ( f ) ) ) break ;
            if ( Z . search ( this . rules . other . nonSpaceChar ) >= R || ! f . trim ( ) ) d += `
` + Z . slice ( R ) ;
            else {
              if ( y || m . replace ( this . rules . other . tabCharGlobal , "    " ) . search ( this . rules . other . nonSpaceChar ) >= 4 || ( blockBeginAt ( m , bn ) && ( ee . test ( m ) || te . test ( m ) || M . test ( m ) || Q . test ( m ) ) ) ) break ;
              let qe = ! this . options . pedantic && /^ {0,3}(?:=+|-+) *$/ . test ( f ) && this . rules . block . lheading . test ( `${m}
${f}` ) ? `    ${Z.replace(/^ {0,3}/,"")}` : f ;
              d += `
` + qe
            }
            y = ! f . trim ( ) , e = e . substring ( U . length + 1 ) , m = Z . slice ( R )
          }
         
        }
        let A = n . slice ( k , s ( ) ) ;
        i . loose || ( p ? i . loose = ! 0 : endsDoubleBlank ( A ) && ( p = ! 0 ) ) , i . items . push ( {
          type : "list_item" , raw : A , task : ! ! this . options . gfm && this . rules . other . listIsTask . test ( d ) , loose : ! 1 , text : d , tokens : [ ]
        }
        )
      }
      let h = i . items . at ( - 1 ) ;
      if ( h ) h . raw = h . raw . trimEnd ( ) , h . text = h . text . trimEnd ( ) ;
      else return ;
      i . raw = n . slice ( 0 , s ( ) ) . trimEnd ( ) ;
      for ( let u of i . items ) if ( this . lexer . state . top = ! 1 , u . tokens = this . lexer . blockTokens ( u . text , [ ] ) , ! i . loose ) {
        let d = u . tokens . filter ( g => g . type === "space" ) , k = d . length > 0 && d . some ( g => this . rules . other . anyLine . test ( g . raw ) ) ;
        i . loose = k
      }
      for ( let u of i . items ) {
        let d = u . tokens [ 0 ] ;
        if ( u . task && ( d ?. type === "text" || d ?. type === "paragraph" ) ) {
          u . text = u . text . replace ( this . rules . other . listReplaceTask , "" ) , d . raw = d . raw . replace ( this . rules . other . listReplaceTask , "" ) , d . text = d . text . replace ( this . rules . other . listReplaceTask , "" ) ;
          for ( let g = this . lexer . inlineQueue . length - 1 ; g >= 0 ; g -- ) if ( this . rules . other . listIsTask . test ( this . lexer . inlineQueue [ g ] . src ) ) {
            this . lexer . inlineQueue [ g ] . src = this . lexer . inlineQueue [ g ] . src . replace ( this . rules . other . listReplaceTask , "" ) ;
            break
          }
          let k = this . rules . other . listTaskCheckbox . exec ( u . raw ) ;
          if ( k ) {
            let g = {
              type : "checkbox" , raw : k [ 0 ] + " " , checked : k [ 0 ] !== "[ ]"
            }
            ;
            u . checked = g . checked , i . loose ? u . tokens [ 0 ] && [ "paragraph" , "text" ] . includes ( u . tokens [ 0 ] . type ) && "tokens" in u . tokens [ 0 ] && u . tokens [ 0 ] . tokens ? ( u . tokens [ 0 ] . raw = g . raw + u . tokens [ 0 ] . raw , u . tokens [ 0 ] . text = g . raw + u . tokens [ 0 ] . text , u . tokens [ 0 ] . tokens . unshift ( g ) ) : u . tokens . unshift ( {
              type : "paragraph" , raw : g . raw , text : g . raw , tokens : [ g ]
            }
            ) : u . tokens . unshift ( g )
          }
         
        }
        else u . task && ( u . task = ! 1 )
      }
      if ( i . loose ) for ( let u of i . items ) {
        u . loose = ! 0 ;
        for ( let d of u . tokens ) d . type === "text" && ( d . type = "paragraph" )
      }
      return i
    }
   
  }
  html ( e ) {
    let t = this . rules . block . html . exec ( e ) ;
    if ( t ) {
      let n = ge ( t [ 0 ] ) ;
      return {
        type : "html" , block : ! 0 , raw : n , pre : t [ 1 ] === "pre" || t [ 1 ] === "script" || t [ 1 ] === "style" , text : n
      }
     
    }
   
  }
  def ( e ) {
    let t = this . rules . block . def . exec ( e ) ;
    if ( t ) {
      if ( ! this . rules . other . startAngleBracket . test ( t [ 2 ] ) && ke ( t [ 2 ] , "()" ) !== - 1 ) return ;
      let n = F ( t [ 1 ] ) , s = t [ 2 ] ? t [ 2 ] . replace ( this . rules . other . hrefBrackets , "$1" ) . replace ( this . rules . inline . anyPunctuation , "$1" ) : "" , r = t [ 3 ] ? t [ 3 ] . substring ( 1 , t [ 3 ] . length - 1 ) . replace ( this . rules . inline . anyPunctuation , "$1" ) : t [ 3 ] ;
      return {
        type : "def" , tag : n , raw : L ( t [ 0 ] , `
` ) , href : s , title : r
      }
     
    }
   
  }
  table ( e ) {
    let t = this . rules . block . table . exec ( e ) ;
    if ( ! t || ! this . rules . other . tableDelimiter . test ( t [ 2 ] ) ) return ;
    let n = de ( t [ 1 ] ) , s = t [ 2 ] . replace ( this . rules . other . tableAlignChars , "" ) . split ( "|" ) , r = t [ 3 ] ?. trim ( ) ? t [ 3 ] . replace ( this . rules . other . tableRowBlankLine , "" ) . split ( `
` ) : [ ] , o = {
      type : "table" , raw : L ( t [ 0 ] , `
` ) , header : [ ] , align : [ ] , rows : [ ]
    }
    ;
    if ( n . length === s . length ) {
      for ( let i of s ) this . rules . other . tableAlignRight . test ( i ) ? o . align . push ( "right" ) : this . rules . other . tableAlignCenter . test ( i ) ? o . align . push ( "center" ) : this . rules . other . tableAlignLeft . test ( i ) ? o . align . push ( "left" ) : o . align . push ( null ) ;
      for ( let i = 0 ; i < n . length ; i ++ ) o . header . push ( {
        text : n [ i ] , tokens : this . lexer . inline ( n [ i ] ) , header : ! 0 , align : o . align [ i ]
      }
      ) ;
      for ( let i of r ) o . rows . push ( de ( i , o . header . length ) . map ( ( l , p ) => ( {
        text : l , tokens : this . lexer . inline ( l ) , header : ! 1 , align : o . align [ p ]
      }
      ) ) ) ;
      return o
    }
   
  }
  lheading ( e ) {
    let t = this . rules . block . lheading . exec ( e ) ;
    if ( t ) {
      let n = t [ 1 ] . trim ( ) ;
      return {
        type : "heading" , raw : L ( t [ 0 ] , `
` ) , depth : t [ 2 ] . charAt ( 0 ) === "=" ? 1 : 2 , text : n , tokens : this . lexer . inline ( n )
      }
     
    }
   
  }
  paragraph ( e ) {
    let t = this . rules . block . paragraph . exec ( e ) ;
    if ( t ) {
      let n = t [ 1 ] . charAt ( t [ 1 ] . length - 1 ) === `
` ? t [ 1 ] . slice ( 0 , - 1 ) : t [ 1 ] ;
      return {
        type : "paragraph" , raw : t [ 0 ] , text : n , tokens : this . lexer . inline ( n )
      }
     
    }
   
  }
  text ( e ) {
    let t = this . rules . block . text . exec ( e ) ;
    if ( t ) return {
      type : "text" , raw : t [ 0 ] , text : t [ 0 ] , tokens : this . lexer . inline ( t [ 0 ] )
    }
   
  }
  escape ( e ) {
    let t = this . rules . inline . escape . exec ( e ) ;
    if ( t ) return {
      type : "escape" , raw : t [ 0 ] , text : t [ 1 ]
    }
   
  }
  tag ( e ) {
    let t = this . rules . inline . tag . exec ( e ) ;
    if ( t ) return ! this . lexer . state . inLink && this . rules . other . startATag . test ( t [ 0 ] ) ? this . lexer . state . inLink = ! 0 : this . lexer . state . inLink && this . rules . other . endATag . test ( t [ 0 ] ) && ( this . lexer . state . inLink = ! 1 ) , ! this . lexer . state . inRawBlock && this . rules . other . startPreScriptTag . test ( t [ 0 ] ) ? this . lexer . state . inRawBlock = ! 0 : this . lexer . state . inRawBlock && this . rules . other . endPreScriptTag . test ( t [ 0 ] ) && ( this . lexer . state . inRawBlock = ! 1 ) , {
      type : "html" , raw : t [ 0 ] , inLink : this . lexer . state . inLink , inRawBlock : this . lexer . state . inRawBlock , block : ! 1 , text : t [ 0 ]
    }
   
  }
  link ( e ) {
    if ( this . lexer . state . linkParenPossible === ! 1 ) return ;
    let t = this . rules . inline . link . exec ( e ) ;
    if ( t ) {
      let n = t [ 0 ] . charAt ( 0 ) === "!" ? 2 : 1 ;
      if ( ! this . options . pedantic && Be ( e , t [ 1 ] , n , this . rules ) ) return ;
      let s = t [ 2 ] . trim ( ) ;
      if ( ! this . options . pedantic && this . rules . other . startAngleBracket . test ( s ) ) {
        if ( ! this . rules . other . endAngleBracket . test ( s ) ) return ;
        let l = L ( s . slice ( 0 , - 1 ) , "\\" ) ;
        if ( ( s . length - l . length ) % 2 === 0 ) return
      }
      else {
        let l = ke ( t [ 2 ] , "()" ) ;
        if ( l === - 2 ) return ;
        if ( l > - 1 ) {
          let h = ( t [ 0 ] . indexOf ( "!" ) === 0 ? 5 : 4 ) + t [ 1 ] . length + l ;
          t [ 2 ] = t [ 2 ] . substring ( 0 , l ) , t [ 0 ] = t [ 0 ] . substring ( 0 , h ) . trim ( ) , t [ 3 ] = ""
        }
       
      }
      let r = L ( t [ 0 ] . slice ( 0 , - 1 ) , "\\" ) ;
      if ( ( t [ 0 ] . length - r . length ) % 2 === 0 ) return ;
      let o = t [ 2 ] , i = "" ;
      if ( this . options . pedantic ) {
        let l = this . rules . other . pedanticHrefTitle . exec ( o ) ;
        l && ( o = l [ 1 ] , i = l [ 3 ] )
      }
      else i = t [ 3 ] ? t [ 3 ] . slice ( 1 , - 1 ) : "" ;
      return o = o . trim ( ) , this . rules . other . startAngleBracket . test ( o ) && ( this . options . pedantic && ! this . rules . other . endAngleBracket . test ( s ) ? o = o . slice ( 1 ) : o = o . slice ( 1 , - 1 ) ) , De ( t , {
        href : o && o . replace ( this . rules . inline . anyPunctuation , "$1" ) , title : i && i . replace ( this . rules . inline . anyPunctuation , "$1" )
      }
      , t [ 0 ] , this . lexer , this . rules )
    }
   
  }
  reflink ( e , t ) {
    let n ;
    if ( ( n = this . rules . inline . reflink . exec ( e ) ) || ( n = this . rules . inline . nolink . exec ( e ) ) ) {
      let s = n [ 0 ] . charAt ( 0 ) === "!" ? 2 : 1 ;
      if ( ! this . options . pedantic && Be ( e , n [ 1 ] , s , this . rules ) ) return ;
      let r = t [ F ( n [ 2 ] || n [ 1 ] ) ] ;
      if ( ! r ) {
        let o = n [ 0 ] . charAt ( 0 ) ;
        return {
          type : "text" , raw : o , text : o
        }
       
      }
      return De ( n , r , n [ 0 ] , this . lexer , this . rules )
    }
   
  }
  emStrong ( e , t , n = "" ) {
    let s = this . rules . inline . emStrongLDelim . exec ( e ) ;
    if ( ! s || ! s [ 1 ] && ! s [ 2 ] && ! s [ 3 ] && ! s [ 4 ] ) return ;
    let r = s [ 0 ] [ 0 ] , o = n === r , i = t . length - e . length , l = i ;
    for ( ; ! this . options . pedantic && l > 0 && t [ l - 1 ] === r ; ) l -- ;
    let p = [ ... t . slice ( Math . max ( 0 , l - 2 ) , l ) ] . at ( - 1 ) ?? "" , h = p === "*" || p === "_" || ! ! this . rules . inline . punctuation . exec ( p ) ;
    l < i && ( n = p ) ;
    let u = l < i ? h : ! ! this . rules . inline . punctuation . exec ( n ) ;
    if ( s [ 4 ] && n . match ( this . rules . other . unicodeAlphaNumeric ) ) return ;
    let d = s [ 1 ] || s [ 3 ] || "" ;
    if ( ! d || ! n || u ) {
      let k = [ ... s [ 0 ] ] . length - 1 , g , b , m = k , f = 0 , y = i - l + k , R = ! this . options . pedantic && ! ! p . trim ( ) && ( ! ! d || r === "*" && ! h ) ;
      if ( r !== "*" && r !== "_" ) return ;
      let A = r === "*" ? this . rules . inline . emStrongRDelimAst : this . rules . inline . emStrongRDelimUnd , v = ze ( this , t , r ) , Q = t . length - e . length + k ;
      if ( v < Q ) return ;
      t = t . slice ( - 1 * e . length + k ) ;
      let ee = v - Q ;
      for ( A . lastIndex = 0 ; ( s = A . exec ( t ) ) !== null && ! ( s . index > ee ) ; ) {
        if ( g = s [ 1 ] || s [ 2 ] || s [ 3 ] || s [ 4 ] || s [ 5 ] || s [ 6 ] , ! g ) continue ;
        if ( b = [ ... g ] . length , s [ 3 ] || s [ 4 ] ) {
          m += b ;
          continue
        }
        else if ( s [ 5 ] || s [ 6 ] || R ) {
          if ( o && ( s [ 5 ] || s [ 6 ] ) ) break ;
          if ( y % 3 && ! ( ( y + b ) % 3 ) ) {
            f += b ;
            continue
          }
         
        }
        if ( m -= b , m > 0 ) continue ;
        b = Math . min ( b , b + m + f ) ;
        let te = [ ... s [ 0 ] ] [ 0 ] . length , M = e . slice ( 0 , k + s . index + te + b ) ;
        if ( Math . min ( k , b ) % 2 ) {
          let U = M . slice ( 1 , - 1 ) ;
          return {
            type : "em" , raw : M , text : U , tokens : this . lexer . inlineTokens ( U )
          }
         
        }
        let ne = M . slice ( 2 , - 2 ) ;
        return {
          type : "strong" , raw : M , text : ne , tokens : this . lexer . inlineTokens ( ne )
        }
       
      }
     
    }
   
  }
  codespan ( e ) {
    let t = this . rules . inline . code . exec ( e ) ;
    if ( t ) {
      let n = t [ 2 ] . replace ( this . rules . other . newLineCharGlobal , " " ) , s = this . rules . other . nonSpaceChar . test ( n ) , r = this . rules . other . startingSpaceChar . test ( n ) && this . rules . other . endingSpaceChar . test ( n ) ;
      return s && r && ( n = n . substring ( 1 , n . length - 1 ) ) , {
        type : "codespan" , raw : t [ 0 ] , text : n
      }
     
    }
   
  }
  br ( e ) {
    let t = this . rules . inline . br . exec ( e ) ;
    if ( t ) return {
      type : "br" , raw : t [ 0 ]
    }
   
  }
  del ( e , t , n = "" ) {
    let s = this . rules . inline . delLDelim . exec ( e ) ;
    if ( ! s ) return ;
    if ( ! ( s [ 1 ] || "" ) || ! n || this . rules . inline . punctuation . exec ( n ) ) {
      let o = [ ... s [ 0 ] ] . length - 1 , i , l , p = o , h = this . rules . inline . delRDelim , u = Me ( this , t ) , d = t . length - e . length + o ;
      if ( u < d ) return ;
      t = t . slice ( - 1 * e . length + o ) ;
      let k = u - d ;
      for ( h . lastIndex = 0 ; ( s = h . exec ( t ) ) !== null && ! ( s . index > k ) ; ) {
        if ( i = s [ 1 ] || s [ 2 ] || s [ 3 ] || s [ 4 ] || s [ 5 ] || s [ 6 ] , ! i || ( l = [ ... i ] . length , l !== o ) ) continue ;
        if ( s [ 3 ] || s [ 4 ] ) {
          p += l ;
          continue
        }
        if ( p -= l , p > 0 ) continue ;
        l = Math . min ( l , l + p ) ;
        let g = [ ... s [ 0 ] ] [ 0 ] . length , b = e . slice ( 0 , o + s . index + g + l ) , m = b . slice ( o , - o ) ;
        return {
          type : "del" , raw : b , text : m , tokens : this . lexer . inlineTokens ( m )
        }
       
      }
     
    }
   
  }
  autolink ( e ) {
    let t = this . rules . inline . autolink . exec ( e ) ;
    if ( t ) {
      let n , s ;
      return t [ 2 ] === "@" ? ( n = t [ 1 ] , s = "mailto:" + n ) : ( n = t [ 1 ] , s = n ) , {
        type : "link" , raw : t [ 0 ] , text : n , href : s , autolink : ! 0 , tokens : [ {
          type : "text" , raw : n , text : n
        }
        ]
      }
     
    }
   
  }
  url ( e ) {
    let t ;
    if ( t = this . rules . inline . url . exec ( e ) ) {
      let n , s ;
      if ( t [ 2 ] === "@" ) n = t [ 0 ] , s = "mailto:" + n ;
      else {
        let r ;
        do r = t [ 0 ] , t [ 0 ] = this . rules . inline . _backpedal . exec ( t [ 0 ] ) ?. [ 0 ] ?? "" ;
        while ( r !== t [ 0 ] ) ;
        n = t [ 0 ] , t [ 1 ] === "www." ? s = "http://" + t [ 0 ] : s = t [ 0 ]
      }
      return {
        type : "link" , raw : t [ 0 ] , text : n , href : s , autolink : ! 0 , tokens : [ {
          type : "text" , raw : n , text : n
        }
        ]
      }
     
    }
   
  }
  inlineText ( e ) {
    let t = this . rules . inline . text . exec ( e ) ;
    if ( t ) {
      let n = this . lexer . state . inRawBlock ;
      return {
        type : "text" , raw : t [ 0 ] , text : n ? t [ 0 ] : Ie ( t [ 0 ] ) , escaped : n
      }
     
    }
   
  }
 
}
;
var O = class a {
  tokens ;
  options ;
  state ;
  inlineQueue ;
  tokenizer ;
  constructor ( e ) {
    this . tokens = [ ] , this . tokens . links = Object . create ( null ) , this . options = e || S , this . options . tokenizer = this . options . tokenizer || new _ , this . tokenizer = this . options . tokenizer , this . tokenizer . options = this . options , this . tokenizer . lexer = this , this . inlineQueue = [ ] , this . state = {
      inLink : ! 1 , inRawBlock : ! 1 , linkEmitted : ! 1 , linkParenPossible : ! 0 , top : ! 0
    }
    ;
    let t = {
      other : T , block : V . normal , inline : G . normal
    }
    ;
    this . options . pedantic ? ( t . block = V . pedantic , t . inline = G . pedantic ) : this . options . gfm && ( t . block = V . gfm , this . options . breaks ? t . inline = G . breaks : t . inline = G . gfm ) , this . tokenizer . rules = t
  }
  static get rules ( ) {
    return {
      block : V , inline : G
    }
   
  }
  static lex ( e , t ) {
    return new a ( t ) . lex ( e )
  }
  static lexInline ( e , t ) {
    return new a ( t ) . inlineTokens ( e )
  }
  lex ( e ) {
    // markdown-speed: most inputs carry no CR at all; skip the global
    // replace scan for them (the replace itself is unchanged when a CR
    // is present).
    e = e . includes ( "\r" ) ? e . replace ( T . carriageReturn , `
` ) : e , this . blockTokens ( e , this . tokens ) ;
    for ( let t = 0 ; t < this . inlineQueue . length ; t ++ ) {
      let n = this . inlineQueue [ t ] ;
      this . state . inRawBlock = ! 1 , this . inlineTokens ( n . src , n . tokens )
    }
    return this . inlineQueue = [ ] , this . tokens
  }
  blockTokens ( e , t = [ ] , n = ! 1 ) {
    // markdown-speed: first-character dispatch, the block-level twin of
    // the inline loop's. Every block pattern opens with up to 3 spaces
    // and then a distinctive shape: indented code needs 4 spaces or a
    // tab after at most 3 spaces, fences a backtick or tilde, a heading
    // '#', a thematic break '-', '_' or '*', a blockquote '>', a list a
    // bullet or a digit, an HTML block '<', a link definition '['. The
    // table and setext patterns are gated by the shape of the following
    // lines instead (tablePossible / setextPossible). A gated-out
    // tokenizer cannot match, so the first match in marked's order is
    // unchanged; paragraph and text stay ungated as the fallbacks.
    this . tokenizer . lexer = this ;
    let tk = this . tokenizer ;
    let s = 1 / 0 ;
    for ( ; e ; ) {
      if ( e . length < s ) s = e . length ;
      else {
        this . infiniteLoopError ( e . charCodeAt ( 0 ) ) ;
        break
      }
      let r ;
      let sp = 0 ;
      while ( e . charCodeAt ( sp ) === 32 ) sp ++ ;
      let c = e . charCodeAt ( sp ) ;
      let blank = ! 1 ;
      {
        let k = sp ;
        for ( ; ; ) {
          let ck = e . charCodeAt ( k ) ;
          if ( ck === 32 || ck === 9 ) {
            k ++ ;
            continue
          }
          blank = ck === 10 || k === e . length ;
          break
        }

      }
      if ( blank && ( r = tk . space ( e ) ) ) {
        e = e . substring ( r . raw . length ) ;
        let i = t . at ( - 1 ) ;
        r . raw . length === 1 && i !== void 0 ? i . raw += `
` : t . push ( r ) ;
        continue
      }
      if ( ( sp >= 4 || ( sp <= 3 && c === 9 ) ) && ( r = tk . code ( e ) ) ) {
        e = e . substring ( r . raw . length ) ;
        let i = t . at ( - 1 ) ;
        i ?. type === "paragraph" || i ?. type === "text" ? ( i . raw += ( i . raw . endsWith ( `
` ) ? "" : `
` ) + r . raw , i . text += `
` + r . text , this . inlineQueue . at ( - 1 ) . src = i . text ) : t . push ( r ) ;
        continue
      }
      if ( sp <= 3 && ( c === 96 || c === 126 ) && ( r = tk . fences ( e ) ) ) {
        e = e . substring ( r . raw . length ) , t . push ( r ) ;
        continue
      }
      if ( sp <= 3 && c === 35 && ( r = tk . heading ( e ) ) ) {
        e = e . substring ( r . raw . length ) , t . push ( r ) ;
        continue
      }
      if ( sp <= 3 && ( c === 45 || c === 95 || c === 42 ) && ( r = tk . hr ( e ) ) ) {
        e = e . substring ( r . raw . length ) , t . push ( r ) ;
        continue
      }
      if ( sp <= 3 && c === 62 && ( r = tk . blockquote ( e ) ) ) {
        e = e . substring ( r . raw . length ) , t . push ( r ) ;
        continue
      }
      if ( sp <= 3 && ( c === 42 || c === 43 || c === 45 || ( c >= 48 && c <= 57 ) ) && ( r = tk . list ( e ) ) ) {
        e = e . substring ( r . raw . length ) , t . push ( r ) ;
        continue
      }
      if ( sp <= 3 && c === 60 && ( r = tk . html ( e ) ) ) {
        e = e . substring ( r . raw . length ) , t . push ( r ) ;
        continue
      }
      if ( sp <= 3 && c === 91 && ( r = tk . def ( e ) ) ) {
        e = e . substring ( r . raw . length ) ;
        let i = t . at ( - 1 ) ;
        i ?. type === "paragraph" || i ?. type === "text" ? ( i . raw += ( i . raw . endsWith ( `
` ) ? "" : `
` ) + r . raw , i . text += `
` + r . raw , this . inlineQueue . at ( - 1 ) . src = i . text ) : ( this . tokens . links [ r . tag ] || ( this . tokens . links [ r . tag ] = {
          href : r . href , title : r . title
        }
        ) , t . push ( r ) ) ;
        continue
      }
      if ( tablePossible ( e ) && ( r = tk . table ( e ) ) ) {
        e = e . substring ( r . raw . length ) , t . push ( r ) ;
        continue
      }
      if ( setextPossible ( e ) && ( r = tk . lheading ( e ) ) ) {
        e = e . substring ( r . raw . length ) , t . push ( r ) ;
        continue
      }
      if ( this . state . top && ( r = tk . paragraph ( e ) ) ) {
        let i = t . at ( - 1 ) ;
        n && i ?. type === "paragraph" ? ( i . raw += ( i . raw . endsWith ( `
` ) ? "" : `
` ) + r . raw , i . text += `
` + r . text , this . inlineQueue . pop ( ) , this . inlineQueue . at ( - 1 ) . src = i . text ) : t . push ( r ) , n = ! 1 , e = e . substring ( r . raw . length ) ;
        continue
      }
      if ( r = tk . text ( e ) ) {
        e = e . substring ( r . raw . length ) ;
        let i = t . at ( - 1 ) ;
        i ?. type === "text" ? ( i . raw += ( i . raw . endsWith ( `
` ) ? "" : `
` ) + r . raw , i . text += `
` + r . text , this . inlineQueue . pop ( ) , this . inlineQueue . at ( - 1 ) . src = i . text ) : t . push ( r ) ;
        continue
      }
      if ( e ) {
        this . infiniteLoopError ( e . charCodeAt ( 0 ) ) ;
        break
      }
     
    }
    return this . state . top = ! 0 , t
  }
  inline ( e , t = [ ] ) {
    return this . inlineQueue . push ( {
      src : e , tokens : t
    }
    ) , t
  }
  linkInText ( e ) {
    if ( ! e . includes ( "[" ) ) return ! 1 ;
    let t = this . tokenizer . rules . inline . link ;
    for ( let n of e . matchAll ( this . tokenizer . rules . inline . blockSkip ) ) if ( t . test ( n [ 0 ] ) && e . charAt ( n . index - 1 ) !== "!" ) return ! 0 ;
    for ( let n of e . matchAll ( this . tokenizer . rules . inline . reflinkSearch ) ) {
      let s = n [ 0 ] , r = s . lastIndexOf ( "[" ) ;
      if ( ! ( s . charAt ( 0 ) === "!" || ! Object . hasOwn ( this . tokens . links , F ( s . slice ( r + 1 , - 1 ) ) ) ) && ! ( r > 1 && this . linkInText ( s . slice ( 1 , r - 1 ) ) ) ) return ! 0
    }
    return ! 1
  }
  inlineTokens ( e , t = [ ] ) {
    this . tokenizer . lexer = this ;
    let n = this . state . linkParenPossible ;
    this . state . linkParenPossible = n && e . includes ( ")" ) ;
    try {
      return this . #e ( e , t )
    }
    finally {
      this . state . linkParenPossible = n
    }
   
  }
  #e ( e , t ) {
    let n = e . includes ( "*" ) || e . includes ( "_" ) || e . includes ( "~" ) || this . options . hooks ?. emStrongMask || this . tokenizer . emStrong !== _ . prototype . emStrong || this . tokenizer . del !== _ . prototype . del ? this . #n ( e ) : e ;
    Ae ( this . tokenizer , n ) ;
    try {
      return this . #t ( e , n , t )
    }
    finally {
      Ee ( this . tokenizer )
    }
   
  }
  #t ( e , t , n ) {
    // markdown-speed: first-character dispatch. Every inline tokenizer's
    // pattern is anchored to a distinct opening shape (escape and br to a
    // backslash, tag and autolink to '<', link and reflink to '[' or
    // '![', emStrong to '*' or '_', codespan to a backtick, br also to a
    // space, del to '~', url to the shapes urlPossible checks). A
    // tokenizer whose opening shape is absent cannot match, so the loop
    // only runs the ones that can — in marked's original order, with the
    // original bodies, so the first match is the same token marked picks.
    let s = ! 1 , r = "" , o = 1 / 0 ;
    let tk = this . tokenizer ;
    for ( ; e ; ) {
      if ( e . length < o ) o = e . length ;
      else {
        this . infiniteLoopError ( e . charCodeAt ( 0 ) ) ;
        break
      }
      s || ( r = "" ) , s = ! 1 ;
      let i ;
      let c0 = e . charCodeAt ( 0 ) ;
      if ( c0 === 92 && ( i = tk . escape ( e ) ) ) {
        e = e . substring ( i . raw . length ) , n . push ( i ) ;
        continue
      }
      if ( c0 === 60 && ( i = tk . tag ( e ) ) ) {
        e = e . substring ( i . raw . length ) , n . push ( i ) ;
        continue
      }
      let bracket = c0 === 91 || ( c0 === 33 && e . charCodeAt ( 1 ) === 91 ) ;
      if ( bracket && ( i = tk . link ( e ) ) ) {
        e = e . substring ( i . raw . length ) , n . push ( i ) ;
        continue
      }
      if ( bracket && ( i = tk . reflink ( e , this . tokens . links ) ) ) {
        e = e . substring ( i . raw . length ) ;
        let p = n . at ( - 1 ) ;
        i . type === "text" && p ?. type === "text" ? ( p . raw += i . raw , p . text += i . text ) : n . push ( i ) ;
        continue
      }
      if ( ( c0 === 42 || c0 === 95 ) && ( i = tk . emStrong ( e , t , r ) ) ) {
        e = e . substring ( i . raw . length ) , n . push ( i ) ;
        continue
      }
      if ( c0 === 96 && ( i = tk . codespan ( e ) ) ) {
        e = e . substring ( i . raw . length ) , n . push ( i ) ;
        continue
      }
      if ( ( c0 === 32 || c0 === 92 ) && ( i = tk . br ( e ) ) ) {
        e = e . substring ( i . raw . length ) , n . push ( i ) ;
        continue
      }
      if ( c0 === 126 && ( i = tk . del ( e , t , r ) ) ) {
        e = e . substring ( i . raw . length ) , n . push ( i ) ;
        continue
      }
      if ( c0 === 60 && ( i = tk . autolink ( e ) ) ) {
        e = e . substring ( i . raw . length ) , n . push ( i ) ;
        continue
      }
      if ( ! this . state . inLink && urlPossible ( e ) && ( i = tk . url ( e ) ) ) {
        e = e . substring ( i . raw . length ) , n . push ( i ) ;
        continue
      }
      if ( i = tk . inlineText ( e ) ) {
        e = e . substring ( i . raw . length ) , i . raw . slice ( - 1 ) !== "_" && ( r = i . raw . slice ( - 1 ) ) , s = ! 0 ;
        let p = n . at ( - 1 ) ;
        p ?. type === "text" ? ( p . raw += i . raw , p . text += i . text ) : n . push ( i ) ;
        continue
      }
      if ( e ) {
        this . infiniteLoopError ( e . charCodeAt ( 0 ) ) ;
        break
      }
     
    }
    return n
  }
  #n ( e ) {
    let t = e ;
    if ( this . tokens . links && e . includes ( "[" ) ) {
      let n = this . tokenizer . rules . inline . reflinkSearch , s = r => {
        let o = r . lastIndexOf ( "[" ) ;
        if ( ! Object . hasOwn ( this . tokens . links , F ( r . slice ( o + 1 , - 1 ) ) ) ) return r ;
        if ( o > 1 && r . charAt ( 0 ) !== "!" ) {
          let i = r . slice ( 1 , o - 1 ) ;
          if ( this . linkInText ( i ) ) return "[" + i . replace ( n , s ) + "][" + "a" . repeat ( r . length - o - 2 ) + "]"
        }
        return "[" + "a" . repeat ( r . length - 2 ) + "]"
      }
      ;
      t = t . replace ( n , s )
    }
    // markdown-speed: each masking pattern can only match when its
    // trigger characters are present — anyPunctuationOutsideCode needs a
    // backtick or a backslash, blockSkip needs '[', a backtick or '<'.
    // Without them the replace is the identity, so skip the scan. (The
    // emStrongMask hook marked applies here is null under the default
    // options this fork fixes.) The punctuation mask is also the
    // identity when no backslash is followed by a punctuation or symbol
    // character (the escape alternative cannot fire) and no backtick
    // run is longer than one (a code span's interior then holds no
    // backtick for the callback to mask).
    if ( ( t . includes ( "`" ) || t . includes ( "\\" ) ) && ! maskPunctInert ( t ) ) t = t . replace ( this . tokenizer . rules . inline . anyPunctuationOutsideCode , ( n , s , r ) => r ? "+" . repeat ( n . length ) : s ? s + n . slice ( s . length , - s . length ) . replace ( /`/g , "+" ) + s : n ) ;
    if ( t . includes ( "[" ) || t . includes ( "`" ) || t . includes ( "<" ) ) t = t . replace ( this . tokenizer . rules . inline . blockSkip , ( n , s , r ) => {
      let o = r ? r . length : 0 ; return n . slice ( 0 , o ) + "[" + "a" . repeat ( n . length - o - 2 ) + "]"
    }
    ) ;
    return t
  }
  infiniteLoopError ( e ) {
    let t = "Infinite loop on byte: " + e ;
    if ( this . options . silent ) console . error ( t ) ;
    else throw new Error ( t )
  }
 
}
;
var C = class {
  options ;
  parser ;
  constructor ( e ) {
    this . options = e || S
  }
  space ( e ) {
    return ""
  }
  code ( {
    text : e , lang : t , escaped : n
  }
  ) {
    let s = ( t || "" ) . match ( T . notSpaceStart ) ?. [ 0 ] , r = e ? e . replace ( T . endingNewline , "" ) + `
` : "" ;
    return s ? '<pre><code class="language-' + P ( s ) + '">' + ( n ? r : P ( r , ! 0 ) ) + `</code></pre>
` : "<pre><code>" + ( n ? r : P ( r , ! 0 ) ) + `</code></pre>
`
  }
  blockquote ( {
    tokens : e
  }
  ) {
    return `<blockquote>
${this.parser.parse(e)}</blockquote>
`
  }
  html ( {
    text : e
  }
  ) {
    return e
  }
  def ( e ) {
    return ""
  }
  heading ( {
    tokens : e , depth : t
  }
  ) {
    return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`
  }
  hr ( e ) {
    return `<hr>
`
  }
  list ( e ) {
    let t = e . ordered , n = e . start , s = "" ;
    for ( let i = 0 ; i < e . items . length ; i ++ ) {
      let l = e . items [ i ] ;
      s += this . listitem ( l )
    }
    let r = t ? "ol" : "ul" , o = t && n !== 1 ? ' start="' + n + '"' : "" ;
    return "<" + r + o + `>
` + s + "</" + r + `>
`
  }
  listitem ( e ) {
    return `<li>${this.parser.parse(e.tokens)}</li>
`
  }
  checkbox ( {
    checked : e
  }
  ) {
    return "<input " + ( e ? 'checked="" ' : "" ) + 'disabled="" type="checkbox"> '
  }
  paragraph ( {
    tokens : e
  }
  ) {
    return `<p>${this.parser.parseInline(e)}</p>
`
  }
  table ( e ) {
    let t = "" , n = "" ;
    for ( let r = 0 ; r < e . header . length ; r ++ ) n += this . tablecell ( e . header [ r ] ) ;
    t += this . tablerow ( {
      text : n
    }
    ) ;
    let s = "" ;
    for ( let r = 0 ; r < e . rows . length ; r ++ ) {
      let o = e . rows [ r ] ;
      n = "" ;
      for ( let i = 0 ; i < o . length ; i ++ ) n += this . tablecell ( o [ i ] ) ;
      s += this . tablerow ( {
        text : n
      }
      )
    }
    return s && ( s = `<tbody>${s}</tbody>` ) , `<table>
<thead>
` + t + `</thead>
` + s + `</table>
`
  }
  tablerow ( {
    text : e
  }
  ) {
    return `<tr>
${e}</tr>
`
  }
  tablecell ( e ) {
    let t = this . parser . parseInline ( e . tokens ) , n = e . header ? "th" : "td" ;
    return ( e . align ? `<${n} align="${e.align}">` : `<${n}>` ) + t + `</${n}>
`
  }
  strong ( {
    tokens : e
  }
  ) {
    return `<strong>${this.parser.parseInline(e)}</strong>`
  }
  em ( {
    tokens : e
  }
  ) {
    return `<em>${this.parser.parseInline(e)}</em>`
  }
  codespan ( {
    text : e
  }
  ) {
    return `<code>${P(e,!0)}</code>`
  }
  br ( e ) {
    return "<br>"
  }
  del ( {
    tokens : e
  }
  ) {
    return `<del>${this.parser.parseInline(e)}</del>`
  }
  link ( {
    href : e , title : t , text : n , tokens : s , autolink : r
  }
  ) {
    let o = r ? P ( n , ! 0 ) : this . parser . parseInline ( s ) , i = he ( e ) ;
    if ( i === null ) return o ;
    e = P ( i , r ) ;
    let l = '<a href="' + e + '"' ;
    return t && ( l += ' title="' + P ( t ) + '"' ) , l += ">" + o + "</a>" , l
  }
  image ( {
    href : e , title : t , text : n , tokens : s
  }
  ) {
    s && ( n = this . parser . parseInline ( s , this . parser . textRenderer ) ) ;
    let r = he ( e ) ;
    if ( r === null ) return P ( n ) ;
    e = r ;
    let o = `<img src="${P(e)}" alt="${P(n)}"` ;
    return t && ( o += ` title="${P(t)}"` ) , o += ">" , o
  }
  text ( e ) {
    return "tokens" in e && e . tokens ? this . parser . parseInline ( e . tokens ) : "escaped" in e && e . escaped ? e . text : P ( e . text )
  }
 
}
;
var E = class {
  parser ;
  strong ( {
    text : e , tokens : t
  }
  ) {
    return t ? this . parser . parseInline ( t , this ) : e
  }
  em ( {
    text : e , tokens : t
  }
  ) {
    return t ? this . parser . parseInline ( t , this ) : e
  }
  codespan ( {
    text : e
  }
  ) {
    return e
  }
  del ( {
    text : e , tokens : t
  }
  ) {
    return t ? this . parser . parseInline ( t , this ) : e
  }
  html ( {
    text : e
  }
  ) {
    return e
  }
  text ( {
    text : e
  }
  ) {
    return e
  }
  link ( {
    text : e , tokens : t
  }
  ) {
    return t ? this . parser . parseInline ( t , this ) : e
  }
  image ( {
    text : e , tokens : t
  }
  ) {
    return t ? this . parser . parseInline ( t , this ) : e
  }
  br ( ) {
    return ""
  }
  checkbox ( {
    raw : e
  }
  ) {
    return e
  }
 
}
;
var w = class a {
  options ;
  renderer ;
  textRenderer ;
  constructor ( e ) {
    this . options = e || S , this . options . renderer = this . options . renderer || new C , this . renderer = this . options . renderer , this . renderer . options = this . options , this . renderer . parser = this , this . textRenderer = new E , this . textRenderer . parser = this
  }
  static parse ( e , t ) {
    return new a ( t ) . parse ( e )
  }
  static parseInline ( e , t ) {
    return new a ( t ) . parseInline ( e )
  }
  parse ( e ) {
    this . renderer . parser = this ;
    let t = "" ;
    for ( let n = 0 ; n < e . length ; n ++ ) {
      let s = e [ n ] ;
      let r = s ;
      switch ( r . type ) {
        case "space" : {
          t += this . renderer . space ( r ) ;
          break
        }
        case "hr" : {
          t += this . renderer . hr ( r ) ;
          break
        }
        case "heading" : {
          t += this . renderer . heading ( r ) ;
          break
        }
        case "code" : {
          t += this . renderer . code ( r ) ;
          break
        }
        case "table" : {
          t += this . renderer . table ( r ) ;
          break
        }
        case "blockquote" : {
          t += this . renderer . blockquote ( r ) ;
          break
        }
        case "list" : {
          t += this . renderer . list ( r ) ;
          break
        }
        case "checkbox" : {
          t += this . renderer . checkbox ( r ) ;
          break
        }
        case "html" : {
          t += this . renderer . html ( r ) ;
          break
        }
        case "def" : {
          t += this . renderer . def ( r ) ;
          break
        }
        case "paragraph" : {
          t += this . renderer . paragraph ( r ) ;
          break
        }
        case "text" : {
          t += this . renderer . text ( r ) ;
          break
        }
        default : {
          let o = 'Token with "' + r . type + '" type was not found.' ;
          if ( this . options . silent ) return console . error ( o ) , "" ;
          throw new Error ( o )
        }
       
      }
     
    }
    return t
  }
  parseInline ( e , t = this . renderer ) {
    this . renderer . parser = this ;
    let n = "" ;
    for ( let s = 0 ; s < e . length ; s ++ ) {
      let r = e [ s ] ;
      let o = r ;
      switch ( o . type ) {
        case "escape" : {
          n += t . text ( o ) ;
          break
        }
        case "html" : {
          n += t . html ( o ) ;
          break
        }
        case "link" : {
          n += t . link ( o ) ;
          break
        }
        case "image" : {
          n += t . image ( o ) ;
          break
        }
        case "checkbox" : {
          n += t . checkbox ( o ) ;
          break
        }
        case "strong" : {
          n += t . strong ( o ) ;
          break
        }
        case "em" : {
          n += t . em ( o ) ;
          break
        }
        case "codespan" : {
          n += t . codespan ( o ) ;
          break
        }
        case "br" : {
          n += t . br ( o ) ;
          break
        }
        case "del" : {
          n += t . del ( o ) ;
          break
        }
        case "text" : {
          n += t . text ( o ) ;
          break
        }
        default : {
          let i = 'Token with "' + o . type + '" type was not found.' ;
          if ( this . options . silent ) return console . error ( i ) , "" ;
          throw new Error ( i )
        }
       
      }
     
    }
    return n
  }
 
}
;
var I = class {
  options ;
  block ;
  constructor ( e ) {
    this . options = e || S
  }
  static passThroughHooks = new Set ( [ "preprocess" , "postprocess" , "processAllTokens" , "emStrongMask" ] ) ;
  static passThroughHooksRespectAsync = new Set ( [ "preprocess" , "postprocess" , "processAllTokens" ] ) ;
  preprocess ( e ) {
    return e
  }
  postprocess ( e ) {
    return e
  }
  processAllTokens ( e ) {
    return e
  }
  emStrongMask ( e ) {
    return e
  }
  provideLexer ( e = this . block ) {
    return e ? O . lex : O . lexInline
  }
  provideParser ( e = this . block ) {
    return e ? w . parse : w . parseInline
  }
 
}
;
function z ( a , e ) {
  if ( Array . isArray ( e ) ) for ( let t = 0 ; t < e . length ; t ++ ) a . push ( e [ t ] ) ;
  else a . push ( e )
}
var Y = class {
  defaults = H ( ) ;
  options = this . setOptions ;
  parse = this . parseMarkdown ( ! 0 ) ;
  parseInline = this . parseMarkdown ( ! 1 ) ;
  Parser = w ;
  Renderer = C ;
  TextRenderer = E ;
  Lexer = O ;
  Tokenizer = _ ;
  Hooks = I ;
  constructor ( ... e ) {
    this . use ( ... e )
  }
  walkTokens ( e , t ) {
    let n = [ ] ;
    for ( let s of e ) switch ( z ( n , t . call ( this , s ) ) , s . type ) {
      case "table" : {
        let r = s ;
        for ( let o of r . header ) z ( n , this . walkTokens ( o . tokens , t ) ) ;
        for ( let o of r . rows ) for ( let i of o ) z ( n , this . walkTokens ( i . tokens , t ) ) ;
        break
      }
      case "list" : {
        let r = s ;
        z ( n , this . walkTokens ( r . items , t ) ) ;
        break
      }
      default : {
        let r = s ;
        this . defaults . extensions ?. childTokens ?. [ r . type ] ? this . defaults . extensions . childTokens [ r . type ] . forEach ( o => {
          let i = r [ o ] . flat ( 1 / 0 ) ; z ( n , this . walkTokens ( i , t ) )
        }
        ) : r . tokens && z ( n , this . walkTokens ( r . tokens , t ) )
      }
     
    }
    return n
  }
  use ( ... e ) {
    let t = this . defaults . extensions || {
      renderers : Object . create ( null ) , childTokens : Object . create ( null )
    }
    ;
    return e . forEach ( n => {
      let s = {
        ... n
      }
      ; if ( s . async = this . defaults . async || s . async || ! 1 , n . extensions && ( n . extensions . forEach ( r => {
        if ( ! r . name ) throw new Error ( "extension name required" ) ; if ( "renderer" in r ) {
          let o = t . renderers [ r . name ] ; o ? t . renderers [ r . name ] = function ( ... i ) {
            let l = r . renderer . apply ( this , i ) ; return l === ! 1 && ( l = o . apply ( this , i ) ) , l
          }
          : t . renderers [ r . name ] = r . renderer
        }
        if ( "tokenizer" in r ) {
          if ( ! r . level || r . level !== "block" && r . level !== "inline" ) throw new Error ( "extension level must be 'block' or 'inline'" ) ; let o = t [ r . level ] ; o ? o . unshift ( r . tokenizer ) : t [ r . level ] = [ r . tokenizer ] , r . start && ( r . level === "block" ? t . startBlock ? t . startBlock . push ( r . start ) : t . startBlock = [ r . start ] : r . level === "inline" && ( t . startInline ? t . startInline . push ( r . start ) : t . startInline = [ r . start ] ) )
        }
        "childTokens" in r && r . childTokens && ( t . childTokens [ r . name ] = r . childTokens )
      }
      ) , s . extensions = t ) , n . renderer ) {
        let r = this . defaults . renderer || new C ( this . defaults ) ; for ( let o in n . renderer ) {
          if ( ! ( o in r ) ) throw new Error ( `renderer '${o}' does not exist` ) ; if ( [ "options" , "parser" ] . includes ( o ) ) continue ; let i = o , l = n . renderer [ i ] , p = r [ i ] ; r [ i ] = ( ... h ) => {
            let u = l . apply ( r , h ) ; return u === ! 1 && ( u = p . apply ( r , h ) ) , u === ! 1 ? "" : u ?? ""
          }
         
        }
        s . renderer = r
      }
      if ( n . tokenizer ) {
        let r = this . defaults . tokenizer || new _ ( this . defaults ) ; for ( let o in n . tokenizer ) {
          if ( ! ( o in r ) ) throw new Error ( `tokenizer '${o}' does not exist` ) ; if ( [ "options" , "rules" , "lexer" ] . includes ( o ) ) continue ; let i = o , l = n . tokenizer [ i ] , p = r [ i ] ; r [ i ] = ( ... h ) => {
            let u = l . apply ( r , h ) ; return u === ! 1 && ( u = p . apply ( r , h ) ) , u
          }
         
        }
        s . tokenizer = r
      }
      if ( n . hooks ) {
        let r = this . defaults . hooks || new I ; for ( let o in n . hooks ) {
          if ( ! ( o in r ) ) throw new Error ( `hook '${o}' does not exist` ) ; if ( [ "options" , "block" ] . includes ( o ) ) continue ; let i = o , l = n . hooks [ i ] , p = r [ i ] ; I . passThroughHooks . has ( o ) ? r [ i ] = h => {
            if ( r . options . async && I . passThroughHooksRespectAsync . has ( o ) ) return ( async ( ) => {
              let d = await l . call ( r , h ) ; return p . call ( r , d )
            }
            ) ( ) ; let u = l . call ( r , h ) ; return p . call ( r , u )
          }
          : r [ i ] = ( ... h ) => {
            if ( r . options . async ) return ( async ( ) => {
              let d = await l . apply ( r , h ) ; return d === ! 1 && ( d = await p . apply ( r , h ) ) , d
            }
            ) ( ) ; let u = l . apply ( r , h ) ; return u === ! 1 && ( u = p . apply ( r , h ) ) , u
          }
         
        }
        s . hooks = r
      }
      if ( n . walkTokens ) {
        let r = this . defaults . walkTokens , o = n . walkTokens ; s . walkTokens = function ( i ) {
          let l = [ ] ; return z ( l , o . call ( this , i ) ) , r && z ( l , r . call ( this , i ) ) , l
        }
       
      }
      this . defaults = {
        ... this . defaults , ... s
      }
     
    }
    ) , this
  }
  setOptions ( e ) {
    return this . defaults = {
      ... this . defaults , ... e
    }
    , this
  }
  lexer ( e , t ) {
    return O . lex ( e , t ?? this . defaults )
  }
  parser ( e , t ) {
    return w . parse ( e , t ?? this . defaults )
  }
  parseMarkdown ( e ) {
    return ( n , s ) => {
      let r = {
        ... s
      }
      , o = {
        ... this . defaults , ... r
      }
      , i = this . onError ( ! ! o . silent , ! ! o . async ) ;
      if ( this . defaults . async === ! 0 && r . async === ! 1 ) return i ( new Error ( "marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise." ) ) ;
      if ( typeof n > "u" || n === null ) return i ( new Error ( "marked(): input parameter is undefined or null" ) ) ;
      if ( typeof n != "string" ) return i ( new Error ( "marked(): input parameter is of type " + Object . prototype . toString . call ( n ) + ", string expected" ) ) ;
      if ( o . hooks && ( o . hooks . options = o , o . hooks . block = e ) , o . async ) return ( async ( ) => {
        let l = o . hooks ? await o . hooks . preprocess ( n ) : n , h = await ( o . hooks ? await o . hooks . provideLexer ( e ) : e ? O . lex : O . lexInline ) ( l , o ) , u = o . hooks ? await o . hooks . processAllTokens ( h ) : h ; o . walkTokens && await Promise . all ( this . walkTokens ( u , o . walkTokens ) ) ; let k = await ( o . hooks ? await o . hooks . provideParser ( e ) : e ? w . parse : w . parseInline ) ( u , o ) ; return o . hooks ? await o . hooks . postprocess ( k ) : k
      }
      ) ( ) . catch ( i ) ;
      try {
        o . hooks && ( n = o . hooks . preprocess ( n ) ) ;
        let p = ( o . hooks ? o . hooks . provideLexer ( e ) : e ? O . lex : O . lexInline ) ( n , o ) ;
        o . hooks && ( p = o . hooks . processAllTokens ( p ) ) , o . walkTokens && this . walkTokens ( p , o . walkTokens ) ;
        let u = ( o . hooks ? o . hooks . provideParser ( e ) : e ? w . parse : w . parseInline ) ( p , o ) ;
        return o . hooks && ( u = o . hooks . postprocess ( u ) ) , u
      }
      catch ( l ) {
        return i ( l )
      }
     
    }
   
  }
  onError ( e , t ) {
    return n => {
      if ( n . message += `
Please report this to https://github.com/markedjs/marked.` , e ) {
        let s = "<p>An error occurred:</p><pre>" + P ( n . message + "" , ! 0 ) + "</pre>" ;
        return t ? Promise . resolve ( s ) : s
      }
      if ( t ) return Promise . reject ( n ) ;
      throw n
    }
   
  }
 
}
;
var q = new Y ;
function x ( a , e ) {
  return q . parse ( a , e )
}
x . options = x . setOptions = function ( a ) {
  return q . setOptions ( a ) , x . defaults = q . defaults , se ( x . defaults ) , x
}
;
x . getDefaults = H ;
x . defaults = S ;
function Bt ( ... a ) {
  return q . use ( ... a ) , x . defaults = q . defaults , se ( x . defaults ) , x
}
x . use = Bt ;
x . walkTokens = function ( a , e ) {
  return q . walkTokens ( a , e )
}
;
x . parseInline = q . parseInline ;
x . Parser = w ;
x . parser = w . parse ;
x . Renderer = C ;
x . TextRenderer = E ;
x . Lexer = O ;
x . lexer = O . lex ;
x . Tokenizer = _ ;
x . Hooks = I ;
x . parse = x ;
var _n = x . options , $n = x . setOptions , Ln = x . walkTokens , Cn = x . parseInline , In = x , An = w . parse , En = O . lex ;
// markdown-speed: the entry's drop-in. parse(markdown) returns exactly the
// HTML marked 18.1.3 renders with its default options (gfm true, breaks
// false, pedantic false). The Marked class above routes every call through
// option merging, hook checks and async detection; with the options fixed
// at the defaults none of that can change the result, so parse() drives
// the lexer and the parser directly on one shared defaults object (the
// lexer and parser constructors fill in its tokenizer and renderer once,
// exactly as they do on marked's per-call copy). Error behaviour matches
// marked's: bad input and lexer errors throw with the same messages.
const OPTS = H ( ) ;
export function parse ( markdown ) {
  if ( typeof markdown > "u" || markdown === null ) throw new Error ( "marked(): input parameter is undefined or null\nPlease report this to https://github.com/markedjs/marked." ) ;
  if ( typeof markdown != "string" ) throw new Error ( "marked(): input parameter is of type " + Object . prototype . toString . call ( markdown ) + ", string expected\nPlease report this to https://github.com/markedjs/marked." ) ;
  try {
    return w . parse ( O . lex ( markdown , OPTS ) , OPTS )
  }
  catch ( l ) {
    throw ( l . message += `
Please report this to https://github.com/markedjs/marked.` , l )
  }

}
