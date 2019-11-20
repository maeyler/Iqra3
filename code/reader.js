"use strict";
//const DATA_URL = "https://maeyler.github.io/Iqra3/data/"; in common.js
const LEFT = 0xFD3E, RIGHT = 0xFD3F;
const M = 114; //suras
const names = new Array(M+1);
const first = new Array(M+1);
const P = 604; //pages
const qur = new Array(P+1);
const kur = new Array(P+1);
const LINK = "http://kuranmeali.com/Sayfalar.php?sayfa=";
const LS = location.protocol.startsWith('http') && localStorage;
const rootToList = new Map()
const wordToRoot = new Map()
const swipe = { t:0, x:0, y:0 }
var curSura, curPage;
var mujam, hashInProgress;
   
function doTrans() {
    if (html.style.display) {
      html.style.display = ''
      markW.style.display = ''
      text.style.display = ''
    } else { //hide html
      html.style.display = 'none'
      markW.style.display = 'none'
      text.style.display = 'inherit'
    }
}
function numberToArabic(n) { //n is an integer
    let t = ''
    for (let c of String(n)) 
      t += String.fromCodePoint(Number(c)+1632)
    return t
}
function forceSelection() {
    let s = getSelection().toString().trim()
    if (s) return s  //trim for Windows -- thank you Rajab
    else alert("Önce Arapça bir kelime seçin")
}
function markSelection() {
    let s = forceSelection()
    if (s) markPattern(s)
}
function markVerse(n) {
    markPattern('[^﴾﴿]*﴿'+numberToArabic(n)+'﴾?', 'gri')
    let e = new RegExp(n+'[\.-](.)+\n', 'g')
    let t = "<span class=gri>$&</span>"
    let p = kur[curPage].replace(e, t)
    text.innerHTML = p.replace(/\n/g, '<br>')
}
function markPattern(e, cls='mavi') {
    if (typeof e == "string")
        e = new RegExp(e, 'g')
    let t = "<span class="+cls+">$&</span>"
    let p = processBR(qur[curPage]);
    html.innerHTML = p.replace(e, t)
}
function suraFromPage(k) {
    let i = 1;
    while (k > first[i]) i++;
    if (k < first[i]) i--;
    return i;
}
function suraContainsPage(k) {
    if (curSura == M) return (k == P);
    let i = first[curSura];
    let j = first[curSura+1];
    if (i == j) return (k == i);
    return (i<=k && k<j);
}
function gotoPage(k) { // 1<=k<=P
//This is the only place where hash is set
    if (!k || k < 1) k = 1;
    if (k > P) k = P;
    k = Number(k);
    if (curPage == k) return;
    console.log('Page', k);
    setSura(suraFromPage(k));
    link.href = LINK+k;
    curPage = k;
    sayfa.value = k;
    slider.value = k;
    text.innerText = (kur[k]);
    html.innerHTML = processBR(qur[k]);
    document.title = 'Iqra p'+k;
    if (!hashInProgress)
        location.hash = '#p='+curPage 
        //# is added by the browser
    hashInProgress = false
    if (LS) localStorage.iqraPage = k
    hideMenu();  //html.scrollTo(0)
}
function setSura(k) { // 1<=k<=M
    k = Number(k);
    if (curSura == k) return;
    curSura = k;
    sure.value = k;
    isim.innerText = names[k]  //+" Suresi";
}
function gotoSura(k) {
    if (!k || k < 1)  k = 1;
    if (k > M) k = M;
    setSura(k);
    gotoPage(first[k]);
}
function dragSt(evt) {
    //evt.preventDefault()
    swipe.t = Date.now()
    swipe.x = Math.round(evt.touches[0].clientX)
    swipe.y = Math.round(evt.touches[0].clientY)
    //console.log("dragSt", swipe)
}
function drag(evt) {
    if (!swipe.t) return
    let trg = evt.target
    let dx = Math.round(evt.touches[0].clientX) - swipe.x
    let dy = Math.round(evt.touches[0].clientY) - swipe.y
    if (Math.abs(dx) < 3*Math.abs(dy)) { //not horizontal
        console.log("cancel", dx, dy)
        trg.style.transform = ""; swipe.t = 0; 
        return  //swipe cancelled
    }
    evt.preventDefault(); 
    let tr = "translate("+dx+"px, 0)"
    trg.style.transform = tr;
}
function dragEnd(evt) {
    if (!swipe.t) return
    let trg = evt.target
    evt.preventDefault()
    let dt = Date.now() - swipe.t
    let xx = evt.changedTouches[0].clientX
    let dx = Math.round(xx) - swipe.x
    let tr1 = trg.style.transform //initial
    trg.style.transform = ""; swipe.t = 0
    let w2 = 0  //animation width
    let W = trg.clientWidth
    if (dt>300 && 3*Math.abs(dx)<W) return
    //max 300 msec delay or min W/3 drag
    if (dx>=0 && curPage<P) { //swipe right
        gotoPage(curPage+1); w2 = W+"px"
    } 
    if (dx<0  && curPage>1) { //swipe left
        gotoPage(curPage-1); w2 = -W+"px"
    }
    if (!w2) return //page not modified
    if (!tr1) tr1 = "translate(0,0)"
    let tr2 = "translate("+w2+",0)" //final position
    //console.log("animate", tr2)
    trg.animate({transform:[tr1, tr2]}, 300)
}
function readNames(name) {
    function toNames(t) {
      let i = 0;
      for (let s of t.split('\n')) {
        i++; let j = s.indexOf('\t'); //TAB
        names[i] = s.substring(j+1);
        first[i] = Number(s.substring(0, j));
      }
      console.log(name, names.length); 
    }
    fetch(DATA_URL+name).then(x => x.text()).then(toNames)
}
function readText(name, array) {
    function toLines(t) {
      let a = t.split('¶');
      for (let i=0; i<a.length; i++) array[i] = a[i]    
      console.log(name, a.length); 
      if (qur[0] && kur[0]) initialPage();
    }
    fetch(DATA_URL+name).then(x => x.text()).then(toLines)
}
function readWords(name) {
    function toWords(t) {
      for (let s of t.split('\n')) {
        let [root, ...L] = s.split(' ');
        L = L.map(w => toArabic(w))
        rootToList.set(root, L);
        for (let w of L) wordToRoot.set(w, root)
      }
      console.log(name, rootToList.size, wordToRoot.size); 
    }
    fetch(DATA_URL+name).then(x => x.text()).then(toWords)
}
function processStr(s) {
    const bismi = /^(بِسْمِ|بِّسْمِ)/
    if (!s) return ''
    if (s[0] == '\n')  //first Page has a NL
      return processStr(s.substring(1))
    if (s.startsWith('سورة'))
      return '<div class=divider>'+s+'</div>'
    if (s.length<50 && bismi.test(s))
      return '<div class=besmele>'+s+'</div>'
    //default: ignore the last char LEFT
    return s  //.substring(0, s.length-2)
    //s+' &nbsp;' -- doesn't work
}
function processBR(page) {
    if (!page) return ''
    let a = page.split(/<BR>\n?/)
    return a.map(processStr).join('\n')
}
function gotoHashPage() {
//re-designed by Abdurrahman Rajab
  let h = location.hash.substring(1)
  //console.log("gotoHashPage", h)
  //omit first char '#', any text in Buckwalter
  if (!h.startsWith('p=') && !h.startsWith('v=')) 
    return false
  for (let e of h.split("&")) {
    let s = e.substring(2)
    switch (e.charAt(0)) {
      case 'p': // p=245
        gotoPage(s); break
      case 'r': // r=Sbr
        let L = rootToList.get(s)
        if (L) { //L is already in Arabic
          markPattern(L.join('|')); break
        } //else root not found -- down to 'w'
      case 'w': // w=yuwsuf
        markPattern(toArabic(s)); break
      case 'v': // v=12:90
        let [c, v] = s.split(':') 
        c = Number(c); v = Number(v)
        gotoPage(pageOf(c, v))
        markVerse(v); break
      default: 
        console.log("wrong hash" + e)
        return false
    }
  }
  hashInProgress = true; return true
}
function setHash(e){  //not used
    if (e)
      location.hash = 'p='+curPage+'&w='+toBuckwalter(e); 
    else
      location.hash = 'p='+curPage //# is added by browser
}
function initialPage() {
    if (!gotoHashPage()) {
      console.log("initialPage")
      gotoPage(LS? localStorage.iqraPage : 1)
    }
}
function initReader() {
    title.innerHTML = 'Iqra '+VERSION+'&emsp;';
    text.addEventListener("touchstart", dragSt);
    html.addEventListener("touchstart", dragSt);
    text.addEventListener("touchmove", drag);
    html.addEventListener("touchmove", drag);
    text.addEventListener("touchend", dragEnd);
    html.addEventListener("touchend", dragEnd);
    try {
        readNames("iqra.names"); readText("Quran.txt", qur); 
        readText("Kuran.txt", kur); readWords("words.txt");
    } catch(err) { 
        isim.innerText = err;
    }
    window.addEventListener("hashchange", gotoHashPage);
    //slider.focus(); 
    menuFn();
    //if (opener && opener.location.href.includes('Iqra3'))
      //  mujam = opener
}
/********************
 * Start of Menu functions -- added by Abdurrahman Rajab - FSMVU
 * Ref: https://dev.to/iamafro/how-to-create-a-custom-context-menu--5d7p
 */
