This is a simple mystery-solving game for CSS learners to develop
their debugging skills.

CSS snippets are randomly "broken" in one of a variety of ways based on
observation of CSS learners in [ScriptEd][] classes
at [Brooklyn International High School][bihs]. Players must tap the part
of the snippet that is broken to solve the mystery.

## Adding New Snippets

Add a new HTML file to the `challenges` directory and update the
`NUM_CHALLENGES` constant in `main.js`. Note that each challenge must
be formatted in a consistent way; see the existing challenges for
examples and try to emulate their style.

To test out your challenge, add `challenge=<CHALLENGE NUMBER>` to
your query string, e.g. `?challenge=4`.

## Adding New Breakers

Add a new breaker function to the `breakers` hash in `breakers.js`.

To test out your breaker, add `breaker=<BREAKER FUNCTION NAME>` to
your query string, e.g. `?breaker=hyphenToUnderscore`.

[ScriptEd]: http://scripted.org/
[bihs]: http://www.mybihs.org/
