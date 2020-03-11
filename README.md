<div align="center" class="panel panel-success">
<img src="https://cdn.jsdelivr.net/npm/twemoji@11.0.1/2/svg/1f352.svg" width="100px" border="0px"></img>
</div>
<div align="center" class="panel panel-success">
<h1 color="red">No longer developed</h1>
</div>

# Cherry
Cherry started life as a scraping library, picky-scrape, similar to [jsonframe-cheerio](https://github.com/gahabeen/jsonframe-cheerio). While it was developed independently, Picky ended up being similar to jsonframes with mainly a few differences in template syntax and depending less on built in functions, instead allowing arrow functions for one-time hacks and user extensions of the function library to support code reuse. Picky was never released to the public as it was not yet polished enough for production use. 

Cherry is not limited to scraping HTML, not limited to using CSS selectors, and not even limited to using a DOM. Unlike jsonframe and picky, cherry does not depend on [cheerio](https://github.com/cheeriojs) or *any one CSS/HTML/DOM library*.

# Design
Cherry loads an engine at startup, see [ENGINES.md](docs/ENGINES.md) for more information. The engine being used defines what cherry becomes. Currently the only one is the HTML/CSS engine *Fb55*. It is named after the developer who created [htmlparser2](https://github.com/fb55/htmlparser2), one of the most useful node.js libraries for data junkies ever created. The Fb55 engine simply wraps htmlparser2 and CSSselect (also maintained by Fb55), which yields a fairly simple JSON-template scraper.

Planned engines and features include XML, XPath, and just about any graph-based document format I can think of. Remote graphs are being considered.

# Extractors
The templates used to obtain structured data from HTML, XML, or whatever the engine used supports are called `Extractors`. They work hieararchically, progressively selecting chunks of the document of interest.

## Usage: Sample extractor
```js
import cherry from 'cherry'

const extractor = [{
  $: "table",                    
  category: "$ caption | text",
  posts: [{
    $:"tr",
    title:"$ .thread-title | text",
    url:"$ a | attr href"
  }]
}]

cherry.pick('html goes here', extractor)
```

### Explanation
* For each - `[]` - \<table\> element - `$: "table"`
  * Extract the text as "category" - `category: "$ caption | text"`
  * For each - `[]` - row - `$: "tr"` - *in the table* (key is on a level above the table selector)
    * Extract the the thread title - `title:"$ .thread-title | text"`
    * Extract the extract the link URL `url:"$ a | attr href"`
