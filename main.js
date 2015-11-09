var startTime, numTries;

var NUM_CHALLENGES = 4;
var CSS_REGEX = /<style>([\S\s]*)<\/style>/;

var challenge = parseInt(getQueryArg('challenge') || '1');

// http://stackoverflow.com/a/901144
function getQueryArg(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
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

function renderTemplate(sel, ctx) {
  var templateString = $(sel).text();
  return _.template(templateString)(ctx);
}

function normalizeNewlines(text) {
  return text.replace(/\r\n/g, '\n');
}

function doChallenge(originalHTML) {
  var split = splitCSS(normalizeNewlines(originalHTML));
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
  $('.not-broken', css).on('click', function(e) {
    numTries++;
    updateTotals(-1);
    drawCircle(e.pageX, e.pageY, 'miss');
    $('header').attr('class', 'lose');
    $("#message").html(renderTemplate('#lose-message')).hide().fadeIn();
    playAudio('#lose-sound');
  });
  $('.broken', css).on('click', function(e) {
    numTries++;
    updateTotals(2 + challenge);
    drawCircle(e.pageX, e.pageY, 'hit');
    $("#css").text(split.css);
    createIframe($("#broken").empty(), originalHTML);
    $('header').attr('class', 'win');
    $("#message").html(renderTemplate("#win-message", {
      numTries: numTries,
      time: ((Date.now() - startTime) / 1000).toFixed(1)
    })).hide().fadeIn();
    playAudio('#win-sound');
  });

  createIframe($("#broken"), replaceCSS(originalHTML, css.text()));
  createIframe($("#fixed"), originalHTML);
}

function playAudio(sel) {
  try {
    $(sel)[0].play();
  } catch (e) {}
}

function drawCircle(x, y, className) {
  var circle = $('<div class="circle"></div>')
    .addClass(className)
    .css({
      top: y + 'px',
      left: x + 'px'
    })
    .appendTo('body');
  return circle;
}

function updateTotals(score) {
  var totalScore = parseInt(window.sessionStorage['totalScore']);
  var startTime = parseInt(window.sessionStorage['startTime']);

  if (isNaN(totalScore)) {
    totalScore = 0;
  }

  if (isNaN(startTime)) {
    startTime = Date.now();
    window.sessionStorage['startTime'] = startTime;
  }

  totalScore += (score || 0);
  window.sessionStorage['totalScore'] = totalScore;

  $("#totals").html(renderTemplate('#totals-template', {
    totalTime: Math.floor((Date.now() - startTime) / 1000) + 's',
    totalScore: totalScore
  }));
}

$(function() {
  if (isNaN(challenge) || challenge <= 0 || challenge > NUM_CHALLENGES) {
    challenge = 1;
  }
  updateTotals();
  window.setInterval(updateTotals, 1000);
  $.get("challenges/00" + challenge + ".html", doChallenge);
  $("#reset").click(function(e) {
    e.preventDefault();
    delete sessionStorage['totalScore'];
    delete sessionStorage['startTime'];
    window.location = window.location.pathname;
  });
});
