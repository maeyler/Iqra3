const CACHE ='VM'
const FILES = [
  '/Iqra3/index.html',
  '/Iqra3/iqra.css',
  '/Iqra3/icon.png',
  '/Iqra3/image/sura.png',
  '/Iqra3/Quran.txt',
  '/Iqra3/Kuran.txt',
  '/Iqra3/iqra.names',
  '/Iqra3/me_quran.ttf',
  '/Iqra3/manifest.json',
  '/Visual-Mujam/Mujam.html',
  '/Visual-Mujam/Mujam.css',
  '/Visual-Mujam/Mujam.js',
  '/Visual-Mujam/data.txt',
  '/Visual-Mujam/Utilities.js',
  '/Visual-Mujam/buckwalter.js',
  '/Visual-Mujam/images/small.png',
  '/Visual-Mujam/images/large.png',
  '/Visual-Mujam/manifest.json'
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
    if (req.url.includes(f)) {
      found = true; break
    }
  if (!found) console.log('not in cache', req.url);
  e.respondWith(
    found? caches.match(req) : fetch(req)
  )
}
self.addEventListener('fetch', cacheCB)