function menuFn() {
  //let menuVisible = false;

  const doCopy = (s) => {
      navigator.clipboard.writeText(s)
      .then(() => {console.log('panoya:', s)})
      .catch(alert)
  }
  window.showMenu = () => { menu.style.display = 'block' }
  window.hideMenu = () => { menu.style.display = '' }
  const LINKF = 'https://a0m0rajab.github.io/BahisQurani/finder#w='
  
  options.onclick = (e) => {
      e.preventDefault()
      let m = e.target.innerText.charAt(0)
      //.toLowerCase() //.substring(0,4)
      if (m == 'i') {  //m.codePointAt(0) == 128712) '🛈'
          let s = title.innerText+'\nQuran Reader'
          alert(s+'\n(C) 2019 MAE')
          return
      } 
      let s = forceSelection() //s is not empty
      //if (!s) return
      switch (m) {
          case 'K': {
              doCopy(s); break
          }
          case 'F': {
              let ref = LINKF + s   //toBuckwalter(s);
              window.open(ref, "finder") //, "resizable,scrollbars")
              doCopy(s); hideMenu(); break
          }
          case 'M': {
              markPattern(s); let root = wordToRoot.get(s)
              console.log(s+' => '+root); hideMenu(); 
              if (!root) break
    let h = "#r="+root;
    const REF = "mujam.html";
    //window.open(REF + h, "mujam", "resizable,scrollbars");
    //if (!mujam || mujam.closed) {
      mujam = open(REF + h, "mujam"); //return
    //mujam.location.hash = h; mujam.focus(); 
              break
          }
          case 'S': {
              alert('Similar pages -- not implemented yet')
              break
          }
      }
  }
  document.onkeydown = (evt) => {
    if (evt.key == 'Escape') hideMenu()
  }
  document.onclick = (evt) => { 
    if (menu.style.display == '') return
    evt.preventDefault(); hideMenu() 
  }

  const setPosition = (x, y) => {
      let mw = menu.clientWidth || 220
      x = x - mw/2  //center over menu
      if (!title.clientWidth) { //narrow screen
        let cw = html.clientWidth || 400
        let cl = html.clientLeft  //must be 0
        x = Math.max(x, cl)       // x ≥ cl
        x = Math.min(x, cl+cw-mw-5) // x < cl+cw-mw
      //} else { //large screen
      }
      menu.style.left = (x)+'px'
      menu.style.top = (y-60)+'px'
      //console.log(x, y)
      showMenu()
  }
  html.oncontextmenu = (e) => {
      e.preventDefault()
      setPosition(e.clientX, e.clientY)
      return false
  }
}
/**
* End of menu functions 
***********************************************/

