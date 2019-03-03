var assert = require('assert')
var html = require('choo/html')
var link = require('./link')
var figure = require('./figure')
var { luma, hexToRgb, className, snippet, loader } = require('../base')

module.exports = card
card.loading = loading

function card (props = {}, slot) {
  var color = props.color || null
  assert(!color || /^#/.test(color), 'Card: props.color should be hex string color code')

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
    if (color && props.format !== 'horizontal') {
      props.link.silent = true
      props.link.inherit = true
    }
  }

  var hasBackground = props.format !== 'horizontal' && (color || props.background)
  var attrs = {
    class: className('Card', {
      [`Card--${props.format}`]: props.format,
      'Card--reverse': props.reverse,
      'Card--interactive': props.link,
      'Card--dark': props.background || (color && luma(color) < 185),
      'Card--fill': hasBackground,
      'Card--background': props.background
    })
  }
  if (color) {
    attrs.style = `--Card-theme-color: ${hexToRgb(color)}`
  }

  var cover = null
  if (slot) {
    cover = typeof slot === 'function' ? slot() : slot
  } else if (props.image) {
    cover = figure(Object.assign({ background: props.background }, props.image))
  }

  return html`
    <article ${attrs}>
      ${cover}
      <div class="Card-content ${hasBackground ? 'u-hoverTriggerTarget' : ''}">
        <div class="Card-body">
          ${props.date && props.date.text ? html`
            <time class="Card-meta" datetime="${JSON.stringify(props.date.datetime).replace(/"/g, '')}">
              ${props.date.text}
            </time>
          ` : null}
          <h3 class="Card-title">
            ${props.type ? html`
              <span><span class="Card-type">${props.type}:</span> ${props.title}</span>
            ` : props.title}
          </h3>
          ${body}
          ${props.byline ? html`
            <div class="Card-footer">
              ${props.byline}
            </div>
          ` : null}
        </div>
        ${props.link ? link(Object.assign({ inherit: props.background }, props.link)) : null}
      </div>
    </article>
  `
}

function loading (props = {}) {
  return html`
    <article class="${className('Card', { [`Card--${props.format}`]: props.format, 'Card--reverse': props.reverse })}">
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
