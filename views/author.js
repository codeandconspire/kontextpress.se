var html = require('choo/html')
var parse = require('date-fns/parse')
var format = require('date-fns/format')
var { sv } = require('date-fns/locale/sv')
var asElement = require('prismic-element')
var { Predicates } = require('prismic-javascript')
var view = require('../components/view')
var card = require('../components/card')
var grid = require('../components/grid')
var intro = require('../components/intro')
var serialize = require('../components/text/serialize')
var { asText, srcset, resolve, i18n } = require('../components/base')

var text = i18n()

module.exports = view(author, meta)

function author (state, emit) {
  return html`
    <main class="View-main">
      ${state.prismic.getByUID('author', state.params.author, function (err, doc) {
        if (err) throw err
        if (!doc) {
          return html`
            <div class="u-container">
              <div class="View-spaceLarge">
                ${intro.loading({
                  align: 'center',
                  narrow: true,
                  image: true
                })}
              </div>
            </div>
          `
        }

        var props = {
          align: 'center',
          title: asText(doc.data.title),
          body: asElement(doc.data.description, resolve, serialize),
          narrow: true
        }

        if (doc.data.image.url) {
          let sources = srcset(doc.data.image.url, [400, 600, 900, [1800, 'q_50']])
          props.image = Object.assign({
            alt: doc.data.image_caption || doc.data.image.alt,
            sizes: '(min-width: 900px) 900px, 100vw',
            srcset: sources,
            src: sources.split(' ')[0]
          }, doc.data.image.dimensions)
        }

        return html`
          <article class="u-container">
            <header class="View-spaceLarge">
              ${intro(props)}
            </header>
            <div class="Text"></div>
          </article>
        `
      })}
    </main>
  `
}

function meta (state) {
  return state.prismic.getByUID('author', state.params.author, function (err, doc) {
    if (err) throw err
    if (!doc) return null
    var props = {
      title: asText(doc.data.title),
      description: asText(doc.data.description)
    }

    var image = doc.data.featured_image
    if (!image.url) image = doc.data.image
    if (image.url) {
      props['og:image'] = image.url
      props['og:image:width'] = image.dimensions.width
      props['og:image:heigh'] = image.dimensions.height
    }

    return props
  })
}
