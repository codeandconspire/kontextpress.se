var html = require('choo/html')
var asElement = require('prismic-element')
var view = require('../components/view')
var card = require('../components/card')
var grid = require('../components/grid')
var intro = require('../components/intro')
var { asText, reduce, srcset, resolve, HTTPError } = require('../components/base')

module.exports = view(authors, meta)

function authors (state, emit) {
  return state.prismic.getSingle('authors', function (err, doc) {
    if (err) throw HTTPError(404, err)
    if (!doc) {
      let cells = []
      for (let i = 0; i < 3; i++) cells.push(card.loading())
      return html`
        <main class="View-main">
          <div class="u-container">
            <div class="View-pushDown">
              ${intro.loading({center: true})}
            </div>
          </div>
          <div class="u-container">
            ${grid({ size: { xs: '1of2', md: '1of3' } }, cells)}
          </div>
        </main>
      `
    }

    return html`
      <main class="View-main">
        <div class="u-container">
          <header class="View-pushDown">
            ${intro({
              title: asText(doc.data.title),
              body: asElement(doc.data.description, resolve, state.serialize),
              center: true
            })}
          </header>
          ${doc.data.body ? html`
            <div class="Text Text--article">
              ${asElement(doc.data.body, resolve, state.serialize)}
            </div>
          ` : null}
          ${reduce(doc.data.slices, group)}
        </div>
      </main>
    `
  })

  // render collection of resources
  // obj -> Element
  function group (slice, index) {
    if (slice.slice_type !== 'resource_group') return null
    return html`
      <section>
        <div class="Text Text--full">
          <h2 class="Text-section Text-section--simple">${asText(slice.primary.heading)}</h2>
        </div>
        ${grid({ size: { md: '1of2', lg: '1of3' } }, slice.items.map(asCard))}
      </section>
    `
  }
}

// render author as card
// (obj, obj?) -> Element
function asCard (item) {
  var role = item.author.data.role
  var email = item.author.data.email ? html`<a href="mailto:${item.author.data.email}">${item.author.data.email}</a>` : null
  var body = role || email

  if (role && email) {
    body = html`<p>${role}<br /> ${email}</p>`
  }

  var props = {
    title: asText(item.author.data.title),
    body: body,
    link: {
      href: resolve(item.author)
    }
  }

  var image = item.author.data.featured_image
  if (!image) image = item.author.data.image
  if (image.url) {
    let sources = srcset(
      image.url,
      [400, 600, [800, 'q_70'], [1600, 'q_50']],
      { transforms: 'c_thumb,g_north', aspect: 9 / 14 }
    )

    props.image = Object.assign({
      sizes: '(min-width: 1000px) 33vw, (min-width: 600px) 50vw, 100vw',
      srcset: sources,
      src: sources.split(' ')[0],
      alt: item.author.data.image_caption || ''
    }, image.dimensions)
  }

  return card(props)
}

function meta (state) {
  return state.prismic.getSingle('authors', function (err, doc) {
    if (err) throw err
    if (!doc) return null
    var props = {
      title: asText(doc.data.title),
      description: asText(doc.data.description)
    }

    if (doc.data.featured_image.url) {
      props['og:image'] = doc.data.featured_image.url
      props['og:image:width'] = doc.data.featured_image.dimensions.width
      props['og:image:heigh'] = doc.data.featured_image.dimensions.height
    }

    return props
  })
}
