var html = require('choo/html')
var { loader, pluck } = require('../base')

module.exports = intro
module.exports.loading = loading

function intro (opts = {}) {
  var body = opts.body
  var img = opts.image
  var aspect = null

  if (typeof window === 'undefined') {
    if (Array.isArray(body) || body[0] === '<') html`<div>${body}</div>`
    else body = html`<p>${body}</p>`
  } else if (Array.isArray(body) || body instanceof window.Element) {
    body = html`<div>${body}</div>`
  } else {
    body = html`<p>${body}</p>`
  }

  if (img && img.width && img.height) {
    aspect = `--Intro-figure-aspect: ${100 * img.height / img.width}%;`
  }

  return html`
    <div class="Intro ${opts.align ? `Intro--${opts.align}` : ''}">
      ${opts.tagline ? html`<span class="Intro-tagline">${opts.tagline}</span>` : null}
      <h1 class="Intro-title">${opts.title}</h1>
      <div class="Intro-body">${body}</div>
      ${opts.byline ? byline(opts.byline) : null}
      ${img ? html`
        <div class="Intro-figure">
          <div class="Intro-aspect" style="${aspect}">
            <img class="Intro-image" ${img}>
          </div>
        </div>
      ` : null}
    </div>
  `
}

function loading (opts = {}) {
  return html`
    <div class="Intro ${opts.align ? `Intro--${opts.align}` : ''} is-loading">
      ${opts.tagline ? html`<span class="Intro-tagline">${loader(4)}</span>` : null}
      <div class="Intro-title">${loader(8)}</div>
      <div class="Intro-body">${loader(60)}</div>
      ${opts.byline ? html`
        <div class="Intro-byline">
          <span class="Intro-thumbnail">
            <span class="u-loading u-cover u-round"></span>
          </span>
          ${loader(10)}
        </div>
      ` : loader(6)}
      ${opts.image ? html`
        <div class="Intro-figure">
          <div class="Intro-aspect"></div>
        </div>
      ` : null}
    </div>
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
    <figure class="Intro-byline">
      ${props.image ? html`<img class="Intro-thumbnail" ${attrs} src="${props.image.src}">` : null}
      <figcaption>${props.text}</figcaption>
    </figure>
  `
}
