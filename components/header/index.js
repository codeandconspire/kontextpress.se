var html = require('choo/html')
var Component = require('choo/component')
var { className, i18n } = require('../base')

var text = i18n(require('./lang.json'))

module.exports = class Header extends Component {
  constructor (id, state, emit) {
    super(id)
    this.local = state.components[id] = {
      id: id,
      state: state
    }
  }

  update (links, href, opts) {
    return href !== this.local.href
  }

  load (element) {
    // Quick fix for enabling active states in iOS (forgot how it works…)
    element.addEventListener('touchstart', function () {}, false)
  }

  createElement (href, categories = []) {
    this.local.href = href.replace(/\/$/, '')
    var { state, id } = this.local

    return html`
      <header class="Header" id="${id}">
        <div class="Header-container u-md-container">
          <div class="Header-content">
            <a class="Header-logo" href="/" rel="home">
              <svg class="Header-figure" width="375" height="54" viewBox="0 0 375 54">
                <g fill="currentColor" fill-rule="evenodd">
                  <path d="M.2.9h10.4V26h6.5L32.7.9h11.4L27.9 26.3l17.4 26.3H33.2L17 26.6h-6.4v26H.2V.9M91.3 26.7c0-9-5.1-16.9-16-16.9-10.3 0-15.7 8-15.7 17 0 8.9 4.1 16.9 15.7 16.9 10.6 0 16-8 16-17zm-42 0C49.3 12.5 59 .2 75.3.2c17.4 0 26.2 12.1 26.2 26.5s-9.4 26.6-26.2 26.6c-18.3 0-26-12-26-26.6zM125.7 2.6v50h-10.4V.9h10.2l17 37.8 5.5 12.1V.9h10.4v51.7h-10.3L132.2 17l-6.5-14.4M172 .9h40.7v9.4h-15.4v42.3h-10.4V10.3H172V.9M226.3.9h38.8v9.4h-28.4v15.9h23v.5h-23v16.1h28.4v9.8h-38.8V.9M293.6 25.8L276.9.8h12.3L300.3 18 311.5.8h11.6l-16.6 24.7 17.9 27.1h-12.5l-12-18.8-12.1 18.8h-12l17.8-26.8M334.2.9h40.6v9.4h-15.3v42.3h-10.4V10.3h-14.9V.9"/>
                </g>
              </svg>
            </a>
          </div>

          <nav class="Header-nav" id="${id}-navigation">
            <ul class="Header-list">
              ${categories.map((item) => html`
                <li class="${className('Header-item', { 'is-selected': item.selected })}">
                  <a href="${item.href}" class="Header-text">${item.text}</a>
                </li>
              `)}
              <li class="${className('Header-button Header-end', { 'is-selected': state.href.indexOf('stod-oss') !== -1 })}">
                <a href="/stod-oss" class="Header-text">
                  <svg class="Header-icon" role="presentation" area-hidden="true" viewBox="0 0 11 10">
                    <path class="Header-fill" fill="rgb(var(--theme-color-secondary))" fill-rule="nonzero" d="M5.5 9.375a.542.542 0 0 1-.385-.157L.907 5.004a2.85 2.85 0 0 1 0-4.009 2.838 2.838 0 0 1 4.008 0l.585.585.585-.585a2.838 2.838 0 0 1 4.008 0 2.85 2.85 0 0 1 0 4.009L5.885 9.218a.542.542 0 0 1-.385.157z"/>
                  </svg>${text`Support us`}
                </a>
              </li>
              <li class="${className('Header-text Header-item Header-end Header-hidden', { 'is-selected': state.href.indexOf('om-oss') !== -1 })}">
                <a href="/om-oss" class="Header-text">${text`About us`}</a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    `
  }
}
