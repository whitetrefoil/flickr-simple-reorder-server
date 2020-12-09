import { expect } from 'chai'
import oauth      from '~/helpers/oauth'

describe('basic usage', () => {
  xit('should work', () => {
    const authorized = oauth({
      key   : 'asdfasdfasdf',
      secret: 'werqwerwqer',
    }).authorize({
      method: 'GET',
      url   : 'https://api.flickr.com/services/rest/',
      data  : {
        asdf          : 1,
        format        : 'json',
        nojsoncallback: '1',
      },
    })

    expect(authorized).to.eql({
      asdf                  : 1,
      format                : 'json',
      nojsoncallback        : '1',
      oauth_consumer_key    : 'asdfasdfasdf',
      oauth_nonce           : 'ygJw8hU2b50Y4vTTlweuB9SAyFQBPDso',
      oauth_signature       : '22WwpZl0kcf6cc5OjHXYaoUTmiY=',
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp       : 1600238214,
      oauth_version         : '1.0',
    })
  })
})
