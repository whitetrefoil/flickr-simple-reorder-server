'use strict'

const _ = require('lodash')

function requestBodyFactory() {
  return async (ctx, next) => {
    ctx.request.mergedBody = _.assign({}, ctx.query, ctx.request.body)
    await next()
  }
}

module.exports = requestBodyFactory
