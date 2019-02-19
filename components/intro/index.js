var html = require('choo/html')
var { i18n } = require('../base')

var text = i18n()

module.exports = intro
module.exports.loading = loading

function intro (opts = {}) {
  var body = opts.body
  if (typeof window === 'undefined') {
    if (Array.isArray(body) || body[0] === '<') html`<div>${body}</div>`
    else body = html`<p>${body}</p>`
  } else if (Array.isArray(body) || body instanceof window.Element) {
    body = html`<div>${body}</div>`
  } else {
    body = html`<p>${body}</p>`
  }

  return html`
    <div class="Intro ${opts.secondary ? 'Intro--secondary' : ''}">
      <h1 class="Intro-title">${opts.title}</h1>
      <div class="Intro-body">
        ${body}
      </div>
    </div>
  `
}

function loading (opts = {}) {
  return html`
    <div class="Intro ${opts.secondary ? 'Intro--secondary' : ''}">
      <h1 class="Intro-title">
        <span class="u-loading${opts.adaptive ? 'Adaptive' : ''}">${text`LOADING_TEXT_SHORT`}</span>
      </h1>
      <p class="Intro-body"><span class="u-loading${opts.adaptive ? 'Adaptive' : ''}">${text`LOADING_TEXT_LONG`}</span></p>
    </div>
  `
}
