var view = require('../components/view')

module.exports = view(notfound)

function notfound (state, emit) {
  var err = new Error('Page does not exist')
  err.status = 404
  throw err
}
