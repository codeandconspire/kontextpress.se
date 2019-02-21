module.exports = catchall

// custom waterfall routing category -> page -> throw 404
// (obj, fn) -> Element
function catchall (state, emit) {
  var view
  var wildcard = state.params.wildcard.split('/')
  if (wildcard.length > 1) {
    view = require('../components/view/error')
    return view(state, emit)
  } else {
    wildcard = wildcard[0]
  }

  return state.prismic.getByUID('category', wildcard, function (err, doc) {
    if (!err) {
      view = require('./category')
      return view(state, emit)
    }

    // fallback to page
    return state.prismic.getByUID('page', wildcard, function (err, doc) {
      if (err) {
        view = require('../components/view/error')
      } else {
        view = require('./page')
      }
      return view(state, emit)
    })
  })
}