var assert = require('assert')
var html = require('choo/html')
var raw = require('choo/html/raw')
var Component = require('choo/component')
var error = require('./error')
var Header = require('../header')
var Footer = require('../footer')
var Player = require('../embed/player')
var { i18n, asText, resolve, hexToRgb, HTTPError } = require('../base')

// Quick fix for enabling active states in iOS (forgot how it works…)
if (typeof window !== 'undefined') {
  document.addEventListener('touchstart', function () {}, false)
}

var text = i18n()

var DEFAULT_TITLE = text`SITE_NAME`

module.exports = View

// view constructor doubles as view factory
// if not called with the `new` keyword it will just return a wrapper function
// (str|fn, fn?) -> View|fn
function View (view, meta) {
  if (!(this instanceof View)) return createView(view, meta)
  var id = view
  assert(typeof id === 'string', 'View: id should be type string')
  Component.call(this, id)
  this.createElement = createView(this.createElement, this.meta)
}

View.prototype = Object.create(Component.prototype)
View.prototype.constructor = View
View.prototype.meta = function () {
  throw new Error('View: meta should be implemented')
}
View.createView = createView
View.createClass = createClass

function createClass (Class, id) {
  return function (state, emit) {
    return state.cache(Class, id).render(state, emit)
  }
}

function createView (view, meta) {
  return function (state, emit) {
    var self = this

    return state.prismic.getSingle('website', function (err, doc) {
      var children
      try {
        if (err) throw HTTPError(500, err)
        children = view.call(self, state, emit)
        let next = meta ? meta.call(self, state) : {}

        if (next && next.title && next.title !== DEFAULT_TITLE) {
          next.title = `${next.title} – ${DEFAULT_TITLE}`
        }

        var defaults = {
          title: doc ? asText(doc.data.title) : `${text`Loading`} – ${DEFAULT_TITLE}`,
          description: doc ? asText(doc.data.description) : null,
          'theme-color-primary': state.ui.isLoading ? state.meta['theme-color-primary'] : '#000',
          'theme-color-secondary': state.ui.isLoading ? state.meta['theme-color-secondary'] : '#000'
        }

        if (doc && doc.data.featured_image.url) {
          defaults['og:image'] = doc.data.featured_image.url
          defaults['og:image:width'] = doc.data.featured_image.dimensions.width
          defaults['og:image:height'] = doc.data.featured_image.dimensions.height
        }

        emit('meta', Object.assign(defaults, next))
      } catch (err) {
        err.status = state.offline ? 503 : err.status || 500
        children = error(err)
        emit('meta', { title: `${text`Oops`} – ${DEFAULT_TITLE}` })
      }

      if (doc) {
        var categories = doc.data.categories.map(link).filter(Boolean)
      }

      var primary = state.meta['theme-color-primary']
      var secondary = state.meta['theme-color-secondary']
      primary = (primary && hexToRgb(primary)) || 'var(--theme-color-primary)'
      secondary = (secondary && hexToRgb(secondary)) || 'var(--theme-color-secondary)'

      return html`
        <body class="View" id="view" style="--theme-color-primary: ${primary}; --theme-color-secondary: ${secondary};">
          <script type="application/ld+json">${raw(JSON.stringify(linkedData(state)))}</script>
          ${state.cache(Header, 'header').render(state.href, categories)}
          ${children}
          ${state.cache(Footer, 'footer').render(doc)}
          ${Player.render()}
        </body>
      `

      // format document as schema-compatible linked data table
      // obj -> obj
      function linkedData (state) {
        return {
          '@context': 'http://schema.org',
          '@type': 'Organization',
          name: DEFAULT_TITLE,
          url: state.origin,
          logo: state.origin + '/icon.png'
        }
      }
    })

    // construct menu link
    // obj -> obj
    function link (item) {
      if (!item.link.id || item.link.isBroken) return null
      var href = resolve(item.link)
      return {
        href: href,
        text: item.label || asText(item.link.data.title),
        selected: state.href.indexOf(href) !== -1
      }
    }
  }
}
