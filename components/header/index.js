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
          <a class="Header-logo" href="/" rel="home">

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
