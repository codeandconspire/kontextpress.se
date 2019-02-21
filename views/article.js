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

module.exports = view(article, meta)

function article (state, emit) {
  return html`
    <main class="View-main">
      ${state.prismic.getByUID('article', state.params.article, function (err, doc) {
        if (err) throw err
        if (!doc) {
          return html`
            <div class="u-container">
              <div class="View-spaceLarge">
                ${intro.loading({
                  align: 'center',
                  tagline: true,
                  byline: true,
                  image: true
                })}
              </div>
            </div>
          `
        }

        var query = [
          Predicates.at('document.type', 'article'),
          Predicates.not('document.id', doc.id)
        ]
        var opts = {
          pageSize: 3,
          orderings: '[document.first_publication_date desc]'
        }

        var props = {
          align: 'center',
          title: asText(doc.data.title),
          body: asElement(doc.data.description, resolve, serialize)
        }

        var category = doc.data.category
        if (category.id && !category.isBroken) {
          props.tagline = asText(category.data.title)
          query.push(Predicates.at('my.article.category', category.id))
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

        props.byline = asByline(null, doc)

        if (doc.data.author.id) {
          state.prismic.getByID(doc.data.author.id, function (err, author) {
            if (err || !author) return
            props.byline = asByline(author, doc)
          })
        }

        if (doc.data.guest_author) {
          props.byline = asByline(doc.data.guest_author, doc)
        }

        return html`
          <div class="u-container">
            <header class="View-spaceLarge">
              ${intro(props)}
            </header>
            <div class="Text">
              <hr class="u-spaceV8">
              <h2>${text`Keep reading`}</h2>
            </div>
            ${state.prismic.get(query, opts, function (err, response) {
              if (err) return null
              var cells = []
              if (!response) {
                for (let i = 0; i < 3; i++) cells.push(card.loading())
              } else {
                cells = response.results.map(function (article) {
                  if (!article.data.author.id) return asCard(article)
                  return state.prismic.getByID(article.data.author.id, function (err, author) {
                    if (err || !author) return asCard(article)
                    return asCard(article, author)
                  })
                })
              }

              return grid({ size: { md: '1of3', sm: '1of2' } }, cells)
            })}
          </div>
        `
      })}
    </main>
  `
}

function asByline (author, article) {
  var date = parse(article.first_publication_date)
  var byline = {
    date: {
      datetime: date,
      text: format(date, 'D MMMM YYYY', { locale: sv }).toLowerCase()
    }
  }

  if (!author) {
    return byline
  }

  // handle guest authors
  if (typeof author === 'string') {
    byline.text = author
    return byline
  }

  byline.text = asText(author.data.title)
  byline.link = {
    href: '#'
  }

  if (author.data.image.url) {
    let transforms = 'r_max'
    if (!author.data.image.thumbnail.url) transforms += ',c_thumb,g_face'
    let sources = srcset(
      author.data.image.thumbnail.url || author.data.image.url,
      [30, 60, [90, 'q_50']],
      { transforms, aspect: 1 }
    )
    byline.image = {
      sizes: '30px',
      srcset: sources,
      src: sources.split(' ')[0],
      alt: byline.text,
      width: 40,
      height: 40
    }
  }

  return byline
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
    props.byline = { text: asText(author.data.title) }

    if (author.data.image.url) {
      let transforms = 'r_max'
      if (!author.data.image.thumbnail.url) transforms += ',c_thumb,g_face'
      let sources = srcset(
        author.data.image.thumbnail.url || author.data.image.url,
        [40, 60, [90, 'q_50']],
        { transforms, aspect: 1 }
      )
      props.byline.image = {
        sizes: '40px',
        srcset: sources,
        src: sources.split(' ')[0],
        alt: props.title,
        width: 40,
        height: 40
      }
    }
  }

  return card(props)
}

function meta (state) {
  return state.prismic.getByUID('article', state.params.article, function (err, doc) {
    if (err) throw err
    if (!doc) return null
    var props = {
      title: asText(doc.data.title),
      description: asText(doc.data.description)
    }

    var category = doc.data.category
    if (!category.isBroken && category.uid) {
      if (category.data.primary_color) {
        props['theme-color-primary'] = category.data.primary_color
      }
      if (category.data.secondary_color) {
        props['theme-color-secondary'] = category.data.secondary_color
      }
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
