var html = require('choo/html')
var Component = require('choo/component')

module.exports = class Footer extends Component {
  constructor (id, state, emit) {
    super(id)
    this.state = state
    this.local = state.components[id] = { id: id }
  }

  update (doc) {
    return !this.local.doc && doc
  }

  createElement (doc) {
    this.local.doc = doc
    if (!doc) return html`<footer class="u-container"></footer>`
    return html`
      <footer class="u-container">
        <div class="Footer">

        </div>
      </footer>
    `
  }
}
