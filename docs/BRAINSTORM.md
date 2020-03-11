* Pipeline different kinds of blocks: 
  * {javascript.something()}
  * 
  * # shell script
  * @attr
  * Array slicing
  * d3 selection
  * GuessType (just primitives or even types from other project)
  * jsfunc(1,2,_,"hej")
  * stop stream early
  * mess with stram structure itself, have blocks that depending on what comes in descides the next block (Proxy + streaming parser?)
  * attribute keys like jsonframe
  * grouping like jsonframe
  * keys as expressive as values
  * > < write to and read from keys
  * _hiddenKeys (simply make nonenumerable)
  * getting and setting values for other keys
  * some plain JS to apply pre/post obj done
  * events for anything happening
  * safe js blocks
  * Sit down and consider pipeline hard before implementing. Should be really easy to use,
  * split/join - if ["$ tr | text"] should return an arr with text of all <tr>, we normally use []. But a "fork" or "split" cmd would be good. 
    * example pipe "$ table | $$ tr | split | $$ td | split | text" -> table as 2d arr
    * | split true | makes any returned arr branch. "split true | $$ tr | $$ td | noop" -> [[td, td, td],[td, td, td]]
    * define in function return if splitting or not. return {split: true, return: ...} vs return ... where something is default
    * splitting could be more complex, returning a tree {k: {k1: {}, k2: {}}} where the pipe continues from every "terminal" () 
  * unix pipe: tee. used to passthrough and write to file. here would be write to key
  * ["$ tr | text"] then becomes equal to "$ tr | split | text"
  * [] makes $ behave differently.. first time.. very odd. We could use $$ instead. or have [] turn $ -> $$ 
  * `{
    title: "$ .title"
    #url: "$ a | attr href"
    _ : {
      ctrl : 'js (meta) => ... newMeta'
      or
      ctrl : 'js fetch({@../})'
      ctrl : 'httpget ../#url | initengine'
      posttext: '$ div .post | text'
    }
  }

  becomes

  {
    title: "interesting post",
    posttext: "bla bla bla"
  }`
  * ordered keys?
* Non insta-close pipes
* Usability/readability
  * Allow iterable rather than Array where possible
  * Async operations (pipes and all) - major rewrite
  * General object mashing
  * Engine can bundle pipe operations
  * Inject engine rather than init/select
  * Keep engines accessiible in meta to switch when needed
  * *Deal with context, $ and meta being passed all the time* IMPORTANT TO MODULARIZE
  * Arrays are underutilized, worst case use {a: [blablablabla]} to show it's a special arr
  * Syntax highlighting for in-string inline js
* Keys:
  * Treat _v or other as fallthrough key (goes down and overwrites/merges with other obj)
    * Stacking {$s {$s {$s, val :}}} -> {val:k} should not be a problem. Getting a 3d arr out should not be a problem
  * More speical keys, see comments in main file
  * Pre/post keys
  * Mutable context. Putting one more $ in the middle should be fine.
  * Navigational keys: {_ : {haha : "literal 1"}} -> {haha: 1}
  * Logic keys:
    * _if: [cond, iftruem iffalse] - basically requires a cherry engine always running so one can check computed stuff - again rip mongodb. Even premade libraries out there.
    * _on: [event, action]
  * # for hidden keys
  * $$ (selectall) - selects many but descends with all selected
    * {$$ : "p", _v: ["$ span"]} gets all spans from all paragraphs in one arr.
    * {$$ : div, widths: "attr width"} // runs pipeline once per div
    * Hunch: might get closer to d3 selections
  * Engine setting key
  * key prefixes for engine
* Modularity
  * Engine/mod should be able to intercept anything and add special keys etc. - *events*. If cherry has powerful enough logic it can be done through something like babel.
  * JSDOM -> Key to exec js on site
* Engines, premade extractors
  * CSSOM
  * HTML
  * (NLP)
  * ARBITRRARY GRAPH WALKING
  * XPATH
  * XML
  * NEO4J INTEGRATION?
  * RDFa, Microdata , ... revive semantic web project
  * Have cherry work on cherry objects, writing an engine for this
  * JSON - using cherry on json APIs

Armed with all these (data/info - remote, language - match patterns on sites "XY is YT yrs old". Then see how that relates to other html and css rules. When building db finding similar sites can be easy, HTML - web, CSS - web). I'm rambling.

* Dynamicness
 * @c
 * pagination - load new site
 * multi-engine running
 * VS iterative...
   * Generate doc
   * use as input
   * new doc
   * ...
   * which is better?

* Strictness
  * Disallow [brackets] when enclosed extractor fragment does not include a selector?
  * Is there a case when we want to use the outer selector (existing context), for example `{$:"p", trimmedText: ['trim'], kidFriendly: ['nobadwords']}` ? This will not currently work. $p here will select a single element.
  * Currently, a non-bracketed selector will return a single selected element, so brackets without selections are useless.
  * Could be remedied by $$ (selectall): `{$$:"p", trimmedText: ['trim'], kidFriendly: ['nobadwords']}`

