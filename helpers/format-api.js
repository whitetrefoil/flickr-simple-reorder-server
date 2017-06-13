'use strict'

const _ = require('lodash')

function formatFlickrApi(obj) {
  if (_.isNil(obj)) { return null }

  if (obj._content) { return obj._content }

  if (_.isPlainObject(obj)) {
    return _.mapValues(obj, (o) => formatFlickrApi(o))
  } else if (_.isArray(obj)) {
    return _.map(obj, (o) => formatFlickrApi(o))
  }

  return obj
}

module.exports = formatFlickrApi
