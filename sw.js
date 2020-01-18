"use strict";
const PREF ='iqra', CACHE = PREF+'19'
const FILES = [
  'reader',
  'mujam',
  'reader.html',
  'mujam.html',
  'guide',
  'guideQ',
  'guideM',
  'code/main.css',
  'code/common.js',
  'code/reader.js',
  'code/reader.css',
  'code/mujam.js',
  'code/mujam.css',
  'code/utilities.js',
  'code/buckwalter.js',
  'data/Quran.txt',
  'data/Kuran.txt',
  'data/iqra.names',
  'data/words.txt',
  'data/refs.txt',
  'image/sura.png',
  'image/icon.png',
  'image/iconF.png',
  'image/me_quran.ttf',
  'image/Mucem_menu.png',
  'image/Iqra_dar.png',
  'image/Finder_meta.png',
  'image/Adem.jpg',
  'image/Three_windows.png',
  'image/Mucem_ktb.png',
  'image/Iqra_ktb.png',
  'manifest.json'
]

function installCB(e) {  //CB means call-back
  console.log(CACHE, e);
  e.waitUntil(
    caches.open(CACHE)
    .then(cache => cache.addAll(FILES))
    .catch(console.log)
  )
}
addEventListener('install', installCB)

function cacheCB(e) { //cache first
  e.respondWith(
    caches.match(e.request)
    .then(r => {
       if (r) return r
       console.log('not in', CACHE, e.request.url)
       return fetch(e.request)
    })
    .catch(console.log)
  )
}
addEventListener('fetch', cacheCB)

function removeOld(L) {
  return Promise.all(L.map(key => {
    if (!key.startsWith(PREF) || key == CACHE)
       return null;
    console.log('deleted', key)
    return caches.delete(key)
  }))
}
function activateCB(e) {
  console.log(CACHE, e);
  e.waitUntil(
    caches.keys().then(removeOld)
  )
}
addEventListener('activate', activateCB);

