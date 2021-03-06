import * as _ from 'lodash'

export interface IFlickrResponseContent {
  _content?: string|number

  [key: string]: string|number|IFlickrResponseContent
}

function formatFlickrApi(obj: IFlickrResponseContent): any {
  if (_.isNil(obj)) { return null }

  if (obj._content) { return obj._content }

  if (_.isPlainObject(obj)) {
    return _.mapValues(obj, formatFlickrApi)
  } else if (_.isArray(obj)) {
    return _.map(obj, formatFlickrApi)
  }

  return obj
}

export default formatFlickrApi
