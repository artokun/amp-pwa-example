# amp-pwa-example

Example AMP + PWA (with JSON-LD, Firebase Hosting)

All you have to do is just `git clone`, `npm i`, `gulp watch`.

If you have firebase, just run `firebase deploy` to host your binaries (remember to select 'dist' as your serving folder and initialize your project with `firebase init`)

Make sure to change all images, descriptions, contents as needed.

The Gulp file will generate the service worker, manifests, compile your sass into the header so that it is AMP compliant.
