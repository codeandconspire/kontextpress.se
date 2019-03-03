var html = require('choo/html')
var { loader } = require('../base')

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
    <div class="Intro ${opts.center ? `Intro--center` : ''} ${opts.narrow ? `Intro--narrow` : ''}">
      ${opts.tagline ? html`<span class="Intro-tagline">${opts.tagline}</span>` : null}
      <h1 class="Intro-title">${opts.title}</h1>
      <div class="Intro-body">${body}</div>
      ${opts.byline ? html`
        <div class="Intro-meta">
          ${opts.byline}
        </div>
      ` : null}
      ${img ? html`
        <figure class="Intro-figure">
          <a class="Intro-imageLink" href="${img.original}">
            <div class="Intro-aspect" style="${aspect}">
              <img class="Intro-image" ${img}>
            </div>
            ${img.caption ? html`<figcaption class="Intro-figcaption">${img.caption}</figcaption>` : null}
          </a>
        </figure>
      ` : null}
    </div>
  `
}

function loading (opts = {}) {
  return html`
    <div class="Intro ${opts.center ? `Intro--center` : ''} ${opts.narrow ? `Intro--narrow` : ''} is-loading">
      ${opts.tagline ? html`<span class="Intro-tagline">${loader(3)}</span>` : null}
      <div class="Intro-title">${loader(3)}</div>
      <div class="Intro-body">${loader(30)}</div>
      ${opts.byline}
      ${opts.image ? html`
        <div class="Intro-figure">
          <div class="Intro-aspect"></div>
        </div>
      ` : null}
    </div>
  `
}
