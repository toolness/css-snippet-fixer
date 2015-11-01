var startTime, numTries;

var CSS_REGEX = /<style>([\S\s]*)<\/style>/;

var breakers = {
  hyphenToUnderscore: simpleReplaceBreaker(/-/g, '_'),
  colonToSemicolon: simpleReplaceBreaker(/:/g, ';'),
  openingBraceMissing: simpleReplaceBreaker(/ {/g, '  '),
  oToA: simpleReplaceBreaker(/o/g, 'a'),
};

function simpleReplaceBreaker(regex, replacement) {
  return function(css) {
    var result = findRandomOccurrence(regex, css);

    if (!result) return null;

    return [result.index, result[0].length, replacement];
  }
}

// http://stackoverflow.com/a/901144
function getQueryArg(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
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

function createBrokenCSS(css, whatToBreak) {
  var span = $('<span></span>');
  var beginning = $('<span class="not-broken"></span>').appendTo(span);
  var middle = $('<span class="broken"></span>').appendTo(span);
  var ending = beginning.clone().appendTo(span);

  beginning.text(css.slice(0, whatToBreak[0]));
  middle.text(whatToBreak[2])
  ending.text(css.slice(whatToBreak[0] + whatToBreak[1]));

  return span;
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

function splitCSS(html) {
  var css;

  html = html.replace(CSS_REGEX, function() {
    css = arguments[1];
    return '';
  });

  return {html: html, css: css.trim()};
}

function replaceCSS(html, css) {
  return html.replace(CSS_REGEX, '<style>\n' + css + '\n</style>');
}

function createIframe(parent, html) {
  var iframe = document.createElement('iframe');
  parent.append(iframe);
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();
}

function doChallenge(originalHTML) {
  var split = splitCSS(originalHTML);
  var whatToBreak;

  if (getQueryArg('breaker')) {
    whatToBreak = breakers[getQueryArg('breaker')](split.css);
  } else {
    whatToBreak = randomlyBreakCSS(split.css);
  }

  var css = createBrokenCSS(split.css, whatToBreak);

  numTries = 0;
  startTime = Date.now();

  $("#css").append(css);
  $('.not-broken', css).on('click', function() {
    numTries++;
    window.alert('Nope, that is not broken. Try again!');
  });
  $('.broken', css).on('click', function() {
    var time = ((Date.now() - startTime) / 1000).toFixed(1);
    var tryText;

    if (numTries == 0) {
      tryText = 'on your first try';
    } else {
      tryText = 'after ' + numTries + ' attempts';
    }

    $("#css").text(split.css);
    createIframe($("#broken").empty(), originalHTML);
    window.alert('Yay, you found the broken CSS in ' +
                 time + ' seconds ' + tryText + '! Reload the page ' +
                 'to fix another.');
  });

  createIframe($("#broken"), replaceCSS(originalHTML, css.text()));
  createIframe($("#fixed"), originalHTML);
}

$(function() {
  var challenge = getQueryArg('challenge') || '001';
  $.get("challenges/" + challenge + ".html", doChallenge);
});
