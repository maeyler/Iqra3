const CACHE ='VM'
const FILES = [
  '/Iqra3/',
  '/Iqra3/iqra.names',
  '/Iqra3/Quran.txt',
  '/Iqra3/Kuran.txt',
  '/Iqra3/me_quran.ttf',
  '/Visual-Mujam/', 
  '/Visual-Mujam/Mujam.html',
  '/Visual-Mujam/Mujam.css',
  '/Visual-Mujam/Mujam.js',
  '/Visual-Mujam/data.txt',
  '/Visual-Mujam/Utilities.js'
]
function installCB(e) {
  console.log('install', e);
  e.waitUntil(
    caches.open(CACHE)
    .then(cache => cache.addAll(FILES))
    .catch(console.log)
  )
}
self.addEventListener('install', installCB)

function cacheCB(e) { //cache first
  let req = e.request, found = false;
  for (let f of FILES)
    if (req.url.endsWith(f)) {
      found = true; return
    }
  console.log('cache', req.url, found);
  let p = found? caches.match(req) : fetch(req)
  e.respondWith(
    p.then(r1 => r1, console.log)
  )
}
self.addEventListener('fetch', cacheCB)

