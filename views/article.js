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

  // render slice as element
  // (obj, num) -> Element
  function asSlice (slice, index, list) {
    switch (slice.slice_type) {
      case 'text': {
        if (!slice.primary.text.length) return null
        return html`
          <div class="u-spaceV6">
            <div class="Text Text--large">
              ${asElement(slice.primary.text, resolve, serialize)}
            </div>
          </div>
        `
      }
      // case 'heading': {
      //   if (!slice.primary.heading.length) return null
      //   return html`
      //     <div class="Text Text--large u-spaceB5 u-pushDown">
      //       <h2>${asText(slice.primary.heading)}</h2>
      //       ${slice.primary.text.length ? asElement(slice.primary.text, resolve, serialize) : null}
      //     </div>
      //   `
      // }
      // case 'quote': {
      //   let blockquote = state.cache(Blockquote, `${state.params.slug}-${index}`)
      //   return html`
      //     <div class="u-spaceV5">
      //       ${blockquote.render({
      //         large: true,
      //         content: asElement(slice.primary.text, resolve, serialize),
      //         caption: asElement(slice.primary.cite, resolve, serialize)
      //       })}
      //     </div>
      //   `
      // }
      // case 'image': {
      //   if (!slice.primary.image.url) return null
      //   let sources = srcset(slice.primary.image.url, [400, 600, 900, [1600, 'q_60'], [3000, 'q_50']])
      //   let attrs = Object.assign({
      //     sizes: '100vw',
      //     srcset: sources,
      //     src: sources.split(' ')[0],
      //     alt: slice.primary.image.alt || ''
      //   }, slice.primary.image.dimensions)
      //   return html`
      //     <figure class="Text Text--large u-sizeFull u-spaceV6">
      //       <img ${attrs}>
      //       ${slice.primary.image.copyright ? html`
      //         <figcaption>
      //           <small class="Text-muted">${slice.primary.image.copyright}</small>
      //         </figcaption>
      //       ` : null}
      //     </figure>
      //   `
      // }
      // case 'author': {
      //   return html`
      //     <div class="u-spaceV6">
      //       ${byline({
      //         heading: asText(slice.primary.heading),
      //         body: asElement(slice.primary.text, resolve, reset),
      //         image: slice.primary.image.url ? Object.assign({
      //           src: srcset(
      //             slice.primary.image.url,
      //             [200, 'c_thumb'],
      //             { aspect: 278 / 195 }
      //           ).split(' ')[0],
      //           sizes: '15rem',
      //           srcset: srcset(
      //             slice.primary.image.url,
      //             [200, 400, [800, 'q_50,c_thumb']],
      //             { transforms: 'c_thumb', aspect: 278 / 195 }
      //           ),
      //           alt: slice.primary.image.alt || ''
      //         }, slice.primary.image.dimensions) : null
      //       })}
      //     </div>
      //   `
      // }
      // case 'accordion': {
      //   return html`
      //     <section class="u-spaceV6">
      //       <div class="Text u-sizeFull">
      //         ${slice.items.map(function (item) {
      //           if (!item.heading.length) return null
      //           return html`
      //             <details>
      //               <summary><h3>${asText(item.heading)}</h3></summary>
      //               <div class="Text Text--large">
      //                 ${asElement(item.text)}
      //               </div>
      //             </details>
      //           `
      //         }).filter(Boolean)}
      //       </div>
      //     </section>
      //   `
      // }
      // case 'team': {
      //   if (!slice.items.length) return
      //   let opts = { size: { lg: '1of4' } }
      //   let hasImage = slice.items.find((item) => item.image.url)
      //   if (hasImage) opts.size.xs = '1of2'
      //   else opts.size.md = '1of2'
      //   return grid(opts, slice.items.map(teamMember))
      // }
      // case 'newsletter': {
      //   return html`
      //     <div>
      //       ${index !== 0 ? html`<hr class="u-invisible">` : null}
      //       ${state.cache(Subscribe, `${state.params.slug}-${index}`).render({
      //         action: state.mailchimp,
      //         title: asText(slice.primary.heading),
      //         body: slice.primary.text.length ? asElement(slice.primary.text, resolve, serialize) : null,
      //         success: slice.primary.success_message.length ? asElement(slice.primary.success_message, resolve, serialize) : null,
      //         ref: slice.primary.ref
      //       })}
      //       ${index < list.length - 1 ? html`<hr />` : null}
      //     </div>
      //   `
      // }
      // case 'link_blurb': {
      //   let link = slice.primary.link
      //   if (!link.id || link.isBroken) return null
      //   if (link.type === 'page') {
      //     link = state.prismic.getByUID('page', link.uid, function (err, doc) {
      //       if (err) return null
      //       return doc
      //     })
      //   }
      //   if (!link) {
      //     blurbs.push(card.loading())
      //   } else {
      //     blurbs.push(asCard({
      //       title: link.data.title,
      //       body: link.data.description,
      //       image: link.data.featured_image,
      //       color: slice.primary.color || link.data.theme,
      //       link: {
      //         href: resolve(link),
      //         text: link.data.cta
      //       }
      //     }))
      //   }
      //   return blurbs
      // }
      // case 'file_blurb': {
      //   let { primary } = slice
      //   if (!primary.file.url || primary.file.isBroken) return null
      //   blurbs.push(asCard({
      //     file: true,
      //     image: primary.image,
      //     title: primary.title,
      //     body: primary.text,
      //     color: primary.color,
      //     link: {
      //       href: primary.file.url
      //     }
      //   }))
      //   return blurbs
      // }
      // case 'any_blurb': {
      //   let { primary } = slice
      //   let { link } = primary
      //   if ((!link.url && !link.id) || link.isBroken) return null
      //   blurbs.push(asCard({
      //     image: primary.image,
      //     title: primary.title,
      //     body: primary.text,
      //     color: primary.color,
      //     link: {
      //       href: resolve(link),
      //       external: link.target === '_blank'
      //     }
      //   }))
      //   return blurbs
      // }
      // case 'button': {
      //   if (!slice.primary.text && !slice.primary.link) return
      //   return html`
      //     <div class="u-spaceV5">
      //       ${button({
      //         primary: true,
      //         external: slice.primary.link.link_type === 'Web',
      //         href: slice.primary.link.url,
      //         text: slice.primary.text
      //       })}
      //     </div>
      //   `
      // }
      default: return null
    }
  }
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
