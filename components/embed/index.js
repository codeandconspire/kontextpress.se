var assert = require('assert')
var html = require('choo/html')
var player = require('./player')
var { pluck, i18n } = require('../base')

var text = i18n(require('./lang.json'))

// match short and long youtube links
// https://www.youtube.com/watch?foo=bar&v=WwE7TxtoyqM&bin=baz
// https://youtu.be/gd6_ZECm58g
var YOUTUBE_RE = /https?:\/\/(?:www.)?youtu\.?be(?:\.com\/watch\?(?:.*?)v=|\/)(.+?)(?:&|$)/

module.exports = embed
module.exports.id = id

function embed (props) {
  assert(props.src, 'figure: src string is required')
  var src = props.src
  var attrs = pluck(props, 'width', 'height', 'srcset', 'sizes', 'alt')
  attrs.alt = attrs.alt || props.title || ''

  return html`
    <figure class="Embed">
      <a class="Embed-link" href="${props.url}" target="_blank" rel="noopener noreferrer" onclick=${onclick}>
        <span class="u-hiddenVisually">${text`Play ${props.title || ''}`}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 89 89" class="Embed-play">
          <g fill="none" fill-rule="evenodd">
            <circle cx="44.5" cy="44.5" r="44.5" fill="rgb(var(--theme-color-primary))"/>
            <path fill="#FFF" d="M36 31l24 14-24 14z"/>
          </g>
        </svg>
      </a>
      <img class="Embed-image" ${attrs} src="${src}">
    </figure>
  `

  function onclick (event) {
    player.render(props.url)
    event.preventDefault()
  }
}

// extract unique embed id
// obj -> str
function id (props) {
  switch (props.provider_name) {
    case 'YouTube': return props.embed_url.match(YOUTUBE_RE)[1]
    case 'Vimeo': return props.embed_url.match(/vimeo\.com\/(.+)?\??/)[1]
    default: return null
  }
}
