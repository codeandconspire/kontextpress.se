var html = require('choo/html')
var parse = require('date-fns/parse')
var sv = require('date-fns/locale/sv')
var format = require('date-fns/format')
var asElement = require('prismic-element')
var { Predicates } = require('prismic-javascript')
var view = require('../components/view')
var embed = require('../components/embed')
var card = require('../components/card')
var grid = require('../components/grid')
var byline = require('../components/byline')
var intro = require('../components/intro')
var conversation = require('../components/conversation')
var donate = require('../components/donate')
var { asText, srcset, resolve, i18n, HTTPError } = require('../components/base')

var text = i18n()

module.exports = view(article, meta)

function article (state, emit) {
  return html`
    <main class="View-main">
      ${state.prismic.getByUID('article', state.params.article, function (err, doc) {
        if (err) throw HTTPError(404, err)
        if (!doc) {
          return html`
            <div class="u-container">
              <div class="View-pushDown">
                ${intro.loading({
                  center: true,
                  tagline: true,
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
          center: true,
          title: asText(doc.data.title),
          body: asElement(doc.data.description, resolve, state.serialize)
        }

        var category = doc.data.category
        if (category.id && !category.isBroken) {
          props.tagline = asText(category.data.title)
          query.push(Predicates.at('my.article.category', category.id))
        }

        if (doc.data.image && doc.data.image.url) {
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

        props.byline = asByline(doc, true)

        return html`
          <div class="u-container">
            <header class="View-pushDown">
              ${intro(props)}
            </header>
            ${doc.data.body.map(asSlice)}
            <div class="u-narrow"><hr class="u-sizeFull"></div>
            ${donate()}
            <div class="Text Text--full">
              <h2 class="Text-section">${text`Keep reading`}</h2>
            </div>
            ${state.prismic.get(query, opts, function (err, response) {
              if (err) return null
              var cells = []
              if (!response) {
                for (let i = 0; i < 3; i++) cells.push(card.loading())
              } else {
                cells = response.results.map(function (article) {
                  return asCard(article)
                })

                // if comming up short from category, add on other categories
                if (cells.length < 3) {
                  cells = state.prismic.getSingle('website', function (err, website) {
                    if (err || !website) return cells

                    var query = [
                      Predicates.at('document.type', 'article'),
                      Predicates.not('document.id', doc.id)
                    ]
                    var opts = {
                      pageSize: 3 - cells.length,
                      orderings: '[document.first_publication_date desc]'
                    }

                    // only fetch articles from the other main categories
                    var categories = website.data.categories
                      .filter((item) => item.link.id !== doc.data.category.id)
                      .map((item) => item.link.id)
                    query.push(Predicates.any('my.article.category', categories))

                    return state.prismic.get(query, opts, function (err, response) {
                      if (err || !response) return cells
                      var extra = response.results.map(function (article) {
                        return asCard(article)
                      })
                      return cells.concat(extra)
                    })
                  })
                }
              }

              return grid({ size: { md: '1of2', lg: '1of3' } }, cells)
            })}
          </div>
        `
      })}
    </main>
  `

  // render slice as element
  // (obj, num) -> Element
  function asSlice (slice, index, list) {
    switch (slice.slice_type) {
      case 'text': {
        if (!slice.primary.text.length) return null
        return html`
          <div class="Text Text--article">
            ${asElement(slice.primary.text, resolve, state.serialize)}
          </div>
        `
      }
      case 'quote': {
        return html`
          <div class="Text Text--article Text--wide">
            <figure class="Text-blockquote">
              <blockquote>${asElement(slice.primary.text)}</blockquote>
              ${slice.primary.cite ? html`<figcaption class="Text-cite">${asText(slice.primary.cite)}</figcaption>` : null}
            </figure>
          </div>
        `
      }
      case 'image': {
        if (!slice.primary.image.url) return null
        var wide = slice.primary.width !== 'Spaltbredd'
        var tiny = slice.primary.width === 'Liten'

        let sources = srcset(slice.primary.image.url, [400, 600, 900, [1600, 'q_60'], [3000, 'q_50']])
        let attrs = Object.assign({
          sizes: '100vw',
          srcset: sources,
          src: sources.split(' ')[0],
          alt: slice.primary.image.alt || ''
        }, slice.primary.image.dimensions)

        var caption = slice.primary.caption ? asText(slice.primary.caption) : slice.primary.image.copyright

        return html`
          <figure class="Text Text--article ${wide ? 'Text--wide' : ''} ${tiny ? 'Text--tiny' : ''} Text--margin">
            <img ${attrs}>
            ${caption ? html`<figcaption class="Text-caption u-textCenter">${caption}</figcaption>` : null}
          </figure>
        `
      }
      case 'line': {
        return html`
          <div class="Text Text--article"><hr /></div>
        `
      }
      case 'video': {
        if (slice.primary.video.type !== 'video') return null
        let children = video(slice.primary.video)
        if (!children) return null
        return html`
          <div class="Text Text--article Text--wide Text--margin">
            ${children}
          </div>
        `
      }
      case 'sound': {
        if (slice.primary.sound.provider_name !== 'SoundCloud') return null
        var params = '&visual=true&show_artwork=true&color=%231d1d1d&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false'
        var uri = encodeURIComponent(slice.primary.sound.embed_url) + params
        return html`
          <div class="Text Text--article Text--margin">
            <div class="u-aspect4-3">
              <iframe class="u-cover" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=${uri}"></iframe>
            </div>
          </div>
        `
      }
      case 'libsyn': {
        if (!slice.primary.episode) return null
        return html`
          <div class="u-narrow">
            <iframe style="border: none; height: 94px; border: 2px solid rgb(var(--theme-color-primary))" src="//html5-player.libsyn.com/embed/episode/id/${slice.primary.episode}/height/90/theme/custom/thumbnail/yes/direction/forward/render-playlist/no/custom-color/000000/" height="400" width="100%" scrolling="no" allowfullscreen="" webkitallowfullscreen="" mozallowfullscreen="" oallowfullscreen="" msallowfullscreen=""></iframe></div>
          </div>
        `
      }
      case 'comic': {
        if (!slice.items.length) return null
        var aligned = slice.primary.margins === 'Inga marginaler, klistra rutorna mot varandra'
        return html`
          <div class="Text Text--article Text--margin">
            ${grid({ aligned: aligned }, slice.items.map(function (item) {
              if (!item.item.url) return false
              let sources = srcset(item.item.url, [400, 600, 900, [1600, 'q_60'], [2200, 'q_60']])
              let attrs = Object.assign({
                sizes: '(min-width: 42rem) 42rem, 100vw',
                srcset: sources,
                class: 'u-spaceA0',
                src: sources.split(' ')[0],
                alt: item.item.alt || ''
              }, item.item.dimensions)
              return html`
                <div><img ${attrs} /></div>
              `
            }))}
          </div>
        `
      }
      case 'conversation': {
        var messages = slice.items.map((item) => item.message)
        if (!messages || !messages.length) return
        return html`
          <div class="Text Text--article">
            ${conversation({messages: messages, rtl: slice.primary.start === 'Dig (högersidan)'})}
          </div>
        `
      }
      default: return null
    }
  }
}

// map props to embed player
// obj -> Element
function video (props) {
  var id = embed.id(props)
  if (!id) return null

  var provider = props.provider_name.toLowerCase()
  return embed({
    url: props.embed_url,
    title: props.title,
    src: `/media/${provider}/w_900/${id}`,
    width: props.thumbnail_width,
    height: props.thumbnail_height,
    sizes: '100vw',
    srcset: srcset(id, [400, 900, 1800, [2600, 'q_50'], [3600, 'q_30']], { type: provider })
  })
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
function asCard (doc) {
  var date = parse(doc.first_publication_date)
  var props = {
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
