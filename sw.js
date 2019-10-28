const CACHE ='Mujam2'
const FILES = [
  '/Iqra3/',
  '/Iqra3/index.html',
  '/Iqra3/iqra.css',
  '/Iqra3/icon.png',
  '/Iqra3/image/sura.png',
  '/Iqra3/Quran.txt',
  '/Iqra3/Kuran.txt',
  '/Iqra3/iqra.names',
  '/Iqra3/me_quran.ttf',
  '/Iqra3/manifest.json'
]
function installCB(e) {
  console.log('install', CACHE, e);
  e.waitUntil(
    caches.open(CACHE)
    .then(cache => cache.addAll(FILES))
    .catch(alert)
  )
}
self.addEventListener('install', installCB)

function cacheCB(e) { //cache first
  e.respondWith(
    caches.match(e.request)
    .then(r => {
       if (r) return r
       console.log('not in', CACHE, e.request.url)
       return fetch(e.request)
    })
    .catch(alert)
  )
}
self.addEventListener('fetch', cacheCB)

function activateCB(e) {
  console.log('activate', CACHE);
  e.waitUntil(
    caches.delete('VM')
    .then(r => { if (r) console.log('deleted VM') })
  )
}
addEventListener('activate', activateCB);

