import * as _ from 'lodash-es'


export interface IFlickrWrappedContent<T = string> {
  _content: T
}

export type IFlickrResponseValue = string|number|IFlickrWrappedContent<string|number>|{
  [key: string]: IFlickrResponseValue
}

// export interface IFlickrResponseContent {
//   _content?: string|number
//
//   [key: string]: string|number|IFlickrResponseContent|undefined
// }

export interface IFlickrResponseObj {
  [key: string]: IFlickrResponseValue
}


function formatFlickrApi(obj: IFlickrResponseObj): unknown {
  if (obj == null) {
    return null
  }

  if (obj._content != null) {
    return obj._content
  }

  if (_.isPlainObject(obj)) {
    return _.mapValues(obj, formatFlickrApi)
  } else if (Array.isArray(obj)) {
    return _.map(obj, formatFlickrApi)
  }

  return obj
}


export default formatFlickrApi
