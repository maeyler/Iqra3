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
const CHECKED = '#ff7' // when the button is down
const swipe = { t:0, x:0, y:0 }
var curSura, curPage;
var mujam, hashInProgress;
   
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
    //console.log('markRoot '+root, n)
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
    let w = evt.target.innerText.trim()
    let r = wordToRoot.get(toBuckwalter(w))
    if (!r) { hideElement(out); return }
    evt.target.style.background = '#ddd'
    let n = rootToList.get(r).length
    out.innerText = toArabic(r)  //+' => '+n
    setPosition(out, evt.clientX, evt.pageY+10, 130)
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
    hideElement(out)  //; out.innerText = ''
}
function adjustPage(adj) {
    infoS.style.display = adj? 'block' : ''
    gotoPage(slider.value, adj)
    if (adj) {
      let s = sure.value+' -- '+pageS.innerText
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
    let wc = html.childElementCount
    console.log('Page '+k, wc+' words');
    for (let x of html.children) {
      x.onmouseenter = displayWord
      x.onmouseleave = hideWord
      x.oncontextmenu = selectWord
    }
    document.title = 'Iqra s'+k;
    if (!hashInProgress)
        location.hash = '#p='+curPage
        //history.pushState('', '', '#p='+curPage)
    hashInProgress = false
    if (LS) localStorage.iqraPage = k
    hideMenus();  //html.scrollTo(0)
}
function setSura(k) { // 1<=k<=M
    k = Number(k);
    if (curSura == k) return;
    curSura = k;
    sure.selectedIndex = k-1
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
      sure.innerHTML = '<option>'+labels.join('<option>')
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
      gotoPage(LS? localStorage.iqraPage : 1)
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
    sure.onchange  = () => {gotoSura(sure.selectedIndex+1)}
    sayNo.onchange = hidePage
    pageS.onclick  = showPage
    starB.onclick  = toggleStar
    trans.onclick  = toggleTrans
    linkB.onclick  = toggleMenuK
    zoomB.onclick  = toggleZoom
    showR.onclick  = toggleWords
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
              if (a.length > 0) {
                let p = a.join('&r=')
                mujam = window.open(LINKM + p, "mujam")
                for (let r of a) markWord(r, true); 
                console.log('mucem: r='+p)
              }
              else alert('Mucemde bulunamadı')
              break
          case 'B':
              alert('Similar pages -- not implemented yet')
          default:  return
      }
      hideMenus()
  }
  menuC.onclick = (evt) => {
      evt.preventDefault()
      menuItem(evt.target.innerText[0])
  }
  menuK.onclick = (evt) => {
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
          case 'T':
            toggleTrans(); break
          case 'M': case '.':
            evt.clientX = linkB.offsetLeft
            evt.clientY = linkB.offsetTop +10
            toggleMenuK(evt); break
          case 'Z': case '+':
            toggleZoom();  break
          case 'K':
            toggleWords(); break
      }
}
  window.hideMenus = () => { 
      hideElement(menuC); hideElement(menuK); hideElement(out)
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
function showPage() {
    if (sayNo.style.display) return
    sayfa.style.display = 'none'
    sayNo.style.display = 'inline'
    sayNo.value = curPage
}
function hidePage() {
    sayfa.style.display = ''
    sayNo.style.display = ''
    gotoPage(sayNo.value); 
}
function toggleStar() {
    if (starB.style.background) {
      starB.style.background = ''
      console.log("Remove bookmark ")
    } else {
      starB.style.background = CHECKED
      console.log("Bookmark "+curPage)
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
function toggleMenuK(evt) {
    if (linkB.style.background) {
      linkB.style.background = ''
      hideElement(menuK)
    } else {
      linkB.style.background = CHECKED
      hideElement(menuC)
      setPosition(menuK, linkB.offsetLeft, linkB.offsetTop+28, 130)
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
}

