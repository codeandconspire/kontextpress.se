var html = require('choo/html')
var parse = require('date-fns/parse')
var { Predicates } = require('prismic-javascript')
var view = require('../components/view')
var grid = require('../components/grid')
var card = require('../components/card')
var intro = require('../components/intro')
var button = require('../components/button')
var { i18n, srcset, asText } = require('../components/base')

var text = i18n()
var PAGE_SIZE = 6

module.exports = view(news, meta)

function news (state, emit) {
  return state.docs.getSingle('news_listing', function render (err, doc) {
    if (err) throw err

    var num = +state.query.page
    num = isNaN(num) ? 1 : num

    var news = []
    for (let i = 0; i < num; i++) {
      if (news.length < num * PAGE_SIZE + 2) {
        news = news.concat(page(i + 1))
      }
    }

    if (state.prefetch) return Promise.all(news)

    var latest = news.slice(0, 2)
    var first = news.slice(2, PAGE_SIZE + 2)
    var rest = news.slice(PAGE_SIZE + 2, num * PAGE_SIZE + 2).filter(Boolean)
    var hasMore = news.length >= num * PAGE_SIZE + 2

    if (first.length && state.ui.isLoading) {
      for (let i = 0; i < 3; i++) rest.push(null)
    }

    return html`
      <main class="View-main">
        <div class="u-container">
          <div class="View-spaceLarge">
            ${doc ? intro({ title: asText(doc.data.title), body: asText(doc.data.description) }) : intro.loading()}
          </div>
          ${news.length ? html`
            <section>
              ${grid({ size: { sm: '1of2' } }, latest.map((item) => newsCard(item, 2)))}
              ${grid({ size: { sm: '1of2', lg: '1of3' } }, first.map(newsCard))}
              ${grid({ size: { sm: '1of2', lg: '1of3' }, appear: true }, rest.map(newsCard))}
            </section>
          ` : html`
            <div class="Text u-textCenter u-sizeFull">
              <p>${text`Nothing to see here`}</p>
            </div>
          `}
          ${!state.ui.isLoading && hasMore ? html`
            <p class="u-textCenter View-space">
              ${button({ href: `/nyheder?page=${num + 1}`, text: text`Show more`, onclick: onclick })}
            </p>
          ` : null}
        </div>
      </main>
    `
  })

  // fetch page by number
  // num -> arr
  function page (num) {
    let predicate = Predicates.at('document.type', 'news')
    let opts = {
      page: num,
      pageSize: PAGE_SIZE + 2,
      orderings: '[document.first_publication_date desc]'
    }

    return state.docs.get(predicate, opts, function onresponse (err, response) {
      if (err) throw err
      if (!response) {
        var cells = []
        for (let i = 0; i < PAGE_SIZE; i++) cells.push(null)
        return cells
      }
      return response.results
    })
  }

  // capture click and emit silent pushState
  // obj -> void
  function onclick (event) {
    if (!state.ui.isLoading) emit('pushState', event.target.href, true)
    event.preventDefault()
  }

  // render document as card
  // obj -> Element
  function newsCard (doc, cols = 3) {
    if (!doc) return card.loading({ date: true })

    var date = parse(doc.first_publication_date)
    var sizes = '(min-width: 400px) 50vw, 100vw'
    if (cols === 3) sizes = '(min-width: 1000px) 30vw, ' + sizes
    var opts = { transforms: 'c_thumb', aspect: 3 / 4 }
    if (cols === 2) opts.aspect = 9 / 16

    var image = doc.data.image.url ? {
      alt: doc.data.image.alt,
      sizes: sizes,
      srcset: srcset(doc.data.image.url, [400, 600, 900, 1800], opts),
      src: `/media/fetch/w_900/${doc.data.image.url}`,
      caption: doc.data.image.copyright
    } : null
    var slot = image ? null : html`
      <div class="u-aspect${cols === 2 ? '16-9' : '4-3'} u-bgGray u-bgCurrent"></div>
    `

    return card({
      title: asText(doc.data.title),
      body: asText(doc.data.description),
      image: image,
      date: {
        datetime: date,
        text: text`Published on ${('0' + date.getDate()).substr(-2)} ${text(`MONTH_${date.getMonth()}`)}, ${date.getFullYear()}`
      },
      link: {
        href: state.docs.resolve(doc)
      }
    }, slot)
  }
}

function meta (state) {
  return state.docs.getSingle('news_listing', function (err, doc) {
    if (err) throw err
    if (!doc) return { title: text`LOADING_TEXT_SHORT` }
    return {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.social_image.url
    }
  })
}
