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

module.exports = view(home, meta)

function home (state, emit) {
  return html`
    <main class="View-main">
      ${state.prismic.getSingle('homepage', function (err, doc) {
        if (err) throw err

        return html`
          <div class="u-container">
            <header class="View-pushDown">
              ${doc ? intro({
                title: asText(doc.data.title),
                body: asElement(doc.data.description, resolve, serialize)
              }) : intro.loading()}
            </header>
            ${state.prismic.getSingle('website', function (err, doc) {
              if (err) return empty()

              var query = [Predicates.at('document.type', 'article')]
              var opts = {
                pageSize: 6,
                orderings: '[document.first_publication_date desc]'
              }

              if (doc) {
                // only fetch articles from the main categories
                let categories = doc.data.categories.map((item) => item.link.id)
                query.push(Predicates.any('my.article.category', categories))
              }

              try {
                var articles = doc ? state.prismic.get(query, opts, function (err, response) {
                  if (err) throw err
                  return response ? response.results : null
                }) : null
              } catch (err) {
                return empty()
              }

              var cells = []
              if (!articles) {
                for (let i = 0; i < 6; i++) cells.push(card.loading())
              } else {
                cells = articles.map(function (article) {
                  if (article.data.author.id) {
                    return state.prismic.getByID(article.data.author.id, function (err, author) {
                      if (err || !author) return asCard(article)
                      return asCard(article, author)
                    })
                  }

                  return asCard(article, article.data.guest_author || null)
                })
              }

              return grid({ size: { md: '1of2', lg: '1of3' } }, cells)
            })}
          </div>
        `
      })}
    </main>
  `

  // placeholder for missing content
  // () -> Element
  function empty () {
    return html`
      <div class="Text">
        <p>${text`Something seems off. We couldn't get the content you requested. ${html`<a href="${state.href}" onclick=${reload}>${text`Try again`}</a>`} or navigate using the menu.`}</p>
      </div>
    `
  }
}

// reload page
// () -> void
function reload () {
  window.location.reload()
}

// render article as card with author byline
// (obj, obj?) -> Element
function asCard (article, author) {
  var date = parse(article.first_publication_date)
  var props = {
    title: asText(article.data.title),
    body: asText(article.data.description),
    date: {
      datetime: date,
      text: format(date, 'D MMMM YYYY', { locale: sv }).toLowerCase()
    },
    link: {
      href: resolve(article)
    }
  }

  var image = article.data.featured_image
  if (!image.url) image = article.data.image
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
      alt: article.data.image_caption || ''
    }, image.dimensions)
  }

  if (author) {
    props.byline = {
      text: (typeof author === 'string') ? author : asText(author.data.title)
    }

    if (author.data && author.data.image && author.data.image.url) {
      let transforms = 'r_max'
      if (!author.data.image.thumbnail.url) transforms += ',c_thumb,g_face'
      let sources = srcset(
        author.data.image.thumbnail.url || author.data.image.url,
        [150],
        { transforms, aspect: 1 }
      )
      props.byline.image = {
        sizes: '40px',
        srcset: sources,
        src: sources.split(' ')[0],
        alt: props.byline.text,
        width: 40,
        height: 40
      }
    }
  }

  return card(props)
}

function meta (state) {
  return state.prismic.getSingle('homepage', function (err, doc) {
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
