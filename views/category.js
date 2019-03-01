var html = require('choo/html')
var parse = require('date-fns/parse')
var sv = require('date-fns/locale/sv')
var format = require('date-fns/format')
var asElement = require('prismic-element')
var { Predicates } = require('prismic-javascript')
var view = require('../components/view')
var card = require('../components/card')
var grid = require('../components/grid')
var intro = require('../components/intro')
var { asText, srcset, resolve } = require('../components/base')

module.exports = view(category, meta)

function category (state, emit) {
  return html`
    <main class="View-main">
      ${state.prismic.getByUID('category', state.params.category, function (err, doc) {
        if (err) throw err

        return html`
          <div class="u-container">
            <header class="View-pushDown">
              ${doc ? intro({
                title: asText(doc.data.title),
                body: asElement(doc.data.description, resolve, state.serialize)
              }) : intro.loading()}
            </header>
            <div class="u-nbfs u-spaceB8">
              ${doc ? doc.data.featured_posts.map(function (item, index) {
                if (!item.link.id || item.link.isBroken) return null
                return html`
                  <div>
                    ${state.prismic.getByUID(item.link.type, item.link.uid, function (err, article) {
                      if (err) return null
                      if (!article) {
                        return card.loading({
                          format: 'horizontal',
                          reverse: Boolean(index % 2)
                        })
                      }

                      var author = article.data.author
                      if (!author.id || author.isBroken) {
                        author = article.data.guest_author
                      }

                      return asCard(article, {
                        author: author,
                        color: article.data.category.data.secondary_color,
                        type: article.data.type,
                        format: 'horizontal',
                        reverse: Boolean(index % 2)
                      })
                    })}
                  </div>
                `
              }).filter(Boolean) : card.loading({ format: 'horizontal' })}
            </div>
            ${list()}
          </div>
        `

        function list () {
          var cells = []

          if (!doc) {
            for (let i = 0; i < 6; i++) cells.push(card.loading())
          } else {
            var query = [Predicates.at('document.type', 'article')]
            var opts = {
              pageSize: 100,
              orderings: '[document.last_publication_date desc]'
            }

            // prevent duplicate featured posts
            doc.data.featured_posts
              .map((item) => item.link.id)
              .forEach((id) => query.push(Predicates.not('document.id', id)))

            // only fetch posts in this category
            query.push(Predicates.at('my.article.category', doc.id))

            cells = state.prismic.get(query, opts, function (err, response) {
              if (err) return null
              if (!response) return cells
              return response.results.map(function (article) {
                var author = article.data.author
                if (!author.id || author.isBroken) {
                  author = article.data.guest_author
                }
                return asCard(article, author)
              })
            })
          }

          return grid({ size: { md: '1of2', lg: '1of3' } }, cells)
        }
      })}
    </main>
  `
}

// render article as card with author byline
// (obj, obj?) -> Element
function asCard (article, opts = {}) {
  var date = parse(article.last_publication_date)
  var props = {
    type: opts.type,
    format: opts.format,
    reverse: opts.reverse,
    color: opts.color,
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

  var author = opts.author
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
  return state.prismic.getByUID('category', state.params.category, function (err, doc) {
    if (err) throw err
    if (!doc) return null
    var props = {
      title: asText(doc.data.title),
      description: asText(doc.data.description)
    }

    if (doc.data.primary_color) {
      props['theme-color-primary'] = doc.data.primary_color
    }

    if (doc.data.secondary_color) {
      props['theme-color-secondary'] = doc.data.secondary_color
    }

    if (doc.data.featured_image.url) {
      props['og:image'] = doc.data.featured_image.url
      props['og:image:width'] = doc.data.featured_image.dimensions.width
      props['og:image:heigh'] = doc.data.featured_image.dimensions.height
    }

    return props
  })
}
