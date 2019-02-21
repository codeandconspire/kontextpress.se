var html = require('choo/html')
var asElement = require('prismic-element')
var view = require('../components/view')
var intro = require('../components/intro')
var serialize = require('../components/text/serialize')
var { asText, resolve, srcset } = require('../components/base')

module.exports = view(page, meta)

function page (state, emit) {
  return html`
    <main class="View-main">
      <div class="u-container">
        ${state.prismic.getByUID('page', state.params.wildcard, (err, doc) => {
          if (err) throw err
          if (!doc) {
            return html`
              <div class="u-container">
                <div class="View-pushDown">
                  ${intro.loading({
                    center: true,
                    image: true
                  })}
                </div>
              </div>
            `
          }

          var props = {
            center: true,
            title: asText(doc.data.title),
            body: asElement(doc.data.description, resolve, serialize)
          }

          if (doc.data.image) {
            let sources = srcset(doc.data.image.url, [400, 600, 900, [1800, 'q_50']])
            props.image = Object.assign({
              alt: doc.data.image_caption || doc.data.image.alt,
              sizes: '(min-width: 900px) 900px, 100vw',
              srcset: sources,
              src: sources.split(' ')[0]
            }, doc.data.image.dimensions)
          }

          return html`
            <div class="u-container">
              <header class="View-pushDown">
                ${intro(props)}
              </header>
              ${doc.data.body.map(asSlice)}
            </div>
          `
        })}
      </div>
    </main>
  `

  // render slice as element
  // (obj, num) -> Element
  function asSlice (slice, index, list) {
    switch (slice.slice_type) {
      default: return null
    }
  }
}

function meta (state) {
  return state.prismic.getByUID('page', state.params.wildcard, (err, doc) => {
    if (err) throw err
    if (!doc) return null
    var props = {
      title: asText(doc.data.title),
      description: asText(doc.data.description)
    }

    var image = doc.data.featured_image
    if (image && image.url) {
      Object.assign(props, {
        'og:image': image.url,
        'og:image:width': image.dimensions.width,
        'og:image:height': image.dimensions.height
      })
    }

    return props
  })
}
