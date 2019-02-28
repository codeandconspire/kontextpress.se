var html = require('choo/html')
var parse = require('date-fns/parse')
var format = require('date-fns/format')
var { sv } = require('date-fns/locale/sv')
var asElement = require('prismic-element')
var { Predicates } = require('prismic-javascript')
var view = require('../components/view')
var embed = require('../components/embed')
var card = require('../components/card')
var grid = require('../components/grid')
var intro = require('../components/intro')
var conversation = require('../components/conversation')
var serialize = require('../components/text/serialize')
var { asText, srcset, resolve, i18n } = require('../components/base')

var text = i18n()



module.exports = view(article, meta)

function article (state, emit) {
  return html`
    <main class="View-main">
      ${state.prismic.getByUID('article', state.params.wildcard, function (err, doc) {
        if (err) throw err
        if (!doc) {
          return html`
            <div class="u-container">
              <div class="View-pushDown">
                ${intro.loading({
                  center: true,
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
          center: true,
          title: asText(doc.data.title),
          body: asElement(doc.data.description, resolve, serialize)
        }

        var category = doc.data.category
        if (category.id && !category.isBroken) {
          props.tagline = asText(category.data.title)
          query.push(Predicates.at('my.article.category', category.id))
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
            <header class="View-pushDown">
              ${intro(props)}
            </header>
            ${doc.data.body.map(asSlice)}

            
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

  // render slice as element
  // (obj, num) -> Element
  function asSlice (slice, index, list) {
    switch (slice.slice_type) {
      case 'text': {
        if (!slice.primary.text.length) return null
        return html`
          <div class="Text Text--article">
            ${asElement(slice.primary.text, resolve, serialize)}
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
        let sources = srcset(slice.primary.image.url, [400, 600, 900, [1600, 'q_60'], [3000, 'q_50']])
        let attrs = Object.assign({
          sizes: '100vw',
          srcset: sources,
          src: sources.split(' ')[0],
          alt: slice.primary.image.alt || ''
        }, slice.primary.image.dimensions)
        var caption = slice.primary.caption ? asElement(slice.primary.caption, resolve, serialize) : slice.primary.image.copyright
        return html`
          <figure class="Text Text--article ${wide ? 'Text--wide' : ''} Text--margin">
            <img ${attrs}>
            ${caption ? html`
              <figcaption>
                <small class="Text-muted">${caption}</small>
              </figcaption>
            ` : null}
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
      case 'comic': {
        if (!slice.items.length) return null
        var aligned = slice.primary.margins === 'Inga marginaler, klistra rutorna mot varandra'
        return html`
          <div class="Text Text--article Text--wide Text--margin">
            ${grid({ aligned: aligned, size: { lg: '1of2', xl: '1of3' } }, slice.items.map(function (item) {
              if (!item.item.url) return false
              let sources = srcset(item.item.url, [400, 600, 900, [1800, 'q_50']])
              let attrs = Object.assign({
                sizes: '(min-width: 900px) 900px, 100vw',
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
    href: resolve(author)
  }

  if (author.data.image.url) {
    let transforms = 'r_max'
    if (!author.data.image.thumbnail.url) transforms += ',c_thumb,g_face'
    let sources = srcset(
      author.data.image.thumbnail.url || author.data.image.url,
      [150],
      { transforms, aspect: 1 }
    )
    byline.image = {
      sizes: '40px',
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
  return state.prismic.getByUID('article', state.params.wildcard, function (err, doc) {
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

function copy (event) {
  var button = event.currentTarget
  var input = document.getElementById(URL_ID)

  // play nice with ios
  if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
    let range = document.createRange()

    input.contentEditable = true
    input.readOnly = false
    range.selectNodeContents(input)

    // create selection
    let selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
    input.setSelectionRange(0, input.value.length)

    // reapply default attrs
    input.contentEditable = false
    input.readOnly = true
  } else {
    input.select()
  }

  // execute copy
  document.execCommand('Copy')
  button.addEventListener('transitionend', function ontransitionend () {
    button.removeEventListener('transitionend', ontransitionend)
    window.setTimeout(() => button.classList.remove('is-active'), 1000)
  })
  button.classList.add('is-active')
}

