declare module 'oauth-1.0a' {
  declare namespace o {
    declare type ISignatureMethod = 'HMAC-SHA1'|'HMAC-SHA256'
    declare type IMethod = 'GET'|'POST'

    export interface IOAuthToken {
      key: string
      secret: string
    }

    export interface IOAuthOptions {
      consumer: IOAuthToken
      signature_method: ISignatureMethod
      hash_function: (base_string: string, key: string) => string
    }

    export interface IRequest {
      url: string
      method: IMethod
      data: unknown
    }

    export static class OAuth {
      // eslint-disable-next-line @typescript-eslint/ban-types
      authorize(request: IRequest, token: IOAuthToken|{}): unknown
    }
  }

  declare function o(options: o.IOAuthOptions): o.OAuth

  export = o
}
