var html = require('choo/html')
var Component = require('choo/component')
var { i18n } = require('../base')

var text = i18n()

var CAN_COPY = typeof window !== 'undefined' && 'execCommand' in document

module.exports = class Footer extends Component {
  constructor (id, state, emit) {
    super(id)
    this.state = state
    this.local = state.components[id] = { id: id }
  }

  update (doc) {
    return !this.local.doc && doc
  }

  load (element) {
    // Quick fix for enabling active states in iOS (forgot how it works…)
    element.addEventListener('touchstart', function () {}, false)
  }

  createElement (doc) {
    this.local.doc = doc
    if (!doc) return html`<footer class="Footer"></footer>`
    return html`
      <footer class="Footer">
        <div class="Footer-container u-container">
          <div class="Footer-col">
            <h2 class="Footer-title">Kontakt</h2>
            <ul class="Footer-list">
              <li class="Footer-item"><a class="Footer-link u-textNowrap" href="mailto:info@kontextpress.se">info@kontextpress.se</a></li>
              <li class="Footer-item"><a class="Footer-link" href="/redaktionen">Kontakta redaktionen</a></li>
            </ul>
          </div>
          <div class="Footer-col">
            <h2 class="Footer-title">Stöd oss</h2>
            <ul class="Footer-list">
              ${CAN_COPY ? html`
                <ul class="Footer-list">
                  <li class="Footer-item">Bankgiro: <button title="${text`Click to copy`}" class="u-textCopy" onclick="${copy}" data-oncopy="${text`Copied!`}" data-input="bankgiro-footer">5347-1249</button>
                    <input class="u-hiddenVisually" id="bankgiro-footer" onkeydown=${preventDefault} readonly value="5347-1249" /></li>
                  <li class="Footer-item">Swish: <button title="${text`Click to copy`}" class="u-textCopy" onclick="${copy}" data-oncopy="${text`Copied!`}" data-input="swish-footer">1236 2121 79</button>
                    <input class="u-hiddenVisually" id="swish-footer" onkeydown=${preventDefault} readonly value="1236 2121 79" /></li>
                  <li class="Footer-item"><a class="Footer-link" href="/stod-oss">Vår finansering</a></li>
                </ul>
              ` : html`
                <ul class="Footer-list">
                  <li class="Footer-item">Bankgiro: <span class="u-textNowrap">5347-1249</span></li>
                  <li class="Footer-item">Swish: <span class="u-textNowrap">1236 2121 79</span></li>
                  <li class="Footer-item"><a class="Footer-link" href="/stod-oss">Vår finansering</a></li>
                </ul>
              `}
            </ul>
          </div>
          <div class="Footer-col">
            <h2 class="Footer-title">Var uppdaterad</h2>
            <ul class="Footer-list">
              <li class="Footer-item"><a class="Footer-link" target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/kontextpress/">Följ på Instagram</a></li>
              <li class="Footer-item"><a class="Footer-link" target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/kontextpress">Gilla på Facebook</a></li>
              <li class="Footer-item"><a class="Footer-link" target="_blank" rel="noopener noreferrer" href="https://twitter.com/kontextpress">Följ på Twitter</a></li>
            </ul>
          </div>
          <div class="Footer-col">
            <h2 class="Footer-title">Kontext Press</h2>
            <ul class="Footer-list">
              <li class="Footer-item"><a class="Footer-link" href="/om-oss">Om oss</a></li>
              <li class="Footer-item"><a class="Footer-link" href="/redaktionen">Redaktionen</a></li>
            </ul>
          </div>
          <div class="Footer-col">
            <h2 class="Footer-title">Övrigt</h2>
            <ul class="Footer-list">
              <li class="Footer-item"><a class="Footer-link" href="/cookies">Om cookies</a></li>
            </ul>
          </div>
          <div class="Footer-col Footer-move">
            <h2 class="Footer-title">Ansvarig utgivare</h2>
            <ul class="Footer-list">
              <li class="Footer-item"><a class="Footer-link" href="/mireya">Mireya Echeverría Quezada</a></li>
            </ul>
          </div>
          <a class="Footer-logo" href="/" rel="home" title="Till startsidan">
            <svg class="Footer-figure" viewBox="0 0 479 68"><g fill="currentColor" fill-rule="evenodd"><path d="M14.4393 1.1337V32.4h8.7272L42.5541 1.1337h14.5987L36.5171 33.4703 58.5945 66.888H43.2751L23.157 34.8h-8.7177v32.088H1.1928V1.1337zM117.0782 34.0109c0-11.5297-6.4884-21.5283-20.185-21.5283-13.1564 0-20.095 10.269-20.095 21.5283 0 11.3496 5.2263 21.5276 20.0052 21.5276 13.4264 0 20.2748-10.0883 20.2748-21.5276zm-53.3465 0c0-18.1052 12.2552-33.7777 33.1615-33.7777 21.9874 0 33.2513 15.4024 33.2513 33.7777 0 18.1948-11.9846 33.7776-33.341 33.7776-23.3394 0-33.0718-15.3126-33.0718-33.7776zM160.8747 66.888h-13.2458V1.1337h13.066l28.5655 59.9022V1.1337h13.2465V66.888h-13.0657L160.8747 6.8955zM219.8105 1.1337h51.725v11.9799h-19.5548V66.888h-13.2468V13.1136h-18.9234V1.1337M338.2183 1.1337v11.9799h-36.1347V32.4h29.1968v2.4h-29.1968v19.5675h36.1347V66.888h-49.3819V1.1337zM374.4469 32.8399L353.1796 1.0436h15.6807l14.148 21.8878 14.2355-21.8878h14.6891L390.847 32.4794l22.7969 34.4086h-15.859l-15.3178-23.9598-15.4117 23.9598h-15.2271l22.6186-34.0481M426.0809 1.1337h51.7279v11.9799h-19.5563V66.888h-13.2472V13.1136h-18.9244V1.1337"/></g></svg>
            <span class="Footer-copy">© Kontext Press</span>
          </a>
          <div class="Footer-credit">
            <p>Teknik & design <a class="Footer-link Footer-cc" title="Gå till codeandconspire.com" href="https://www.codeandconspire.com/" target="_blank" rel="noopener noreferrer"><span class="u-hiddenVisually">Code and conspire</span><svg class="Footer-figure" role="presentation" area-hidden="true" viewBox="0 0 172 69"><path fill="currentColor" d="M29.24 4.58H4.8v59.4h43.18V23.22H29.24V4.58zm4.58 3.22v10.85h10.91L33.83 7.8zM.21.02h32.27L52.55 20v48.55H.2V.02zm10.1 35.15l14.98 6.99v3.82l-14.98 7.61v-5.01l9.94-4.51-9.94-3.89v-5.01zm61.57 5.87c-4.42 0-7.68-2.88-7.68-7.31s3.26-7.32 7.68-7.32c1.95 0 3.5.48 5 1.34l-1.86 3.6a5.08 5.08 0 0 0-2.93-.83c-1.8 0-3.37 1.16-3.37 3.2 0 2.06 1.58 3.22 3.37 3.22 1.23 0 2.1-.3 2.93-.83l1.85 3.6a9.55 9.55 0 0 1-4.99 1.33zM84.8 26.41c4.49 0 7.77 2.92 7.77 7.32s-3.28 7.31-7.77 7.31c-4.45 0-7.74-2.91-7.74-7.31 0-4.4 3.29-7.32 7.74-7.32zm0 4.1a3.1 3.1 0 0 0-3.22 3.22 3.1 3.1 0 0 0 3.22 3.2 3.08 3.08 0 0 0 3.23-3.2c0-1.97-1.4-3.21-3.23-3.21zm15.57 10.53c-3.58 0-6.54-2.5-6.54-7.31 0-4.82 2.96-7.32 6.54-7.32 2.24 0 3.65.93 4.51 2.32h.06v-7.85h4.52V40.6h-4.52v-1.88h-.06c-.86 1.4-2.27 2.32-4.5 2.32zm1.26-4.1c1.82 0 3.2-1.25 3.2-3.21a3.06 3.06 0 0 0-3.2-3.21 3.05 3.05 0 0 0-3.17 3.2 3.05 3.05 0 0 0 3.17 3.22zm16.74-10.5c4.15 0 6.84 2.38 6.84 7.35v1h-9.89c.3 1.73 1.67 2.5 3.53 2.5 1.67 0 3.13-.68 4-1.24l1.64 3.39c-1.46.89-3.34 1.6-5.7 1.6-4.64 0-7.71-2.88-7.71-7.25 0-4.64 3.04-7.35 7.29-7.35zm-.15 3.18c-1.53 0-2.66.75-2.87 2.53h5.5c-.06-1.6-1.17-2.53-2.63-2.53zM71.88 62.2c-4.42 0-7.68-2.88-7.68-7.31s3.26-7.32 7.68-7.32c1.95 0 3.5.48 5 1.34l-1.86 3.6a5.08 5.08 0 0 0-2.93-.83c-1.8 0-3.37 1.16-3.37 3.2 0 2.06 1.58 3.22 3.37 3.22 1.23 0 2.1-.3 2.93-.83l1.85 3.6a9.55 9.55 0 0 1-4.99 1.33zM84.8 47.57c4.49 0 7.77 2.92 7.77 7.32s-3.28 7.31-7.77 7.31c-4.45 0-7.74-2.91-7.74-7.31 0-4.4 3.29-7.32 7.74-7.32zm0 4.1a3.1 3.1 0 0 0-3.22 3.22 3.1 3.1 0 0 0 3.22 3.2 3.08 3.08 0 0 0 3.23-3.2c0-1.97-1.4-3.21-3.23-3.21zm18.36-4.1c3.05 0 5.2 1.76 5.2 5.68v8.5h-4.49V54.5c0-2.05-.86-2.97-2.54-2.97-1.52 0-2.66.89-2.66 3.33v6.9h-4.5V48.02h4.41v2.08h.06a5.09 5.09 0 0 1 4.52-2.53zm12.58 14.63c-1.82 0-4.15-.39-6.24-1.43l1.7-3.68c1.5.86 3.2 1.57 4.9 1.57.8 0 1.26-.18 1.26-.62 0-.54-.54-.63-.96-.8l-2.42-.96c-2.27-.86-3.38-2.2-3.38-4.25 0-2.82 1.95-4.46 5.92-4.46 1.55 0 3.23.27 5 .84l-1.26 3.62a12.07 12.07 0 0 0-4.1-1c-.9 0-1.1.23-1.1.59 0 .41.36.6 1.04.86l2.4.9c2.08.76 3.34 1.86 3.34 4.18 0 3.27-2.42 4.64-6.1 4.64zm7.8 5.5V48.02h4.52v1.87h.06c.86-1.4 2.3-2.32 4.5-2.32 3.6 0 6.55 2.5 6.55 7.32 0 4.81-2.96 7.31-6.54 7.31-2.21 0-3.65-.92-4.51-2.32h-.06v7.82h-4.52zm7.83-9.6c1.8 0 3.17-1.25 3.17-3.21a3.05 3.05 0 0 0-3.17-3.21 3.06 3.06 0 0 0-3.2 3.2 3.06 3.06 0 0 0 3.2 3.22zm9.42 3.66V48.02h4.51v13.74h-4.5zm16-14.16v4.5h-.4c-3.01 0-4.24 1.1-4.24 4.6v5.06h-4.5V48.02h4.41v2.8h.06c.81-2.27 2.4-3.22 4.58-3.22h.09zm8.21 0c4.16 0 6.85 2.38 6.85 7.35v1h-9.9c.3 1.73 1.68 2.5 3.53 2.5 1.68 0 3.14-.68 4-1.24l1.65 3.39c-1.46.89-3.35 1.6-5.7 1.6-4.64 0-7.72-2.88-7.72-7.25 0-4.64 3.05-7.35 7.3-7.35zm-.15 3.18c-1.52 0-2.66.75-2.86 2.53h5.5c-.07-1.6-1.17-2.53-2.64-2.53zm-14.7-18.97a41.07 41.07 0 0 1-3.22 4.83l-.04.05 2.97 3.99h-4.97l-.9-1.23-.08.05a9.29 9.29 0 0 1-5.38 1.61c-4.67 0-7.66-2.5-7.66-6.97 0-2.99 1.63-5.3 4.44-6.14l.1-.03-.05-.1a6.08 6.08 0 0 1-.77-2.9c0-2.64 1.83-4.18 5.25-4.18 1.48 0 3.14.3 4.77.81l-1.09 3.64c-1.4-.44-2.32-.65-3.06-.65-.9 0-1.35.35-1.35 1.08 0 .43.2.85.63 1.45l4.53 6.05.08.1.07-.1c.66-.91 1.34-2 2.18-3.44l3.55 2.08zm-11.71 5.15c1.04 0 1.99-.28 2.91-.83l.09-.05-3.72-4.94-.1-.03c-1.48.37-2.43 1.45-2.43 2.88 0 1.84 1.28 2.97 3.25 2.97zM24.64 54.37h17.34v4.56H24.64v-4.56z" /></svg></a></p>
          </div>
        </div>
      </footer>
    `
  }
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
