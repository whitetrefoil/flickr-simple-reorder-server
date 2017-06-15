import superagent = require('superagent')

declare module 'superagent' {
  type OKAssertion = (res: Response) => boolean

  interface SuperAgentRequest {
    ok(callback: OKAssertion): this
  }
}
