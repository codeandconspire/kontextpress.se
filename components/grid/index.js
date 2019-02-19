var html = require('choo/html')

module.exports = grid

function grid (opts, children) {
  if (Array.isArray(opts)) {
    children = opts
    opts = {}
  }

  return html`
    <div class="Grid ${opts.carousel ? 'Grid--carousel' : ''}">
      ${children.map(cell)}
    </div>
  `

  function cell (render, index) {
    var attrs = { class: `Grid-cell ${opts.size ? sizes(opts.size) : ''}` }
    if (opts.appear) {
      attrs.class += ' Grid-cell--appear'
      attrs.style = `animation-delay: ${index * 100}ms`
    }

    return html`
      <div ${attrs}>
        ${typeof render === 'function' ? render() : render}
      </div>
    `
  }
}

function sizes (opts) {
  var size = ''
  if (opts.xs) size += `u-size${opts.xs} `
  if (opts.sm) size += `u-sm-size${opts.sm} `
  if (opts.md) size += `u-md-size${opts.md} `
  if (opts.lg) size += `u-lg-size${opts.lg} `
  return size
}
