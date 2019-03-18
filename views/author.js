var html = require('choo/html')
var asElement = require('prismic-element')
var view = require('../components/view')
var intro = require('../components/intro')
var { asText, srcset, resolve, HTTPError } = require('../components/base')

module.exports = view(author, meta)

function author (state, emit) {
  return html`
    <main class="View-main">
      ${state.prismic.getByUID('author', state.params.author, function (err, doc) {
        if (err) throw HTTPError(404, err)
        if (!doc) {
          return html`
            <div class="u-container">
              <div class="View-pushDown">
                ${intro.loading({
                  center: true,
                  narrow: true,
                  image: true
                })}
              </div>
            </div>
          `
        }

        var props = {
          center: true,
          title: asText(doc.data.title),
          body: doc.data.email ? html`<a href="mailto:${doc.data.email}">${doc.data.email}</a>` : null,
          narrow: true
        }

        if (doc.data.image.url) {
          let sources = srcset(doc.data.image.url, [400, 600, 900, [1600, 'q_60'], [2200, 'q_60']])
          props.image = Object.assign({
            alt: doc.data.image_caption || doc.data.image.alt,
            caption: doc.data.image_caption,
            sizes: '(min-width: 65rem) 65rem, 100vw',
            srcset: sources,
            src: sources.split(' ')[0],
            original: doc.data.image.url
          }, doc.data.image.dimensions)
        }

        return html`
          <article class="u-container">
            <header class="View-pushDown">
              ${intro(props)}
            </header>
            ${doc.data.body ? html`
              <div class="Text Text--article">
                ${asElement(doc.data.body, resolve, state.serialize)}
              </div>
            ` : null}
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
