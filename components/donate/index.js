var html = require('choo/html')
var { i18n } = require('../base')

var text = i18n()

var CAN_COPY = typeof window !== 'undefined' && 'execCommand' in document

module.exports = donate
''
function donate (props) {
  return html`
    <div class="Donate u-narrow">
      <h3 class="Donate-title"><span class="Donate-first">${text`Secure our future`}</span> <br/>${text`Make a difference`}</h2>
      <p class="Donate-body">
        ${text`Send money to`}:
        ${CAN_COPY ? html`
          <span>
            <button title="${text`Click to copy`}" class="u-textCopy" onclick="${copy}" data-oncopy="${text`Copied!`}" data-input="swish-article">1236 2121 79</button>
            <input class="u-hiddenVisually" id="swish-article" onkeydown=${preventDefault} readonly value="1236 2121 79" />
          </span>
          </ul>
        ` : html`
          <span class="u-textNowrap">1236 2121 79</span></li>
        `}
      </p>
      <div class="Donate-icon"></div>
    </div>
  `
}

function preventDefault (event) {
  event.preventDefault()
}

function copy (event) {
  var button = event.currentTarget
  var input = document.getElementById(button.dataset.input)

  // play nice with ios
  if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
    let range = document.createRange()

    input.contentEditable = true
    input.readOnly = false
    range.selectNodeContents(input)

    // create selection
    let selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
    input.setSelectionRange(0, input.value.length)

    // reapply default attrs
    input.contentEditable = false
    input.readOnly = true
  } else {
    input.select()
  }

  // execute copy
  document.execCommand('Copy')
  window.setTimeout(() => button.classList.remove('is-active'), 1000)
  button.classList.add('is-active')
}
