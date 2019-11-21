"use strict";
const PREF ='iqra', CACHE = PREF+'14'
const FILES = [
  '/Iqra3/',
  '/Iqra3/reader.html',
  '/Iqra3/mujam.html',
  '/Iqra3/code/common.js',
  '/Iqra3/code/reader.js',
  '/Iqra3/code/reader.css',
  '/Iqra3/code/mujam.js',
  '/Iqra3/code/mujam.css',
  '/Iqra3/code/utilities.js',
  '/Iqra3/code/buckwalter.js',
  '/Iqra3/data/Quran.txt',
  '/Iqra3/data/Kuran.txt',
  '/Iqra3/data/iqra.names',
  '/Iqra3/data/words.txt',
  '/Iqra3/data/refs.txt',
  '/Iqra3/image/sura.png',
  '/Iqra3/image/icon.png',
  '/Iqra3/image/iconF.png',
  '/Iqra3/image/me_quran.ttf',
  '/Iqra3/manifest.json'
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

