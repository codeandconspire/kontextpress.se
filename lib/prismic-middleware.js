// page types which all have featured fields used for links
var types = ['category', 'article', 'page', 'author']
var common = ['title', 'description', 'image', 'featured_image']
var unique = {
  'article': ['category'],
  'author': ['role', 'email'],
  'category': ['primary_color', 'secondary_color']
}

module.exports = middleware

function middleware (predicates, opts) {
  var fetchLinks = opts.fetchLinks = (opts.fetchLinks || [])

  for (let i = 0, len = types.length; i < len; i++) {
    fetchLinks.push(...common.map((field) => types[i] + '.' + field))
  }

  var keys = Object.keys(unique).sort()
  for (let i = 0, len = keys.length; i < len; i++) {
    fetchLinks.push(...unique[keys[i]].map((field) => keys[i] + '.' + field))
  }
}
