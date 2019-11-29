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
var curSura, curPage, showWords;
var mujam, hashInProgress;
   
function doTrans() {
    if (html.style.display) {
      html.style.display = ''
      //markW.style.display = ''
      text.style.display = ''
    } else { //hide html
      html.style.display = 'none'
      //markW.style.display = 'none'
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
    //trim for Windows -- thank you Rajab
    let s = getSelection().toString().trim()
    if (s) return s
    else alert("Önce Arapça bir kelime seçin")
}
function markSelection() {
    let s = forceSelection()
    if (s) markPattern(s)
}
function markRoot(root, cls='mavi') {
    let n=0
    for (let x of html.children) {
      let b = toBuckwalter(x.innerText.trim())
      if (wordToRoot.get(b) != root) continue
      x.classList.add(cls); n++
    }
    console.log('markRoot '+root, n)
}
function markVerse(n, cls='gri') {
    //markPattern('[^﴾﴿]*﴿'+numberToArabic(n)+'﴾?', 'cls)
    let e = new RegExp(n+'[\.-](.)+\n', 'g')
    let t = '<span class='+cls+'>$&</span>'
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
function displayWord(evt) {
    if (!showWords) return
    let w = evt.target.innerText.trim()
    let r = wordToRoot.get(toBuckwalter(w))
    if (!r) { hideElement(out); return }
    evt.target.style.background = '#ddd'
    let n = rootToList.get(r).length
    out.innerText = toArabic(r)+' => '+n
    setPosition(out, evt.clientX, evt.clientY)
}
function selectWord(evt) {
    let s = window.getSelection()
    if (!s.toString()) { //select word
        let range = document.createRange();
        range.selectNodeContents(evt.target);
        s.removeAllRanges(); s.addRange(range);
    }
}
function unmarkWord(evt) {
    evt.target.style.background = ''
    hideElement(out)  //; out.innerText = ''
}
function gotoPage(k) { // 1<=k<=P
//This is the only place where hash is set
    if (!k || k < 1) k = 1;
    if (k > P) k = P;
    k = Number(k);
    if (curPage == k) return;
    setSura(suraFromPage(k));
    link.href = LINK+k;
    curPage = k;
    sayfa.value = k;
    slider.value = k;
    text.innerText = (kur[k]);
    html.innerHTML = processBR(qur[k]);
    let wc = html.childElementCount
    console.log('Page '+k, wc+' words');
    for (let x of html.children) {
      x.onmouseenter = displayWord
      x.onmouseleave = unmarkWord
      x.oncontextmenu = selectWord
    }
    document.title = 'Iqra s'+k;
    if (!hashInProgress)
        location.hash = '#p='+curPage 
    hashInProgress = false
    if (LS) localStorage.iqraPage = k
    hideMenus();  //html.scrollTo(0)
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
function dragStart(evt) {
    if (swipe.t>0  || menuC.style.display) return
    swipe.t = Date.now()
    swipe.x = Math.round(evt.touches[0].clientX)
    swipe.y = Math.round(evt.touches[0].clientY)
    //console.log("dragStart", swipe)
}
function drag(evt) {
    if (swipe.t==0 || menuC.style.display) return
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
    if (swipe.t==0 || menuC.style.display) return
    let trg = evt.target
    evt.preventDefault()
    let dt = Date.now() - swipe.t
    let xx = evt.changedTouches[0].clientX
    let dx = Math.round(xx) - swipe.x
    let tr1 = trg.style.transform //initial
    trg.style.transform = ""; swipe.t = 0
    let w2 = 0  //animation width
    let W = trg.clientWidth
    console.log(dt, dx, W)
    if (dt>300 && 3*Math.abs(dx)<W) return
    //max 300 msec delay or min W/3 drag
    if (dx>=5 && curPage<P) { //swipe right
        gotoPage(curPage+1); w2 = W+"px"
    } 
    if (dx<-5 && curPage>1) { //swipe left
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
      for (let i=0; i<a.length; i++) {
        array[i] = a[i]
      }
      console.log(name, a.length); 
      if (qur[0] && kur[0]) initialPage();
    }
    fetch(DATA_URL+name).then(x => x.text()).then(toLines)
}
function readWords(name) {
    function toWords(t) {
      for (let s of t.split('\n')) {
        let [root, ...L] = s.split(' ');
        //keep L in Buckwalter form
        //L = L.map(toArabic)
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
    let a = s.split(' ') //divide into words
    a.length-- //skip last char '\n'
    return '<span>'+a.join(' </span><span>')+' </span>'
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
        console.log(e, s)
        let L = rootToList.get(s)
        if (L) { //L must in in Arabic
          markRoot(s); break
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
function initialPage() {
    if (!gotoHashPage()) {
      console.log("initialPage")
      gotoPage(LS? localStorage.iqraPage : 1)
    }
}
function initReader() {
    title.innerHTML = 'Iqra '+VERSION+'&emsp;';
    text.addEventListener("touchstart", dragStart);
    html.addEventListener("touchstart", dragStart);
    text.addEventListener("touchmove", drag);
    html.addEventListener("touchmove", drag);
    text.addEventListener("touchend", dragEnd);
    html.addEventListener("touchend", dragEnd);
    geri.onclick   = () => {history.go(-1)}
    sure.onchange  = () => {gotoSura(sure.value)}
    sayfa.onchange = () => {gotoPage(sayfa.value)}
    trans.onclick  = doTrans
    //markW.onclick  = markSelection
    //markW.style.display = 'none'
    solBut.onclick = () => {gotoPage(curPage-1)}
    slider.onchange= () => {gotoPage(slider.value)}
    sagBut.onclick = () => {gotoPage(curPage+1)}
    test.onclick   = () => {showWords = !showWords}
    try {
        readNames("iqra.names"); readText("Quran.txt", qur); 
        readText("Kuran.txt", kur); readWords("words.txt");
    } catch(err) { 
        isim.innerText = err;
    }
    window.onhashchange = gotoHashPage
    window.name ="iqra" //by A Rajab
    menuFn(); 
}
/********************
 * Start of Menu functions -- added by Abdurrahman Rajab - FSMVU
 * Ref: https://dev.to/iamafro/how-to-create-a-custom-context-menu--5d7p
 *
 * We have two Menu elements: menuC (context)  menuK (open source)
 *
 */
function menuFn() {
  const LINKF = 'https://a0m0rajab.github.io/BahisQurani/finder#w='
  const LINKM = 'mujam.html#r='
  function menuItem(m) {
      if (m == 'I') {
          let s = title.innerText+'\nQuran Reader'
          alert(s+'\n(C) 2019 MAE'); return
      } 
      let s = forceSelection() //s is not empty
      switch (m) {
          case 'K':
              navigator.clipboard.writeText(s)
              .then(() => { console.log('Panoya:', s) })
              .catch(e => { alert('Panoya yazamadım\n'+e) })
              break
          case 'F':
              window.open(LINKF + s, "finder")
              break
          case 'M':
              let root = wordToRoot.get(toBuckwalter(s))
              if (root) {
                  mujam = window.open(LINKM + root, "mujam")
                  markRoot(root); //console.log(s+' => '+root)
              }
              else alert('Mucemde bulunamadı')
              break
          case 'B':
              alert('Similar pages -- not implemented yet')
              break
      }
      hideElement(menuC)
  }
  menuC.onclick = (evt) => {
      evt.preventDefault()
      menuItem(evt.target.innerText.charAt(0))
  }
  menuK.onclick = (evt) => {
      evt.preventDefault()
      let s= evt.target.innerText
      console.log(s)
      openSitePage(s[0], curPage)
  }
  menuK.onkeydown = (evt) => {
    if (evt.key == 'Escape') hideMenus()
    else menuItem(evt.key.toUpperCase())
  }
  document.onclick = (evt) => { 
      if (!menuC.style.display) return
      evt.preventDefault(); hideMenus() 
  }
  window.hideMenus = () => { 
      hideElement(menuC); hideElement(menuK); hideElement(out)
  }

  html.oncontextmenu = (evt) => {
      evt.preventDefault(); hideElement(menuK)
      setPosition(menuC, evt.clientX, evt.clientY)
  }
  link.onmouseenter = (evt) => {
      hideElement(menuC)
      setPosition(menuK, evt.clientX, evt.clientY)
  }
}
/**
* End of menu functions 
***********************************************/

