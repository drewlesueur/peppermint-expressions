poorModule("peppermint-expressions", function () { return function (code) {
  var isArray = function (obj) { return toString.call(obj) == '[object Array]'
  }, is = function (/*chr, args...*/) {
    var args, chr; chr = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    var matches = false;
    loop(args, function (item) { matches = matches || item(chr)})
    return matches;
  }, loop = function (list, fn) {
    for (var i = 0; i < list.length; i++) { fn(list[i], i) } 
  }, i = 0, ret, codeLength = code.length, breakSignal = "BREAK!! xyzzy"
  , __slice = [].slice
  , incIndex = function () { i += 1
  }, indenting = true , indentWidth = 0, indentionBased = false
  , closeAllOpenColons = false
  , innerParse = function (options) {
    options = options || {}; var indentedTextWidth = 0
    , inColon = ("inColon" in options) ? options.inColon : false
    , colonIndentWidth = ("colonIndentWidth" in options) ? options.colonIndentWidth : 0
    , lastGroup = function () { return group[group.length - 1]
    }, setLastGroup = function (x) { group[group.length - 1] = x
    }, secondTolastGroup = function () { return group[group.length - 2]
    }, lastCharIsEndParens = function () { return i != 0 && code.substr(i - 1, 1) == ")" }
    , makeArrayLastGroup = function () {
      var last = lastGroup();
      if (!isArray(last)) { setLastGroup([last])  }
    }, makeLastItemString = function () {
      lastGroup()[0] = "'" + lastGroup()[0] 
    }, joinLastTwo = function () {
      makeArrayLastGroup(); if (inDot) makeLastItemString();
      var func = group.splice(group.length - 2, 1)[0]
      lastGroup().unshift(func);
    }, getIndent = function (text) {
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
    }, handleOuterFuncCall = function (options) {
      var funcOutsideParens = lastCharIsEndParens() || word.length
      addWord(); var ret = handleStartParens(options);
      if (funcOutsideParens) { joinLastTwo() } return ret;
    }, handleStartParens = function (options) { 
      incIndex(); return nestedParens(options);
    }, handleEndParens = function () {
      handleSpace(); if (inColon) i--; // close all open parens
      return breakSignal;
    }, addWord = function () { 
      if (word == 'ib') {
        indentionBased = true
      }
      if (word.length) { group.push(word);
        if (inDot) { joinLastTwo(); inDot = false; }
      }; resetWord();

    }, nestedParens = function (options) {
      var ret = innerParse(options);
      group.push(ret); return ret;
    }, resetWord = function () { word = ""
    }, handleSpace = function () { addWord();
    }, handleQuote = function () { strName = word; resetWord(); state = "text";
    }, handleTick = function () {
      if (!isSpaceLike(nextChr)) { handleWord()
      } else { state = "indented-text";
        indentedTextWidth = indentWidth; i++; }
    }, handleWord = function () { word += chr
    }, handlePeriod = function () {
      return handleSingleEndColon();
    }, handleDot = function () {
      handleSpace();
      if ( is(nextChr, isSpaceLike, isDot, isEmpty) 
           && !is(prevChr, isSpace)) { 
        return handlePeriod() 
      } else { inDot = true; }
    }, handleEscapeChar = function () { state = "escaped-text" 
    }, handleEndQuote = function () { if (strNameIsNext()) { 
        state = "code"; i += strName.length;
        group.push("'" + word); resetWord(); return; }
      word += chr;
    }, strNameIsNext = function () {
      var next = code.substr(i+1, strName.length);
      if (next == strName) return true; return false;
    }, checkForCloseColon = function () {
      if (state == "indented-text" && !is(nextChr, isSpace, isTab)
          && indentedTextWidth >= indentWidth) {
        word = "'" + sliceIndents(word)
        state = "code"
        return breakSignal;
      } else if (inColon && !is(nextChr, isSpace, isTab)
          && colonIndentWidth >= indentWidth) {
          return handleEndColon()
      }
      closeAllOpenColons = false
    }, manageIndentation = function () {
      if (indenting) {
        if (is(chr, isSpace, isTab)) { 
          indentWidth++; 
          return checkForCloseColon(); }
        else if (is(chr, isCr, isLf)) { indentWidth = 0 }
        else { indenting = false }
      } else { if (is(chr, isCr, isLf)) {
          indenting = true; indentWidth = 0;
          return checkForCloseColon()
        } }
    }, handleStartColon = function () {
      console.log("iw" + indentWidth)
      return handleOuterFuncCall({ inColon: true,
        colonIndentWidth: indentWidth })
    }, handleSingleEndColon = function () {
      handleSpace();
      return breakSignal;
    }, handleEndColon = function () {
      handleSpace();
      closeAllOpenColons = true
      return breakSignal;
    }, handleCode = function () {
      if (manageIndentation() == breakSignal) return breakSignal;
      if (isStartParens(chr))  return handleOuterFuncCall();
      if (isEndParens(chr)) return handleEndParens()
      if (isSpaceLike(chr)) return handleSpace()
      if (isQuote(chr)) return handleQuote();
      if (isDot(chr)) return handleDot();
      if (isTick(chr)) return handleTick();
      if (isColon(chr)) { return handleStartColon(); }
      handleWord()
    }, handleText = function () {
      if (isQuote(chr)) return handleEndQuote(); handleWord();
    }, handleIndentedText = function () {
      if (manageIndentation() == breakSignal) return breakSignal;
      handleWord()
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
    }, word = "", state = "code", group = [],
    chr = "", strName = "", inDot = false;

    while (i < codeLength) {
      prevChr = chr; chr = code.charAt(i);
      nextChr = code.charAt(i + 1);
      if (closeAllOpenColons) { 
        if (inColon && colonIndentWidth >= indentWidth) {
          i--
          break
        } else {
          closeAllOpenColons = false
        }
      }
      if (state == "code") { ret = handleCode() } 
      else if (state == "text") { ret = handleText() }
      else if (state == "indented-text") { ret = handleIndentedText() }
      if (ret == breakSignal) break; incIndex();
    }; checkForCloseColon(); addWord(); //close open parens?
    return group; }; return innerParse(); } })
