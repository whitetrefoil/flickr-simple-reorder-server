'use strict'

require('chai').should()

const format = require('../../helpers/format-api')

describe('Helpers', () => {
  describe(':: Format API', () => {
    it('should format Flickr API correctly', () => {
      const input = {
        a: {
          b: [
            { c: { _content: 'd' } },
            { c: { _content: 'e' } },
            { c: { _content: 'f' } },
          ],
          g: 'e',
          h: 1,
          i: null,
          j: false,
          k: true,
        },
      }

      const output = format(input)

      output.should.eql({
        a: {
          b: [
            { c: 'd' },
            { c: 'e' },
            { c: 'f' },
          ],
          g: 'e',
          h: 1,
          i: null,
          j: false,
          k: true,
        },
      })
    })
  })
})
