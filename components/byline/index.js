var html = require('choo/html')
var { pluck, className } = require('../base')

module.exports = byline

function byline (props) {
  var authors = props.authors.filter(Boolean)
  var multiple = authors && authors.length > 1
  var linked = !multiple && authors && authors.length && authors[0].link

  if (authors && authors.length) {
    var figure = html`
      <div class="Byline-figure">
        ${authors.map(function (author) {
          if (!author.image) return
          var attrs = pluck(author.image, 'width', 'height', 'srcset', 'sizes', 'alt')
          attrs.alt = attrs.alt || ''
          return html`<img class="Byline-thumbnail" ${attrs} src="${author.image.src}">`
        })}
      </div>
    `

    var people = html`
      <span>
        ${authors.map(function (author, index) {
          var div = (multiple && index !== authors.length - 1) ? ' & ' : null
          return html`
            <span class="Byline-person">
              ${author.link && !linked ? html`<a href="${author.link.href}">${author.text}</a>` : author.text}
              ${div}
            </span>
          `
        })}
      </span>
    `
  }

  if (props.date) {
    var div = authors && authors.length > 0 ? html`<span class="Byline-divider">–</span>` : null
    var date = html`
      <span>
        ${div}<time class="u-inlineBlock" datetime="${JSON.stringify(props.date.datetime).replace(/"/g, '')}">${props.date.text}</time>
      </span>
    `
  }

  return html`
    <div class="${className('Byline', { 'Byline--multiple': multiple })}">
      ${linked ? html`
        <div class="Byline-content">
          <a class="Byline-content" href="${authors[0].link.href}">
            ${figure} <div class="Byline-text">${people}</div>
          </a>
          ${date}
        </div>
      ` : html`
        <div class="Byline-content">
          ${figure} <div class="Byline-text">${people}</div>
          ${date}
        </div>
      `}
    </div>
  `
}
