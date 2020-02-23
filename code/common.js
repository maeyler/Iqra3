"use strict";
import * as bw from "./buckwalter.js";
/**
 * The code version.
 */
export const VERSION = "V3.24T";

/**
 * Location for data files
 */
export const DATA_URL = "https://maeyler.github.io/Iqra3/data/";
// to modules...
/**
 * &emsp; used in both Mujam
 * used at report2 @see report2
 */
export const EM_SPACE = String.fromCharCode(8195)

/**
 * Translating Arabic letters to Buckwalter.
 * 
 * uses bw.BWC object in src="buckwalter.js"
 * code from https://github.com/stts-se/buckwalter-converter
 *
 * @param {string} s  Arabic string 
 * @returns {string}  Buckwalter transliteration 
 */
export function toBuckwalter(s) {
    return bw.BWC.convert(bw.BWC.a2bMap, s).output
}

/**
 * Translating to Arabic letters back from Buckwalter.
 * 
 * @param {string} s  Buckwalter transliteration
 * @returns {string}  Arabic string
 */
export function toArabic(s) {
    return bw.BWC.convert(bw.BWC.b2aMap, s).output
}

/**
 * Menu export functions
 */
export function setPosition(elt, x, y, mw=200) {
    mw = elt.clientWidth || mw
    x = x - mw/2  //center over parent
    let cw = document.body.clientWidth
    x = Math.max(x, 0)     // x ≥ 0
    x = Math.min(x, cw-mw) // x < cw-mw
    elt.style.left = (x)+'px'
    elt.style.top  = (y)+'px'
    elt.style.display = 'block'
}

export function hideElement(elt) {
    elt.style.display = '' 
}

export function openSitePage(s, p) {
  let url, name;
  switch (s) {
    case 'Y': case '?':  //Yardım
        url = 'guideQ.html'; name = 'NewTab'; break
    case 'K':
        url = "http://kuranmeali.com/Sayfalar.php?sayfa="+p
        name = "Kuran"; break
    default:
        let [c, v] = toCV(index[p]+1)
        openSiteVerse(s, c, v); return
  }
  window.open(url, name); hideMenus()
}

export function openSiteVerse(s, c, v) {
  let url, name;
  switch (s) {
    case 'K':
        url = "http://kuranmeali.com/AyetKarsilastirma.php?sure="+c+"&ayet="+v
        name = "Kuran"; break
    case 'C':
        url = "http://corpus.quran.com/wordbyword.jsp?chapter="+c+"&verse="+v
        name = "NewTab"; break
    case 'Q':
        url = "https://quran.com/"+c+"/"+v
        name = "NewTab"; break
    case 'A':
        url = "https://acikkuran.com/"+c+"/"+v
        name = "NewTab"; break
    case 'R':
        alert('Reader -- not implemented yet')
    default:  return
  }
  console.log(s, url)
  window.open(url, name); hideMenus()
}

export function isRemote() {
    return location.protocol.startsWith('http')
}

export * from './common.js';