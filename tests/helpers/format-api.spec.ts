import { expect }      from 'chai'
import formatFlickrApi from '~/helpers/format-api'

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

      const output = formatFlickrApi(input)

      expect(output).to.eql({
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
