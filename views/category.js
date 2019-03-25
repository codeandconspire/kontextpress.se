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
var byline = require('../components/byline')
var { asText, srcset, resolve, HTTPError } = require('../components/base')

module.exports = view(category, meta)

function category (state, emit) {
  return html`
    <main class="View-main">
      ${state.prismic.getByUID('category', state.params.category, function (err, doc) {
        if (err) {
          if (state.prefetch) throw err
          throw HTTPError(404, err)
        }

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
              orderings: '[document.first_publication_date desc]'
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
                return asCard(article)
              })
            })
          }

          return grid({ size: { md: '1of2', lg: '1of3' } }, cells)
        }
      })}
    </main>
  `
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
  return state.prismic.getByUID('category', state.params.category, function (err, doc) {
    if (err) throw err
    if (!doc) return null
    var props = {
      title: asText(doc.data.title),
      description: asText(doc.data.description)
    }

    var image = doc.data.featured_image
    if (!image.url) image = doc.data.image
    if (image.url) {
      Object.assign(props, {
        'og:image': image.url,
        'og:image:width': image.dimensions.width,
        'og:image:height': image.dimensions.height
      })
    }

    return props
  })
}
