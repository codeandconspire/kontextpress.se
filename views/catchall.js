module.exports = catchall

// custom waterfall routing article -> category -> page -> throw 404
// (obj, fn) -> Element
function catchall (state, emit) {
  var view
  var slug
  var wildcard = state.params.wildcard.split('/')
  slug = wildcard[wildcard.length - 1]

  return state.prismic.getByUID('article', slug, function (err, doc) {
    if (!err && doc) {
      state.params.wildcard = slug
      view = require('./article')
      return view(state, emit)
    }

    return state.prismic.getByUID('category', slug, function (err, doc) {
      if (!err && doc) {
        view = require('./category')
        return view(state, emit)
      }

      return state.prismic.getByUID('page', slug, function (err, doc) {
        if (err && doc) {
          view = require('./404')
        } else {
          view = require('./page')
        }
        return view(state, emit)
      })
    })
  })
}
