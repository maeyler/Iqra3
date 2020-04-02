"use strict";

/**
 * The code version.
 */
const VERSION = "V3.28";

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
 * Menu functions -- place menu over elt
 * 
 * @param {Element} elt 
 * @param {number} x 
 * @param {number} y 
 * @param {number} mw menu width
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

/**
 * Make elt invisible
 * 
 * @param {Element} elt 
 */
function hideElement(elt) {
    elt.style.display = '' 
}

/**
 * Open remote site -- goto page p
 * 
 * @param {string} s site -- uppercase char
 * @param {number} p page
 */
function openSitePage(s, p) {
  let url, name;
  switch (s.toUpperCase()) {
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

/**
 * Open remote site -- goto (c, v)
 * 
 * @param {string} s site -- uppercase char
 * @param {number} c chapter
 * @param {number} v verse
 */
function openSiteVerse(s, c, v) {
  let url, name;
  switch (s.toUpperCase()) {
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

/**
 * Read text file from link, then invoke callback
 * 
 * @param {string} url 
 * @param {function} callback 
 */
async function fetch_text_then(url, callback) {
    // fetch(url).then(r => r.text()).then(report2)
    let r = await fetch(url) //response
    let t = await r.text()   //text
    callback(t)
}

/**
 * BeforeInstallPromptEvent saved for later use
 */
var pevt
/**
 * Prevent Chrome from showing the InstallPrompt
 * from  https://love2dev.com/blog/beforeinstallprompt/
 * 
 * @param {BeforeInstallPromptEvent} e 
 */
function beforeinstallCB(e) {
  function addToHomeScreen() {
    pevt.prompt()  //ask user
    pevt.userChoice.then(console.log)
    add2hs.style.display = 'none'
    pevt = null; hideMenus()
  }
    e.preventDefault(); pevt = e
    add2hs.style.display = '' //show button
    add2hs.onclick = addToHomeScreen
}
window.onbeforeinstallprompt = beforeinstallCB
add2hs.style.display = 'none' //hide button at start

// export {VERSION, DATA_URL, EM_SPACE, setPosition, hideElement, 
//     openSitePage, openSiteVerse, fetch_text_then}