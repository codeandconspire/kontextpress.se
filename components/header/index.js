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
              <svg class="Header-figure" viewBox="0 0 479 68"><g fill="currentColor" fill-rule="evenodd"><path d="M14.4393 1.1337V32.4h8.7272L42.5541 1.1337h14.5987L36.5171 33.4703 58.5945 66.888H43.2751L23.157 34.8h-8.7177v32.088H1.1928V1.1337zM117.0782 34.0109c0-11.5297-6.4884-21.5283-20.185-21.5283-13.1564 0-20.095 10.269-20.095 21.5283 0 11.3496 5.2263 21.5276 20.0052 21.5276 13.4264 0 20.2748-10.0883 20.2748-21.5276zm-53.3465 0c0-18.1052 12.2552-33.7777 33.1615-33.7777 21.9874 0 33.2513 15.4024 33.2513 33.7777 0 18.1948-11.9846 33.7776-33.341 33.7776-23.3394 0-33.0718-15.3126-33.0718-33.7776zM160.8747 66.888h-13.2458V1.1337h13.066l28.5655 59.9022V1.1337h13.2465V66.888h-13.0657L160.8747 6.8955zM219.8105 1.1337h51.725v11.9799h-19.5548V66.888h-13.2468V13.1136h-18.9234V1.1337M338.2183 1.1337v11.9799h-36.1347V32.4h29.1968v2.4h-29.1968v19.5675h36.1347V66.888h-49.3819V1.1337zM374.4469 32.8399L353.1796 1.0436h15.6807l14.148 21.8878 14.2355-21.8878h14.6891L390.847 32.4794l22.7969 34.4086h-15.859l-15.3178-23.9598-15.4117 23.9598h-15.2271l22.6186-34.0481M426.0809 1.1337h51.7279v11.9799h-19.5563V66.888h-13.2472V13.1136h-18.9244V1.1337"/></g></svg>
            </a>
          </div>

          <nav class="Header-nav" id="${id}-navigation">
            <ul class="Header-list">
              ${categories.map((item) => html`
                <li class="${className('Header-item', { 'is-selected': item.selected })}">
                  <a href="${item.href}" class="Header-link"><span class="Header-text">${item.text}</span></a>
                </li>
              `)}
              <li class="${className('Header-button Header-end', { 'is-selected': state.href.indexOf('stod-oss') !== -1 })}">
                <a href="/stod-oss" class="Header-link">
                  <svg class="Header-icon" role="presentation" area-hidden="true" viewBox="0 0 11 10">
                    <path class="Header-fill" fill="currentColor" fill-rule="nonzero" d="M5.5 9.375a.542.542 0 0 1-.385-.157L.907 5.004a2.85 2.85 0 0 1 0-4.009 2.838 2.838 0 0 1 4.008 0l.585.585.585-.585a2.838 2.838 0 0 1 4.008 0 2.85 2.85 0 0 1 0 4.009L5.885 9.218a.542.542 0 0 1-.385.157z"/>
                  </svg><span class="Header-text">${text`Support us`}</span>
                </a>
              </li>
              <li class="${className('Header-item Header-end Header-hidden', { 'is-selected': state.href.indexOf('om-oss') !== -1 })}">
                <a href="/om-oss" class="Header-link"><span class="Header-text">${text`About us`}</span></a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    `
  }
}
