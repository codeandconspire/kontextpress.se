var html = require('choo/html')
var { i18n } = require('../base')

var text = i18n()

module.exports = blurb

function blurb (props) {
  return html`
    <div class="Blurb">
      <h2 class="Blurb-title">${props.title}</h2>
      <div class="Text">${props.content}</div>
      <a class="Blurb-link" href="${props.href}">
        <span class="u-hiddenVisually">${text`Go to page`}</span>
      </a>
    </div>
  `
}
