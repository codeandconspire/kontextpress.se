/* global gtag */

module.exports = tracking

function tracking (state, emitter) {
  emitter.on('navigate', function (href) {
    gtag('config', 'UA-136440787-1', {
      'page_title': state.title,
      'page_path': state.href
    })
  })
}
