var assert = require('assert')
var html = require('choo/html')
var link = require('./link')
var figure = require('./figure')
var { luma, hexToRgb, className, snippet, pluck, loader } = require('../base')

module.exports = card
card.loading = loading

function card (props = {}, slot) {
  var fill = props.color || null
  assert(!fill || /^#/.test(fill), 'Card: props.color should be hex string color code')

  var body = props.body
  if (body) {
    if (typeof window === 'undefined') {
      if (Array.isArray(body) || body[0] === '<') html`<div class="Card-text">${body}</div>`
      else body = html`<p class="Card-text">${snippet(body, props.truncate || 170)}</p>`
    } else if (Array.isArray(body) || body instanceof window.Element) {
      body = html`<div class="Card-text">${body}</div>`
    } else {
      body = html`<p class="Card-text">${snippet(body, props.truncate || 170)}</p>`
    }
  }

  if (props.link) {
    props.link.block = true
    if (fill) props.link.silent = true
    if (fill) props.link.inherit = true
  }

  var attrs = {
    class: className('Card', {
      'Card--interactive': props.link,
      'Card--dark': props.background || (fill && luma(fill) < 185),
      'Card--fill': fill || props.background,
      'Card--background': props.background
    })
  }
  if (fill) attrs.style = `--Card-background-color: ${hexToRgb(fill)}`

  var cover = null
  if (slot) {
    cover = typeof slot === 'function' ? slot() : slot
  } else if (props.image) {
    cover = figure(Object.assign({ background: props.background }, props.image))
  }

  return html`
    <article ${attrs}>
      ${cover}
      <div class="Card-content ${fill ? 'u-hoverTriggerTarget' : ''}">
        <div class="Card-body">
          ${props.date && props.date.text ? html`
            <time class="Card-meta" datetime="${JSON.stringify(props.date.datetime).replace(/"/g, '')}">
              ${props.date.text}
            </time>
          ` : null}
          <h3 class="Card-title">${props.title}</h3>
          ${body}
          ${props.byline ? byline(props.byline) : null}
        </div>
        ${props.link ? link(Object.assign({ inherit: props.background }, props.link)) : null}
      </div>
    </article>
  `
}

// render byline
// obj -> Element
function byline (props) {
  if (props.image) {
    var attrs = pluck(props.image, 'width', 'height', 'srcset', 'sizes', 'alt')
    attrs.alt = attrs.alt || ''
  }

  return html`
    <figure class="Card-byline">
      ${props.image ? html`<img class="Card-thumbnail" ${attrs} src="${props.image.src}">` : null}
      <figcaption>${props.text}</figcaption>
    </figure>
  `
}

function loading (props = {}) {
  return html`
    <article class="Card">
      ${figure.loading()}
      <div class="Card-content">
        <div class="Card-body">
          ${props.date ? html`<time class="Card-meta">${loader(8)}</time>` : null}
          <h3 class="Card-title">${loader(8)}</h3>
          <p class="Card-text">${loader(24)}</p>
        </div>
      </div>
    </article>
  `
}