WEBAPP
  * Webapp to browse plain JSON with cool skins, styles.
  * Share extractors.
  * Run locally, so legal for owner?
  * Chrome/FF plugin to update sites. Can still ping central server who can ping others so we get kinda/push notices.
  * But mostly for myself. Browse all fave sites in terminal.
  * IFTT-style stuff becomes easy

ROFI
  * CLI-use of cherry could be huge for Conky and Rofi.

Saw projects for rendering just one element from a site, p cool, Like: Collect all css rules for this html box and save only that. Less space and like the ultimate screenshot of the web,

We want to index everything about a site instantly. Computed styles, breakpoints, tons of info in html and CSS. Then, find quirks. Then find aliases. Language




CUT FROM ENGINES.md

## [DEV] D3 inspo
Explore integrating something like d3js' enter(), exit() and how that selection lib works. If we can find a simple syntax matching enter/exit, it should be added. Of course a system for visualizing data has good ideas applicable to extracting data. Keyword: Nested selections

## [DEV] The next step
* Leaving json for the schemas?
* Multiple schema types? 
* Add engines for schemas just like we have now for selectors. A desicion-action-based schema would be great.

>Find #header, extract .title, if title is "Foo", proceed using FooExtractor .......

The above can be accomplished using the @c key from the old picky-scrape (@c -> pass context to func that generates schema). But, there exists good libs for this. *MongoDB* certainly has a good declarative pipeline data manipulation style. Research there.

## [DEV] Namespaces
### Hidden keys
Anything written to a key beginning with _ will be stripped from final output. However it can be used in other, visible k-v-pairs.

```
{
  _foo: {
    $: "#foo",
    url: "|attr(href)",
    name: "|text"
    },
    bar: `<a href="${doc._foo.url}">${doc._foo.name} is ugly!</a>`
}
```

Some kind of way to traverse the object being created would be good. How about making it a DOM-like tree as well, where we can go to parent etc.

### [DEV] Namespace
Skip hidden key. Just have a temp namespace to use..

## [DEV] Wishlist
* Engines, libraries and technologies to integrate
  * d3 engine - even a simple one should give insight from using it
  * Sizzle (jQuery project)
  * fb55 - DONE. Respect
  * JSDOM
    * Can do much more by running scripts etc before extraction and having a full-featured DOM/JS API
  * PhantomJS
    * JSDOM squared. Can we introduce clicking and user simulation shit into the extractors? Feature creep into full on automation, machine learning, inference. Let's go.

## [DEV] Loose ideas
* Likely lots of info in the CSS of a site just like in the DOM. See CSSOM in links. Noted for further thinking,
* Metaprogramming ideas.. @c was distinctly meta

# Links/Projects of value
* https://github.com/gahabeen/jsonframe-cheerio - Many good ideas. Grouping etc
* MongoDB
* GraphQL scrapers 
  * https://github.com/syrusakbary/gdom - very cool. traverse and scrape using GraphQL. GQL-inspired schemas are certainly something to look at and has existing infrastructure
  * https://github.com/lachenmayer/graphql-scraper
  * Full search: https://github.com/search?q=graphql+scrape . The GQL schemas are pretty, looking at them and combining wisdom from d3's select(), selectAll(), enter(), join(), exit() should yield results. Combine further with logic in the schemas (@c key in old picky) as plain funcs or operation pipelines ***Hot lead***
* XPath - Trivial to add and good for machine learning intersecting with cheery
* https://github.com/tildeio/selector-generator generates unique selector for an element. take inspiration for ML stuff, this will be needed there.
* https://github.com/dperini/nwmatcher - allows adding selectors and operators? mature. big and well-used.
* https://github.com/jquery/sizzle - Mature. Extensible.
* https://github.com/fb55/css-what
* https://github.com/fb55 - ***NO COMMENT***
* https://github.com/NV/CSSOM - Now we meta
* https://github.com/kdzwinel/SnappySnippet
* https://github.com/xparse/ElementFinder
* https://github.com/search?q=element+css&type=Repositories
 * https://github.com/tomhodgins/element-queries-spec
 * https://github.com/lukehorvat/computed-style-to-inline-style
 * https://github.com/equinusocio/native-elements
 * https://github.com/ericclemmons/unique-selector
 * https://github.com/csuwildcat/SelectorListener
 * https://github.com/timoxley/css-path
 * https://github.com/alexreardon/css-box-model
 * https://github.com/tomhodgins/qss
 * https://github.com/yields/uniq-selector
 * https://github.com/fb55/css-what/blob/master/index.js
 * Imagine how easy grabbing lists like this would be with cherry
* https://github.com/lukehorvat/computed-style-to-inline-style


ML ideas:
CSS/HTML patterns around pieces of data can be found elsewhere and be indicative of the same kind of data being there. Once one has made some cherry pickers and has some data, they can make themselves..