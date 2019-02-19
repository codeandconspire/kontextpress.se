var html = require('choo/html')
var Component = require('choo/component')
var { mail } = require('../symbol')
var { i18n } = require('../base')

var text = i18n(require('./lang.json'))

var URL_ID = `input-${(new Date() % 9e6).toString(36)}`
var CAN_COPY = typeof window !== 'undefined' && 'execCommand' in document

class Share extends Component {
  update (props) {
    return props !== this.props
  }

  afterupdate (element) {
    if (!this.props) return

    element.focus()

    // create a tab black hole
    element.addEventListener('keydown', event => {
      if (event.target === element && event.shiftKey && event.code === 'Tab') {
        event.preventDefault()
      }
    })
    var close = element.querySelector('.js-close')
    close.addEventListener('keydown', event => {
      if (!event.shiftKey && event.code === 'Tab') {
        event.preventDefault()
      }
    })

    // prevent scroll while share dialog is open
    var preventScroll = (event) => event.preventDefault()
    window.addEventListener('wheel', preventScroll, { passive: false })
    window.addEventListener('touchmove', preventScroll, { passive: false })
    this.unload = function () {
      window.removeEventListener('wheel', preventScroll, { passive: false })
      window.removeEventListener('touchmove', preventScroll, { passive: false })
    }
  }

  createElement (props) {
    if (!props) {
      return html`<div class="Share Share--hidden" id="share" hidden></div>`
    }

    var href = props.href.replace(/\/$/, '')
    var uri = encodeURIComponent(href)
    var close = () => this.render(null)
    var description = props.description && props.description.split(' ')
      .reduce(function (short, word) {
        return short + (short.length < 110 ? (' ' + word) : '')
      }, '')

    return html`
      <div class="Share" id="share" tabindex="0">
        <div class="Share-container">
          <div class="Share-body">
            <h2 class="Share-heading">${text`Choose how to share`}</h2>
            <ul class="Share-options">
              <li class="Share-option">
                <a target="_blank" rel="noopener noreferrer" href="${process.env.FACEBOOK_ID ? `https://www.facebook.com/dialog/share?app_id=${process.env.FACEBOOK_ID}&display=page&href=${uri}&redirect_uri=${uri}` : `https://www.facebook.com/sharer.php?u=${uri}`}" class="Share-link">
                  <div class="Share-icon Share-icon--facebook">
                    <svg viewBox="0 0 18 18" width="64" height="64" role="presentation" aria-hidden="true">
                      <g fill="none" fill-rule="evenodd">
                        <path fill="currentColor" fill-rule="nonzero" d="M16.12 17H1.88a.87.87 0 0 1-.88-.88V1.88c0-.49.4-.88.88-.88h14.24c.49 0 .88.4.88.88v14.24c0 .49-.4.88-.88.88zm-4.08 0v-6.2h2.08l.3-2.4h-2.38V6.88c0-.7.2-1.17 1.2-1.17h1.27V3.57c-.61-.07-1.23-.1-1.85-.1-1.85 0-3.1 1.13-3.1 3.2V8.4h-2.1v2.4h2.1V17h2.48z"/>
                      </g>
                    </svg>
                  </div>
                  ${text`Share`}
                </a>
              </li>
              <li class="Share-option">
                <a target="_blank" rel="noopener noreferrer"  href="https://twitter.com/intent/tweet?url=${uri}&text=${encodeURIComponent(props.description)}&${process.env.TWITTER_USERNAME ? `via=${process.env.TWITTER_USERNAME}` : ''}" class="Share-link">
                  <div class="Share-icon Share-icon--twitter">
                    <svg viewBox="0 0 18 15" width="64" height="53" aria-hidden="true">
                      <path fill="currentColor" fill-rule="evenodd" d="M5.66 15c6.8 0 10.5-5.77 10.5-10.77v-.5A7.62 7.62 0 0 0 18 1.8a7.23 7.23 0 0 1-2.12.6A3.8 3.8 0 0 0 17.5.27a7.3 7.3 0 0 1-2.34.92 3.65 3.65 0 0 0-2.7-1.2c-2.04 0-3.7 1.7-3.7 3.8 0 .26.04.55.1.83C5.8 4.5 3.06 2.98 1.26.7c-.3.55-.5 1.2-.5 1.9A3.8 3.8 0 0 0 2.4 5.75a3.6 3.6 0 0 1-1.68-.47v.04C.72 7.16 2 8.7 3.7 9.04A3.62 3.62 0 0 1 2 9.1c.47 1.5 1.83 2.6 3.45 2.63A7.3 7.3 0 0 1 0 13.3 10.27 10.27 0 0 0 5.66 15"/>
                    </svg>
                  </div>
                  ${text`Tweet`}
                </a>
              </li>
              ${props.file ? html`
                <li class="Share-option">
                  <a href="${props.file}" class="Share-link" download>
                    <div class="Share-icon Share-icon--download">
                      D
                    </div>
                    ${text`Download`}
                  </a>
                </li>
              ` : null}
              <li class="Share-option">
                <a href="mailto:?subject=${encodeURIComponent(props.title)}&body=${encodeURIComponent(text`Check this out: ${props.href}`)}" class="Share-link">
                  <div class="Share-icon Share-icon--mail">
                    ${mail()}
                  </div>
                  ${text`Email`}
                </a>
              </li>
            </ul>
            <label class="Share-raw" for="${URL_ID}">
              <input onclick="${select}" class="Share-url" id="${URL_ID}" onkeydown=${preventDefault} readonly value="${href}" />
              <span class="Share-fade"></span>
              ${CAN_COPY ? html`
                <button class="Share-button" onclick="${copy}" data-oncopy="${text`Copied!`}">${text`Copy link`}</button>
              ` : null}
            </label>
          </div>
          <div class="Share-preview">
            ${props.image ? html`
              <img class="Share-thumbnail" src="${props.image}" width="64" height="64" />
            ` : null}
            <div class="Share-meta">
              <h2 class="Share-title">${props.title}</h2>
              ${description ? html`<p class="Share-description">${description}…</p>` : null}
            </div>
          </div>
          <button class="Share-close js-close" onclick="${close}">
            <span class="u-hiddenVisually">${text`Close`}</span>
          </button>
        </div>
      </div>
    `

    function preventDefault (event) {
      event.preventDefault()
    }

    function select (event) {
      event.target.select()
    }

    function copy (event) {
      var button = event.currentTarget
      var input = document.getElementById(URL_ID)

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
      button.addEventListener('transitionend', function ontransitionend () {
        button.removeEventListener('transitionend', ontransitionend)
        window.setTimeout(() => button.classList.remove('is-active'), 1000)
      })
      button.classList.add('is-active')
    }
  }
}

module.exports = new Share()
