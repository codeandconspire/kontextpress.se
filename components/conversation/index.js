var html = require('choo/html')
var { resolve } = require('../base')
var serialize = require('../text/serialize')
var asElement = require('prismic-element')

module.exports = conversation

function conversation (props) {
  return html`
    <div class="Conversation ${props.rtl ? 'Conversation--rtl' : ''}">
      ${props.messages.map(message)}
    </div>
  `
}

function message (message) {
  return html`
    <div class="Conversation-message">
      ${message.map(function (bubble) {
        return html`
          <div class="Conversation-bubble">
            ${asElement([bubble], resolve, serialize)}
          </div>
        `
      })}
    </div>
  `
}