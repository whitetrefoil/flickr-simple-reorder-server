flickr-simple-reorder-server
============================

A simple tool to help reorder photos in galleries (photosets).

IMPORTANT!!!
------------

This is a mini-app for using in controlled environment.  All authentication & authorization jobs will be done in browser-side.  The server is just a semi-proxy to bypass the CORS limitation of Flickr's OAuth API, which means the auth token / secret will be passing between browser & server.

If you really care about your account security, **ONLY** use this application in well controlled environment (e.g. HTTPS, local, intranet).

Flickr used to have 2 auth method: legacy API & newer OAuth 1.0a API.  Although Flickr officially recommends the OAuth one, but since OAuth API has CORS limitation, it must be requested from server, not browser.  I don't want to write a server because this application is intent to be very simple & lightweight.  OAuth is more secure than legacy one only when with a heavy server-side with DB or stateful session (so it can save some sensitive data like token secret at server).  As a result, in the previous version this application uses Flickr's legacy auth API.

But on 2017/6/8 Flickr suddenly removed the legacy auth API without a notice.  This forced me to write a server for the OAuth API.  But still I don't want to write a very heavy server because I believe it's way more overkill to what I want.  So I decided to pass all sensitive data (except API key) to user's browser.  Let browser to do the business and leave this service a proxy & signer.

Author
------

[**Gino Zhang (a.k.a. WhiteTrefoil)**](http://en.gravatar.com/whitetrefoil)

Email: whitetrefoil@gmail.com

Location: Shanghai, China

License
-------

[Apache License 2.0](https://github.com/whitetrefoil/flickr-simple-reorder-server/blob/master/LICENSE)

Links
-----

* Project Home - https://github.com/whitetrefoil/flickr-simple-reorder-server
* Report Issue - https://github.com/whitetrefoil/flickr-simple-reorder-server/issues
* The front-end - https://github.com/whitetrefoil/flickr-simple-reorder
* Author's Flickr - https://www.flickr.com/whitetrefoil

Changelog
---------

### v0.1.11

* Update some dependencies.
* Fix wrong version number in `package-lock.json`.

### v0.1.10

* Fix config file generation.

### v0.1.9

* Add missing bin file.

### v0.1.8

* Better help message.
* Don't format "package.json" to be compatible with newest NPM standard.
* Fix wrong version number in "package.json".

### v0.1.7

* Lite some big logs.

### v0.1.6

* Export reorder result.

### v0.1.5

* Export photoset primary photo width & height.

### v0.1.4

* Fix missing IPhotoset model.

### v0.1.3

* Small tweaks.

### v0.1.2

* Fix bug about env read from config file.

### v0.1.1

* Prefix all endpoints with `/api`.

### v0.1.0

* Initial release.
