var html = require('choo/html')
var { i18n } = require('../base')

var text = i18n()

module.exports = blurb

function blurb (props) {
  return html`
    <div class="Blurb u-aspect1-1">
      <div class="Blurb-content u-cover">
        <div class="Text">
          <h3 class="u-spaceT1">${props.title}</h3>
          ${props.content}
          <svg class="Blurb-icon" viewBox="0 0 36 23">
            <g fill="none" fill-rule="evenodd" stroke="#FFF">
              <path d="M.756 11.5h33.275"/>
              <path stroke-width="3" d="M27.429 22l6.784-10.5L27.429 1"/>
            </g>
          </svg>
        </div>
        <a class="Blurb-link" href="${props.href}">
          <span class="u-hiddenVisually">${text`Go to page`}</span>
        </a>
      </div>
    </div>
  `
}
