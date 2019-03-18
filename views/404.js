var view = require('../components/view')
var { HTTPError } = require('../components/base')

module.exports = view(notfound)

function notfound (state, emit) {
  throw HTTPError(404, new Error('Page does not exist'))
}
