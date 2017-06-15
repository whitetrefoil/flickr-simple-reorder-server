'use strict'

const _ = require('lodash')

function responseBodyFactory() {
  return async (ctx, next) => {
    await next()

    const body       = ctx.body
    const devMessage = ctx.devMessage
    const code       = ctx.status

    const formattedBody = {
      code,
      devMessage,
      data: body,
    }

    ctx.body = formattedBody
  }
}

module.exports = responseBodyFactory
