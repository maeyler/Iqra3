"use strict";
/**
 * The code version.
 */
const VERSION = "V3.22c";

/**
 * html file extension -- empty for remote GitHub files
 *   in fast.io, we need full extension
 *
 * @see isRemote
 */
const EXT = /*isRemote()? '' : */ '.html'
/**
 * Location for data files
 */
const DATA_URL = "https://maeyler.github.io/Iqra3/data/";

/**
 * &emsp; used in both Mujam
 * used at report2 @see report2
 */
const EM_SPACE = String.fromCharCode(8195)

/**
 * Translating Arabic letters to Buckwalter.
 * 
 * uses BWC object in src="buckwalter.js"
 * code from https://github.com/stts-se/buckwalter-converter
 *
 * @param {string} s  Arabic string 
 * @returns {string}  Buckwalter transliteration 
 */
function toBuckwalter(s) {
    return BWC.convert(BWC.a2bMap, s).output
}

/**
 * Translating to Arabic letters back from Buckwalter.
 * 
 * @param {string} s  Buckwalter transliteration
 * @returns {string}  Arabic string
 */
function toArabic(s) {
    return BWC.convert(BWC.b2aMap, s).output
}

/**
 * Menu functions
 */
function setPosition(elt, x, y, mw=200) {
    mw = elt.clientWidth || mw
    x = x - mw/2  //center over parent
    let cw = document.body.clientWidth
    x = Math.max(x, 0)     // x ≥ 0
    x = Math.min(x, cw-mw) // x < cw-mw
    elt.style.left = (x)+'px'
    elt.style.top  = (y)+'px'
    elt.style.display = 'block'
}

function hideElement(elt) {
    elt.style.display = '' 
}

function openSitePage(s, p) {
  let url, name;
  switch (s) {
    case 'Y': case '?':  //Yardım
        url = 'guideQ'+EXT; name = 'NewTab'; break
    case 'K':
        url = "http://kuranmeali.com/Sayfalar.php?sayfa="+p
        name = "Kuran"; break
    default:
        let [c, v] = toCV(index[p]+1)
        openSiteVerse(s, c, v); return
  }
  window.open(url, name); hideMenus()
}

function openSiteVerse(s, c, v) {
  let url, name;
  switch (s) {
    case 'K':
        url = "http://kuranmeali.com/AyetKarsilastirma.php?sure="+c+"&ayet="+v
        name = "Kuran"; break
    case 'C':
        url = "http://corpus.quran.com/wordbyword.jsp?chapter="+c+"&verse="+v
        name = "Corpus"; break
    case 'Q':
        url = "https://quran.com/"+c+"/"+v
        name = "Quran"; break
    case 'A':
        url = "https://acikkuran.com/"+c+"/"+v
        name = "AcikK"; break
    case 'R':
        alert('Reader -- not implemented yet')
    default:  return
  }
  console.log(s, url)
  window.open(url, name); hideMenus()
}

function isRemote() {
    return location.protocol.startsWith('http')
}

