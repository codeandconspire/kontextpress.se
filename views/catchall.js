module.exports = catchall

// custom waterfall routing category -> page -> throw 404
// (obj, fn) -> Element
function catchall (state, emit) {
  var segments = state.params.wildcard.split('/')
  var slug = segments[segments.length - 1]

  if (segments.length > 2) {
    let view = require('./404')
    return view(state, emit)
  }

  if (segments.length === 2) {
    state.params.article = slug
    state.params.category = segments[0]
    let view = require('./article')
    return view(state, emit)
  }

  return state.prismic.getByUID('category', slug, function (err, doc) {
    if (!err) {
      let view = require('./category')
      state.params.category = slug
      return view(state, emit)
    }

    return state.prismic.getByUID('page', slug, function (err, doc) {
      var view = err ? require('./404') : require('./page')
      state.params.page = slug
      return view(state, emit)
    })
  })
}
