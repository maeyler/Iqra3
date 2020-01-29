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
const rootToList = new Map()
const wordToRoot = new Map()
const CHECKED = '#ff7' // color when the button is down
const swipe = { t:0, x:0, y:0 }
var curSura, curPage, bilgi;
var mujam, hashInProgress, bookmarks;

const LS = location.protocol.startsWith('http') && localStorage;
const DEFAULT = {page:1, roots:true, marks:[71,573,378]}
function getStorage() {
    if (!LS || !localStorage.iqra) return DEFAULT
    return JSON.parse(localStorage.iqra)
}
function setStorage() {
    if (!LS) return
    let page  = curPage
    let roots = showR.style.background? true : false
    let marks = [...bookmarks]
    let pref = {page, roots, marks}
    localStorage.iqra = JSON.stringify(pref)
      /*if (LS) {
          let a = [...bookmarks]
          localStorage.bookmarks = a.join(' ')
      }*/
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
function markWord(w, root, cls='mavi') {
    let n=0
    for (let x of html.children) {
      let b = toBuckwalter(x.innerText.trim())
      if (root) b = wordToRoot.get(b)
      if (b != w) continue
      x.classList.add(cls); n++
    }
}
function markVerse(n, cls='gri') {
    //markPattern('[^﴾﴿]*﴿'+numberToArabic(n)+'﴾?', 'cls)
    let e = new RegExp(n+'[\.-](.)+\n', 'g')
    let t = '<span class='+cls+'>$&</span>'
    let p = kur[curPage].replace(e, t)
    text.innerHTML = p.replace(/\n/g, '<br>')
}
function markPattern(e, cls='mavi') { //not used
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
    if (!showR.style.background) return
    let t = evt.target
    let w = t.innerText.trim()
    let r = wordToRoot.get(toBuckwalter(w))
    if (!r) { hideElement(bilgi); return }
    let n = rootToList.get(r).length
    bilgi.innerText = toArabic(r)  //+' => '+n
    t.style.background = '#ddd'; t.append(bilgi)
    let y = t.offsetTop + t.offsetHeight
    setPosition(bilgi, t.offsetLeft+24, y-6, 105)
}
function selectWord(evt) {
    let s = window.getSelection()
    if (!s.toString()) { //select word
        let range = document.createRange();
        range.selectNodeContents(evt.target);
        s.removeAllRanges(); s.addRange(range);
    }
}
function hideWord(evt) {
    evt.target.style.background = ''
    hideElement(bilgi)
}
function adjustPage(adj) {
    infoS.style.display = adj? 'block' : ''
    gotoPage(slider.value, adj)
    if (adj) {
      let s = sureS.value+' -- Sayfa '+slider.value
      infoS.innerText = s
    }
}
function gotoPage(k, adjusting) { // 1<=k<=P
//This is the only place where hash is set
    if (!k || k < 1) k = 1;
    if (k > P) k = P;
    k = Number(k);
    sayfa.innerText = k;
    if (curPage == k) return;
    setSura(suraFromPage(k));
    if (adjusting) return;
    curPage = k;
    slider.value = k;
    text.innerText = (kur[k]);
    html.innerHTML = processBR(qur[k]);
    starB.style.background = 
        bookmarks.has(k)? CHECKED : ''
    let wc = html.childElementCount
    console.log('Page '+k, wc+' words');
    for (let x of html.children) {
      x.onmouseenter = displayWord
      x.onmouseleave = hideWord
      x.oncontextmenu = selectWord
    }
    bilgi = document.createElement('span')
    bilgi.id = 'bilgi'; document.body.append(bilgi)
    bilgi.onclick = 
      () => {openMujam(toBuckwalter(bilgi.innerText))} 
    document.title = 'Iqra s'+k;
    if (!hashInProgress)
        location.hash = '#p='+curPage
        //history.pushState('', '', '#p='+curPage)
    hashInProgress = false
    setStorage()
    //if (LS) localStorage.iqraPage = k
    hideMenus();  //html.scrollTo(0)
}
function setSura(k) { // 1<=k<=M
    k = Number(k);
    if (curSura == k) return;
    curSura = k;
    sureS.selectedIndex = k-1
}
function gotoSura(k) {
    if (!k || k < 1)  k = 1;
    if (k > M) k = M;
    setSura(k);
    gotoPage(first[k]);
}
function dragStart(evt) {
    if (menuK.style.display || menuC.style.display) {
        hideMenus(); evt.preventDefault(); return
    }
    if (swipe.t>0) return
    swipe.t = Date.now()
    swipe.x = Math.round(evt.touches[0].clientX)
    swipe.y = Math.round(evt.touches[0].clientY)
    //console.log("dragStart", swipe)
}
function drag(evt) {
    if (swipe.t==0) return
    let trg = evt.target
    while (trg && trg.tagName != 'DIV')
        trg = trg.parentElement
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
    if (swipe.t==0) return
    let trg = evt.target
    while (trg && trg.tagName != 'DIV')
        trg = trg.parentElement
    let dt = Date.now() - swipe.t
    let xx = evt.changedTouches[0].clientX
    let dx = Math.round(xx) - swipe.x
    let tr1 = trg.style.transform //initial
    console.log("dragEnd", tr1, trg.tagName)
    trg.style.transform = ""; swipe.t = 0
    let w2 = 0  //animation width
    let W = trg.clientWidth
    console.log(dt, dx, W)
    const K = 60  //too little movement
    if (-K<=dx && dx<=K) return
    evt.preventDefault()
    //max 300 msec delay or min W/3 drag
    if (dt>300 && 3*Math.abs(dx)<W) return
    if (dx>K  && curPage<P) { //swipe right
        gotoPage(curPage+1); w2 = W+"px"
    } 
    if (dx<-K && curPage>1) { //swipe left
        gotoPage(curPage-1); w2 = -W+"px"
    }
    if (!w2) return //page not modified
    if (!tr1) tr1 = "translate(0,0)"
    let tr2 = "translate("+w2+",0)" //final position
    console.log("animate", tr2)
    trg.animate({transform:[tr1, tr2]}, 300)
}
function readNames(name) {
    function toNames(t) {
      let i = 0, labels = []
      for (let s of t.split('\n')) {
        i++; //skip 0
        let [f, n] = s.split('\t'); //TAB
        names[i] = n; labels.push(i+'. '+n)
        first[i] = Number(f)
      }
      console.log(name, names.length); labels.pop()
      sureS.innerHTML = '<option>'+labels.join('<option>')
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
//all text is in Buckwalter
//omit first char '#'
  let h = location.hash.substring(1)
  if (!h.startsWith('p=') && !h.startsWith('v=')) 
    return false
  for (let e of h.split('&')) {
    let s = e.substring(2)
    switch (e.charAt(0)) {
      case 'p': // p=245
        gotoPage(s); break
      case 'r': // r=Sbr
        let L = rootToList.get(s)
        if (L) markWord(s, true)
        break
      case 'w': // w=yuwsuf
        for (let t of decodeURI(s).split(' '))
          markWord(t, false)
          //markPattern(toArabic(t))
        break
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
      let k = getStorage().page || 1
      gotoPage(k)
    }
}
function initReader() {
    title.innerHTML = 'Iqra -- Oku'+'&emsp;';
    version.innerText = 'Iqra '+VERSION;
    text.addEventListener("touchstart", dragStart);
    html.addEventListener("touchstart", dragStart);
    text.addEventListener("touchmove", drag);
    html.addEventListener("touchmove", drag);
    text.addEventListener("touchend", dragEnd);
    html.addEventListener("touchend", dragEnd);
    sureS.onchange = () => {gotoSura(sureS.selectedIndex+1)}
    sayNo.onkeydown= keyToPage
    pageS.onclick  = handleStars
    trans.onclick  = toggleTrans
    starB.onclick  = toggleStar
    linkB.onclick  = toggleMenuK
    zoomB.onclick  = toggleZoom
    showR.onclick  = toggleWords
    //bilgi.onclick -- do on each page
    leftB.onclick  = () => {gotoPage(curPage-1)}
    slider.oninput = () => {adjustPage(true)}
    slider.onchange= () => {adjustPage(false)} //committed
    rightB.onclick = () => {gotoPage(curPage+1)}
    try {
        readNames("iqra.names"); readText("Quran.txt", qur); 
        readText("Kuran.txt", kur); readWords("words.txt");
    } catch(err) { 
        console.log(err)
    }
    let {roots, marks} = getStorage()
    //we cannot use page yet, files are not read -- see initialPage()
    showR.style.background = roots? CHECKED : ''
    bookmarks = new Set()
    if (/*LS && localStorage.book*/ marks) {
        //let marks = localStorage.bookmarks.split(' ')
        for (let k of marks) bookmarks.add(Number(k))
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
//const EXT  defined in common.js
var LINKF = '../BahisQurani/finder'+EXT+'#w='
var LINKM = 'mujam'+EXT+'#r='
function openMujam(...a) { //array of roots in Buckwalter
    let p = a.join('&r=')
    mujam = window.open(LINKM + p, "mujam")
    for (let r of a) markWord(r, true); 
    console.log('mucem: r='+p)
}
function menuFn() {
  function menuItem(m) {
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
              let a = []
              for (let w of s.split(' ')) {
                let r = wordToRoot.get(toBuckwalter(w))
                if (r) a.push(r)
              }
              if (a.length > 0) openMujam(...a)
              else alert('Mucemde bulunamadı')
              break
          case 'B':
              alert('Similar pages -- not implemented yet')
          default:  return
      }
      hideMenus()
  }
  menuC.onclick = (evt) => { //context menu
      evt.preventDefault()
      menuItem(evt.target.innerText[0])
  }
  menuS.onclick = (evt) => { //bookmarks menu
      evt.preventDefault()
      let t = evt.target.innerText
      //console.log(curPage, t)
      let [x, k] = t.split(/s| /)
      if (Number(k)) gotoPage(Number(k))
      //setStorage() done in gotoPage
  }
  menuK.onclick = (evt) => { //ellipsis menu
      evt.preventDefault()
      openSitePage(evt.target.innerText[0], curPage)
  }
  document.onkeydown = (evt) => {
      let k = evt.key.toUpperCase()
      if (evt.key == 'Escape') 
          hideMenus()
      else if (evt.key == 'F1') 
          openSitePage('Y') //Yardım
      else if (menuC.style.display)
          menuItem(k)
      else if (menuK.style.display)
          openSitePage(k, curPage)
      else switch (k) {
          case 'ARROWLEFT':
            if (!evt.altKey && !evt.ctrlKey)
              {gotoPage(curPage-1); evt.preventDefault()}
            break
          case 'ARROWRIGHT':
            if (!evt.altKey && !evt.ctrlKey)
              {gotoPage(curPage+1); evt.preventDefault()}
            break
          case 'T':
            toggleTrans(); break
          case '*':
            toggleStar(); break
          case 'M': case '.':
            evt.clientX = linkB.offsetLeft
            evt.clientY = linkB.offsetTop +10
            toggleMenuK(evt); break
          case 'Z': case '+':
            toggleZoom();  break
          case 'K':
            toggleWords(); break
          default: return
      }
}
  window.hideMenus = () => { 
      hideElement(menuC); hideElement(menuK); 
      hideElement(menuS); hideElement(bilgi)
      linkB.style.background = ''
  }

  html.oncontextmenu = (evt) => {
      evt.preventDefault(); 
      hideElement(menuK); linkB.style.background = ''
      setPosition(menuC, evt.clientX, evt.clientY-60, 220)
  }
}
/**
* End of menu functions 
***********************************************/
function keyToPage(evt) {
    if (evt.key == 'Escape') {
      hideElement(menuS)
    } else if (evt.key == 'Enter') {
      gotoPage(sayNo.value)
      hideElement(menuS)
    }
}
function toggleTrans() {
    if (trans.style.background) {
      html.style.display = ''
      text.style.display = ''
      trans.style.background = ''
    } else { //hide html
      html.style.display = 'none'
      text.style.display = 'block'
      trans.style.background = CHECKED
    }
}
function makeStarMenu() {
    const span = '<span class="menuK">'
    let t = ''
    let a = [...bookmarks].reverse()
    for (let k of a) if (k != curPage)
        t += span+'s'+k+' '+names[suraFromPage(k)]+'</span>\n'
    starred.innerHTML = t
}
function displayMenu(m, e, w) {
      setPosition(m, e.offsetLeft+27, e.offsetTop+27, w)
}
function handleStars() {
    if (menuS.style.display) {
      hideElement(menuS)
    } else {
      hideMenus(); makeStarMenu()
      displayMenu(menuS, pageS, 90)
      sayNo.value = curPage
      sayNo.select(0,3); sayNo.focus()
    }
}
function toggleStar() {
    if (starB.style.background) {
      starB.style.background = ''
      bookmarks.delete(curPage)
    } else {
      starB.style.background = CHECKED
      bookmarks.add(curPage)
    }
    setStorage()
}
function toggleMenuK() {
    if (linkB.style.background) {
      linkB.style.background = ''
      hideElement(menuK)
    } else {
      hideMenus(); linkB.style.background = CHECKED
      displayMenu(menuK, linkB, 120)
    }
}
function toggleZoom() {
    if (zoomB.style.background) {
      div2.style.transform = ''
      zoomB.style.background = ''
    } else {
      div2.style.transform ='scale(1.16) translate(0, 8%)'
      zoomB.style.background = CHECKED
    }
}
function toggleWords() {
    if  (showR.style.background)
         showR.style.background = ''
    else showR.style.background = CHECKED
    setStorage()
}

