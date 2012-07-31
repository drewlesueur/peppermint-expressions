poorModule("peppermint-lexer", function () { return function (code) {
var lex = function (code) {
  var tokens = []
  , getIndent = function (text) {
    var indent = 0;
    for (var i = 0; i < text.length; i++) {
      var chr = text.charAt(i); 
      if (is(chr, isSpace, isTab)) { indent += 1; }
      else { return indent } } return indent;
  }, sliceIndents = window.sliceIndents = function (text) {
    var lines = text.split("\n"), minIndent = Infinity;
    for (var i = 0; i < lines.length; i++ ) {
      var indent = getIndent(lines[i])  
      if (indent < minIndent) minIndent = indent;
    } for (var i = 0; i < lines.length; i++ ) {
      lines[i] = lines[i].slice(minIndent)
    } return lines.join("\n");
  }, is = function (/*chr, args...*/) {
    var args, chr; chr = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    var matches = false;
    loop(args, function (item) { matches = matches || item(chr)})
    return matches;
  }, loop = function (list, fn) {
    for (var i = 0; i < list.length; i++) { fn(list[i], i) } 
  }, addAllOutdents = function (indentWidth) {
    var toOutdent = [],  backI = tokens.length-1, indentCount = 0
    var a = 1
    while (backI >= 0) {
      var token = tokens[backI]; if (!token) break;
      if (token.type == "indent")  {
        indentCount += token.amt;
        toOutdent.push(token)
        tokens[backI] = "*indent" //dont care about amt anymore
        if (indentCount == indentWidth) { break; }
      }
      backI -= 1
    }
    for (var j = 0; j < toOutdent.length; j++) {
      var indentToken = toOutdent[j]
      tokens.push("*outdent")    
    }
  }, manageIndentation = function () {
    if (indenting) {
      if (is(chr, isSpace, isTab)) {
        indentWidth += 1;
      } else if (is(chr, isCr, isLf)) {
        indentWidth = 0
      } else {
        addAllOutdents(indentWidth)
        tokens.push({ type: "indent", amt: indentWidth })
        indenting = false;
      }
    } else {
      if (is(chr, isCr, isLf)) {
        indenting = true; lastIndentWidth = indentWidth;
      } 
    }
  }, resetWord = function () { word = ""
  }, addWord = function () { 
    if (word.length) { tokens.push(word); } resetWord();
  }, handleQuote = function () {
  }, handleDot = function () {
    addWord()
    if ( is(nextChr, isSpaceLike, isComma, isDot, isEmpty) 
        && !is(prevChr, isSpace)) { 

      tokens.push("*period")
    } else {
      tokens.push("*dot")
    }
  }, handleCode = function () {
    manageIndentation()
    if (isSpaceLike(chr)) return addWord();
    if (isQuote(chr)) return handleQuote();
    if (isTick(chr)) return handleTick();
    if (isDot(chr)) return handleDot();
    handleWord()
  }, handleText = function () {
    if (isQuote(chr)) return handleEndQuote(); handleWord();
  }, handleIndentedText = function () {
    handleWord()
  }, handleWord = function () { 
    word += chr
  }, incIndex = function () { i += 1
  }, isStartParens = function (chr) { return chr == "(";
  }, isTick = function (chr) { return chr == "'";
  }, isEndParens = function (chr) { return chr == ")";
  }, isSpaceLike = function (chr) { return chr == " " || chr == "\n" || chr == "\r" || chr == "\t"
  }, isSpace = function (chr) { return chr == " " 
  }, isQuote = function (chr) { return chr == "\""
  }, isDot = function (chr) { return chr == "."
  }, isEmpty = function (chr) { return chr == ""
  }, isCr = function (chr) { return chr == "\r"
  }, isLf = function (chr) { return chr == "\n"
  }, isTab = function (chr) { return chr == "\t"
  }, isColon = function (chr) { return chr == ":" 
  }, isComma = function (chr) { return chr == ","
  }, word = "", state = "code"
  , indenting = true, indentWidth = 0, __slice = [].slice
  , lastIndentWidth = 0, i = 0, codeLength = code.length
  , chr = "", nextChr = "", prevChr = "" , breakSignal = "xyzzy!!"

  while (i < codeLength) {
    prevChr = chr; chr = code.charAt(i); nextChr = code.charAt(i + 1);
    if (state == "code") { ret = handleCode() } 
    else if (state == "text") { ret = handleText() }
    else if (state == "indented-text") { ret = handleIndentedText() }
    if (ret == breakSignal) break; incIndex();
  };
  addWord()
  addAllOutdents()
  return tokens;
}

var tokens = lex(code) 
return tokens
} })
