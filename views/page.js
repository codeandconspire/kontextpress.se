var html = require('choo/html')
var asElement = require('prismic-element')
var view = require('../components/view')
var intro = require('../components/intro')
var embed = require('../components/embed')
var blurb = require('../components/blurb')
var grid = require('../components/grid')
var serialize = require('../components/text/serialize')
var { asText, resolve, srcset } = require('../components/base')

module.exports = view(page, meta)

function page (state, emit) {
  return html`
    <main class="View-main">
      ${state.prismic.getByUID('page', state.params.page, (err, doc) => {
        if (err) throw err
        if (!doc) {
          return html`
            <div class="u-container">
              <div class="View-pushDown">
                ${intro.loading({
                  center: true,
                  image: true
                })}
              </div>
            </div>
          `
        }

        var props = {
          center: true,
          title: asText(doc.data.title),
          body: asElement(doc.data.description, resolve, serialize)
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
        return html`
          <div class="u-container">
            <header class="View-pushDown">
              ${intro(props)}
            </header>
            ${doc.data.body.map(asSlice)}
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
      case 'blurbs': {
        if (!slice.items && !slice.items.length) return
        var blurbs = slice.items.map(function (item) {
          return blurb({
            title: asText(item.heading),
            content: asElement(item.content),
            href: resolve(item.link)
          })
        })

        return html`
          <div class="u-wide">
            ${grid({ size: { md: '1of2' }, blurbs: true }, blurbs)}
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

function meta (state) {
  return state.prismic.getByUID('page', state.params.page, (err, doc) => {
    if (err) throw err
    if (!doc) return null
    var props = {
      title: asText(doc.data.title),
      description: asText(doc.data.description)
    }

    var image = doc.data.featured_image
    if (image && image.url) {
      Object.assign(props, {
        'og:image': image.url,
        'og:image:width': image.dimensions.width,
        'og:image:height': image.dimensions.height
      })
    }

    return props
  })
}
