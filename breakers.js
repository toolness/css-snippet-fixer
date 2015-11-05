// A "breaker" is a function that takes a CSS string as an argument
// and attempts to "break" it in some way. It should either return
// `null` (if it can't break the CSS) or an array of the form:
// 
//   [start, deleteCount, replacement]
//
// * `start` is the index at which to start changing the CSS string.
// * `deleteCount` is the number of characters to remove from the CSS
//   string at `start` index.
// * `replacement` is the substring to add to the CSS at `start` index.

var breakers = {
  hyphenToUnderscore: simpleReplaceBreaker(/-/g, '_'),
  colonToSemicolon: simpleReplaceBreaker(/:/g, ';'),
  openingBraceMissing: simpleReplaceBreaker(/ {/g, '  '),
  oToA: simpleReplaceBreaker(/o/g, 'a'),
  closingBraceMissing: function(css) {
    // We want to ignore closing braces at the end of stylesheets, since
    // removing them doesn't actually break the CSS.
    var result = findRandomOccurrence(/}\n\n/g, css);

    if (!result) return null;
    return [result.index, 3, ' \n \n'];
  },
  missingSemicolon: function(css) {
    // We want to ignore semicolons at the end of rules, since
    // removing them doesn't actually break the CSS (it's just bad
    // style).
    var result = findRandomOccurrence(/\;(?!\n})/g, css);

    if (!result) return null;
    return [result.index, 1, ' '];
  }
};

function simpleReplaceBreaker(regex, replacement) {
  return function(css) {
    var result = findRandomOccurrence(regex, css);

    if (!result) return null;

    return [result.index, result[0].length, replacement];
  }
}

function findAllOccurrences(regex, text) {
  var results = [];
  var result;

  while ((result = regex.exec(text)) !== null) {
    results.push(result);
  }

  return results;
}

function findRandomOccurrence(regex, text) {
  var results = findAllOccurrences(regex, text);

  if (results.length == 0) return null;
  return _.sample(results);
}

function randomlyBreakCSS(css) {
  var MAX_ATTEMPTS = 1000;
  var breakerNames = Object.keys(breakers);
  var whatToBreak;

  for (var i = 0; i < MAX_ATTEMPTS; i++) {
    whatToBreak = breakers[_.sample(breakerNames)](css);
    if (whatToBreak !== null)
      return whatToBreak;
  }

  throw new Error("Unable to break CSS after " + MAX_ATTEMPTS +
                  " attempts");
}
