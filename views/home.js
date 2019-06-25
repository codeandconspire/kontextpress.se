var html = require('choo/html')
var parse = require('date-fns/parse')
var sv = require('date-fns/locale/sv')
var format = require('date-fns/format')
var asElement = require('prismic-element')
var { Predicates } = require('prismic-javascript')
var view = require('../components/view')
var card = require('../components/card')
var grid = require('../components/grid')
var byline = require('../components/byline')
var intro = require('../components/intro')
var { asText, srcset, resolve, i18n, HTTPError } = require('../components/base')

var text = i18n()

var PAGE_SIZE = 15

module.exports = view(home, meta)

function home (state, emit) {
  return html`
    <main class="View-main">
      ${state.prismic.getSingle('homepage', function (err, doc) {
        if (err) throw HTTPError(404, err)

        return html`
          <div class="u-container">
            <header class="View-pushDown">
              ${doc ? intro({
                title: asText(doc.data.title),
                body: asElement(doc.data.description, resolve, state.serialize)
              }) : intro.loading()}
            </header>
            <div>
              ${doc ? doc.data.featured_posts.map(function (item, index) {
                if (!item.link.id || item.link.isBroken) return null
                return state.prismic.getByUID(item.link.type, item.link.uid, function (err, article) {
                  if (err) return null
                  if (!article) {
                    return card.loading({
                      format: 'horizontal',
                      reverse: Boolean(index % 2)
                    })
                  }

                  return asCard(article, {
                    color: article.data.category.data.secondary_color,
                    type: article.data.type,
                    format: 'horizontal',
                    reverse: Boolean(index % 2)
                  })
                })
              }).filter(Boolean) : html`
                <div class="u-spaceT4 u-spaceB8">
                  ${card.loading({ format: 'horizontal' })}
                </div>
              `}
            </div>
            ${state.prismic.getSingle('website', function (err, website) {
              if (err) return empty()

              if (doc) {
                var page = +state.query.sida
                var hasMore = true
                if (isNaN(page)) page = 1
                var query = [Predicates.at('document.type', 'article')]
                var opts = {
                  pageSize: PAGE_SIZE,
                  orderings: '[document.first_publication_date desc]'
                }

                if (website) {
                  // only fetch articles from the main categories
                  let categories = website.data.categories.map((item) => item.link.id)
                  query.push(Predicates.any('my.article.category', categories))
                }

                // prevent duplicate featured posts
                doc.data.featured_posts
                  .map((item) => item.link.id)
                  .forEach((id) => query.push(Predicates.not('document.id', id)))

                try {
                  var articles = null

                  if (website) {
                    articles = []

                    for (let i = 1; i <= page; i++) {
                      articles.push(...state.prismic.get(query, Object.assign({ page: i }, opts), function (err, response) {
                        if (err) throw err
                        if (response) {
                          hasMore = hasMore && response.results_size === PAGE_SIZE
                        }
                        return response ? response.results : []
                      }))
                    }
                  }
                } catch (err) {
                  return empty()
                }
              }

              var cells = []
              if (!articles) {
                for (let i = 0; i < PAGE_SIZE; i++) cells.push(card.loading())
              } else {
                cells = articles.map(function (article) {
                  return asCard(article)
                })
              }

              return html`
                ${grid({ size: { md: '1of2', lg: '1of3' } }, cells)}
                ${hasMore ? html`
                  <div class="u-textCenter">
                    <a class="View-pagination" href="${state.href}?sida=${page + 1}">${text`Show more`}</a>
                  </div>
                ` : null}
              `
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

function asByline (doc, showDate) {
  var time = parse(doc.first_publication_date)
  var props = {
    date: showDate ? {
      datetime: time,
      text: format(time, 'D MMMM YYYY', { locale: sv }).toLowerCase()
    } : false,
    authors: []
  }

  if (doc.data.authors && doc.data.authors.length) {
    props.authors = doc.data.authors.map(function (author) {
      if (!author.item.id || author.item.isBroken) return
      var result = {}
      result.text = asText(author.item.data.title)
      result.link = {
        href: resolve(author.item)
      }

      if (author.item.data.image.url) {
        let transforms = 'r_max'
        if (!author.item.data.image.thumbnail.url) transforms += ',c_thumb,g_face'
        let sources = srcset(
          author.item.data.image.thumbnail.url || author.item.data.image.url,
          [150],
          { transforms, aspect: 1 }
        )
        result.image = {
          sizes: '40px',
          srcset: sources,
          src: sources.split(' ')[0],
          alt: author.item.text,
          width: 40,
          height: 40
        }
      }

      return result
    })

    if (doc.data.guest_author) {
      props.authors.push({ text: doc.data.guest_author })
    }
  }

  return byline(props)
}

// render article as card with author byline
// (obj, obj?) -> Element
function asCard (doc, opts = {}) {
  var date = parse(doc.first_publication_date)
  var props = {
    type: opts.type,
    format: opts.format,
    reverse: opts.reverse,
    color: opts.color,
    title: asText(doc.data.title),
    body: asText(doc.data.description),
    byline: asByline(doc),
    date: {
      datetime: date,
      text: format(date, 'D MMMM YYYY', { locale: sv }).toLowerCase()
    },
    link: {
      href: resolve(doc)
    }
  }

  var image = doc.data.featured_image
  if (!image.url) image = doc.data.image
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
      alt: doc.data.image_caption || ''
    }, image.dimensions)
  }

  return card(props)
}

function meta (state) {
  return state.prismic.getSingle('homepage', function (err, doc) {
    if (err) throw err
    if (!doc) return null
    var props = {
      title: text`SITE_NAME`,
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
