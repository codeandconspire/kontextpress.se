var cccpurge = require('cccpurge')
var Prismic = require('prismic-javascript')
var { resolve } = require('../components/base')

var REPOSITORY = 'https://kontext.cdn.prismic.io/api/v2'

module.exports = purge

function purge (urls, callback = Function.prototype) {
  if (typeof urls === 'function') {
    callback = urls
    urls = []
  }

  cccpurge(require('../index'), {
    urls: urls,
    resolve: resolveRoute,
    root: `https://${process.env.npm_package_now_alias}`,
    zone: process.env.CLOUDFLARE_ZONE,
    email: process.env.CLOUDFLARE_EMAIL,
    key: process.env.CLOUDFLARE_KEY
  }, callback)
}

async function resolveRoute (route, done) {
  try {
    let api = await Prismic.getApi(REPOSITORY)
    if (route === '/redaktionen/:author') {
      let query = Prismic.Predicates.at('document.type', 'author')
      let response = await api.query(query)
      done(null, response.results.map(resolve))
    } else if (route === '/*') {
      let queries = [
        Prismic.Predicates.at('document.type', 'category'),
        Prismic.Predicates.at('document.type', 'article'),
        Prismic.Predicates.at('document.type', 'page')
      ]
      let responses = await Promise.all(queries.map((query) => api.query(query)))
      let urls = []
      for (let i = 0, len = responses.length; i < len; i++) {
        responses[i].results.forEach((doc) => urls.push(resolve(doc)))
      }
      done(null, urls)
    } else {
      done(null)
    }
  } catch (err) {
    done(err)
  }
}
