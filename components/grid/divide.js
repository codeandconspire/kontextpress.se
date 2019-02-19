var html = require('choo/html')

module.exports = grid

function grid (opts, children) {
  if (Array.isArray(opts)) {
    children = opts
    opts = {}
  }

  return html`
    <div class="Grid Grid--divided ${opts.carousel ? 'Grid--carousel' : ''}">
      ${children.map(cell)}
    </div>
  `

  function cell (render, index) {
    var className = 'Grid-cell'
    if (opts.appear) {
      className.class += ' Grid-cell--appear'
      className.style = `animation-delay: ${index * 100}ms`
    }

    return html`
      <div class="${className}">
        ${typeof render === 'function' ? render() : render}
      </div>
    `
  }
}
