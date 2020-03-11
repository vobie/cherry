# TL;DR
Engines are stateless, they do not need to keep any data locally unless it's for some advanced use case or performance reasons. Your engine should export two functions:
* `init(...args) returns [StartNode]`. Usually, this will be the familiar `document` node generated from HTML being passed as an argument. The returned value what is  initially passed as `context` to the top-level `select` calls.
* `select(selector,context) returns [Nodes]`. The function that returns an array of new elements matched by the selector given a context that is a list of Nodes.
(* Pipeline command list)

# Adding new engines
Engines can work pretty much any way you like. The DOMs do not have to follow any specification or guidelines as the interaction between the DOM and cherry itself is limited to passing selector strings to the engine. In theory one use any kind of tree and any kind of string representation of how to walk the tree and match nodes. The input does not need to be HTML. The selectors do not have to be CSS. Be creative.

# Generalizing
The "DOM" can be any kind of graph. The selectors can be any kind of traversal from one group of elements to the next. Maybe the entire graph does not even need to exist locally. Cherry can probably be used to query all sorts of things with the right engine.

