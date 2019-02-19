var html = require('choo/html')
var Component = require('choo/component')
var symbol = require('../symbol')
var { className, i18n, vh } = require('../base')

var text = i18n(require('./lang.json'))
var preventScroll = (event) => event.preventDefault()

module.exports = class Header extends Component {
  constructor (id, state, emit) {
    super(id)
    this.local = state.components[id] = {
      id: id,
      size: 1,
      isOpen: false
    }

    var self = this
    this.toggle = function (next = !self.local.isOpen) {
      self.local.isOpen = next
      emit('header:toggle', next)
      self.rerender()
      window.requestAnimationFrame(function () {
        self.element.querySelector('.js-toggle').focus()
      })

      if (self.local.isOpen) {
        window.addEventListener('wheel', preventScroll, { passive: false })
        window.addEventListener('touchmove', preventScroll, { passive: false })
      } else {
        window.removeEventListener('wheel', preventScroll, { passive: false })
        window.removeEventListener('touchmove', preventScroll, { passive: false })
      }
    }
  }

  update (links, href, opts) {
    if (href !== this.local.href) {
      window.removeEventListener('wheel', preventScroll, { passive: false })
      window.removeEventListener('touchmove', preventScroll, { passive: false })
      this.local.isOpen = false
      return true
    }
    return false
  }

  createElement (href, categories = [], shortcuts = []) {
    this.local.href = href.replace(/\/$/, '')

    var { id, isOpen } = this.local
    var toggle = (event) => {
      this.toggle()
      event.preventDefault()
    }

    return html`
      <header class="${className('Header', { 'is-open': isOpen })}" id="${id}">
        <div class="Header-content u-container">
          <a href="/" rel="home">
            <svg class="Header-logo" width="375" height="54" viewBox="0 0 375 54">
              <g fill="currentColor" fill-rule="evenodd">
                <path d="M.2.9h10.4V26h6.5L32.7.9h11.4L27.9 26.3l17.4 26.3H33.2L17 26.6h-6.4v26H.2V.9M91.3 26.7c0-9-5.1-16.9-16-16.9-10.3 0-15.7 8-15.7 17 0 8.9 4.1 16.9 15.7 16.9 10.6 0 16-8 16-17zm-42 0C49.3 12.5 59 .2 75.3.2c17.4 0 26.2 12.1 26.2 26.5s-9.4 26.6-26.2 26.6c-18.3 0-26-12-26-26.6zM125.7 2.6v50h-10.4V.9h10.2l17 37.8 5.5 12.1V.9h10.4v51.7h-10.3L132.2 17l-6.5-14.4M172 .9h40.7v9.4h-15.4v42.3h-10.4V10.3H172V.9M226.3.9h38.8v9.4h-28.4v15.9h23v.5h-23v16.1h28.4v9.8h-38.8V.9M293.6 25.8L276.9.8h12.3L300.3 18 311.5.8h11.6l-16.6 24.7 17.9 27.1h-12.5l-12-18.8-12.1 18.8h-12l17.8-26.8M334.2.9h40.6v9.4h-15.3v42.3h-10.4V10.3h-14.9V.9"/>
              </g>
            </svg>
          </a>
          <a
            class="${className('Header-button js-toggle', { 'Header-button--close': isOpen })}"
            href="#${isOpen ? '' : id}"
            role="button"
            draggable="false"
            onclick="${toggle}"
            aria-controls="${id}-navigation"
            aria-expanded="${isOpen ? 'true' : 'false'}">
            <div class="${className('Header-burger', { 'Header-burger--cross': isOpen })}">
              <div class="Header-beanPatty"></div>
            </div>
            <span class="Header-text">
              <span class="u-hiddenVisually">${isOpen ? text`Hide menu` : text`Show menu`}</span>
              ${isOpen ? text`Close` : text`Menu`}
            </span>
          </a>
          <a class="Header-button Header-button--noscript Header-button--close" href="#" role="button">
            <div class="Header-burger Header-burger--cross">
              <div class="Header-beanPatty"></div>
            </div>
            <span class="Header-text">
              <span class="u-hiddenVisually">${text`Hide menu`}</span>
              ${text`Close`}
            </span>
          </a>

          <strong class="u-hiddenVisually">${text`Menu`}</strong>
          <nav class="Header-nav" style="${isOpen ? `max-height: ${vh()}px` : ''}" id="${id}-navigation">
            <ul class="Header-list">
              ${categories.map((item) => html`
                <li class="${className('Header-item', { 'is-selected': item.selected })}">
                  <a href="${item.href}" class="Header-text">
                    ${item.text}
                  </a>
                </li>
              `)}
            </ul>
          </nav>
        </div>
      </header>
    `
  }
}
