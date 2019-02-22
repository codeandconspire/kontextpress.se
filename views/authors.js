var html = require('choo/html')
var asElement = require('prismic-element')
var view = require('../components/view')
var card = require('../components/card')
var grid = require('../components/grid')
var intro = require('../components/intro')
var serialize = require('../components/text/serialize')
var { asText, reduce, srcset, resolve } = require('../components/base')

module.exports = view(authors, meta)

function authors (state, emit) {
  return state.prismic.getSingle('authors', function (err, doc) {
    if (err) throw err
    if (!doc) {
      let cells = []
      for (let i = 0; i < 3; i++) cells.push(card.loading())
      return html`
        <main class="View-main">
          ${grid({ size: { xs: '1of2', md: '1of3', xl: '1of4' } }, cells)}
          <div class="u-container">
            <div class="View-pushDown">
              ${intro.loading()}
            </div>
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
              body: asElement(doc.data.description, resolve, serialize),
              center: true
            })}
          </header>
          ${reduce(doc.data.slices, group)}
        </div>
      </main>
    `
  })

  // render collection of resources
  // obj -> Element
  function group (slice) {
    if (slice.slice_type !== 'resource_group') return null
    return html`
      <section>
        <div class="u-spaceB5">
          <h2>${asText(slice.primary.heading)}</h2>
        </div>
        ${grid({ size: { xs: '1of2', md: '1of3', xl: '1of4' } }, slice.items.map(asCard))}
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
      { transforms: 'c_thumb' }
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
