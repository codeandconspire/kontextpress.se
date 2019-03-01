var html = require('choo/html')
var { Elements } = require('prismic-richtext')
var { resolve } = require('../components/base')
var serialize = require('../components/text/serialize')

module.exports = navigation

function navigation (state, emitter) {
  state.referrer = null

  emitter.prependListener('pushState', onnavigate)
  emitter.prependListener('replaceState', onnavigate)

  function onnavigate (href, opts = {}) {
    if (pathname(href) !== state.href) {
      if (!opts.persistScroll) {
        window.requestAnimationFrame(function () {
          window.scrollTo(0, 0)
        })
      }
      state.referrer = state.href
    }
  }

  state.serialize = function (type, element, content, children) {
    if (type === Elements.hyperlink) {
      if (element.data.type === 'article') {
        element = state.prismic.getByUID('article', element.data.uid, function (err, doc) {
          if (err && !doc) return element
          return Object.assign({}, element, { data: doc })
        })
        return serializeHyperlink(element, children)
      }
    }
    return serialize(type, element, content, children)
  }
}

function serializeHyperlink (element, children) {
  var href = resolve(element.data)
  if (element.data.target && element.data.target === '_blank') {
    return html`<a href="${href}" target="_blank" rel="noopener noreferrer">${children}</a>`
  }
  return html`<a href="${href}">${children}</a>`
}

// reduce href to only its pathname
// str -> str
function pathname (href) {
  return href
    .replace(/^https?:\/\/.+?\//, '/')
    .replace(/\?.+$/, '')
    .replace(/\/$/, '')
    .replace(/#.+$/, '')
}
