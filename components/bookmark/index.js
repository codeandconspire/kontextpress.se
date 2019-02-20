var html = require('choo/html')
var parse = require('date-fns/parse')
var { external } = require('../symbol')
var { i18n, srcset, snippet, loader } = require('../base')

var text = i18n(require('./lang.json'))

module.exports = bookmark
module.exports.loading = loading

function bookmark (props) {
  var url = new URL(props.url)
  var date = props.date && parse(props.date)

  return html`
    <figure class="Bookmark">
      ${props.image ? html`
        <div class="Bookmark-thumbnail">
          <img onerror=${onerror} class="Bookmark-image" alt="${props.title}" sizes="200px" srcset="${srcset(props.image, [200, 400])}" src="${srcset(props.image, [200]).split(' ')[0]}">
          ${props.publisher ? html`<small class="Bookmark-publisher">${props.publisher}</small>` : null}
        </div>
      ` : null}
      <a href="${props.url}" rel="noreferrer noopener" target="_blank" class="Bookmark-icon">
        <span class="u-hiddenVisually">${text`Visit ${url.hostname}`}</span>
        ${external({ cover: true })}
      </a>
      <figcaption class="Bookmark-body">
        <small class="Bookmark-meta">
          <span class="Bookmark-date">
            ${text`Published`} ${date ? html`
              <time datetime="${JSON.stringify(date).replace(/"/g, '')}">${text`on the ${date.getDate()}. ${text(`MONTH_${date.getMonth()}`).substr(0, 3)} ${date.getFullYear()}`}</time>
            ` : null} ${text`on`}
          </span> <span class="Bookmark-href">${url.hostname}</span>
        </small>
        <h3 class="Bookmark-title">${props.title}</h3>
        ${props.description ? html`<p class="Bookmark-description">${snippet(props.description, 90)}</p>` : null}
      </figcaption>
    </figure>
  `

  function onerror () {
    this.removeAttribute('srcset')
    this.removeAttribute('sizes')
    this.src = props.image
  }
}

function loading () {
  return html`
    <figure class="Bookmark is-loading">
      <div class="Bookmark-thumbnail u-loading"></div>
      <figcaption class="Bookmark-body">
        <small>${loader(8)}</small>
        <h3 class="Bookmark-title">${loader(8)}</h3>
        <p class="Bookmark-description">${loader(32)}</p>
      </figcaption>
    </figure>
  `
}
