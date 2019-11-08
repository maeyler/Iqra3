"use strict";
const URL = "https://maeyler.github.io/Iqra3/data/";
const QUR = "Quran.txt"; 
const KUR = "Kuran.txt"; 
const NAM = "iqra.names";
const LEFT = 0xFD3E, RIGHT = 0xFD3F;
const M = 114; //suras
const names = new Array(M+1);
const first = new Array(M+1);
const P = 604; //pages
const qur = new Array(P+1);
const kur = new Array(P+1);
const LINK = "http://kuranmeali.com/Sayfalar.php?sayfa=";
const LS = location.protocol.startsWith('http') && localStorage;
const swipe = { t:0, x:0, y:0 }
var curSura, curPage;
var finder
   
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
    let s = getSelection().toString()
    if (s) return s
    else alert("Önce Arapça bir kelime seçin")
}
function markSelection() {
    let s = forceSelection()
    if (s) markPattern(s)
}
function markVerse(n) {
    markPattern('[^﴾﴿]*﴿'+numberToArabic(n)+'﴾?')
}
function markPattern(e, cls='mavi') {
  //if (e.constructor.name != "RegExp")
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
    location.hash = 'p='+k  //# is added by browser
    if (LS) localStorage.iqraPage = k
    //html.scrollTo(0);
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
function readNames() {
    function toNames(t) {
      let i = 0;
      for (let s of t.split('\n')) {
        i++; let j = s.indexOf('\t'); //TAB
        names[i] = s.substring(j+1);
        first[i] = Number(s.substring(0, j));
      }
      console.log("readNames", names.length); 
      //setTimeout(initialPage, 500)
    }
    fetch(URL+NAM).then(x => x.text()).then(toNames)
}
function readText(name, array) {
    function toLines(t) {
      let a = t.split('¶');
      for (let i=0; i<a.length; i++) array[i] = a[i]    
      console.log(name, a.length); 
      if (qur[0] && kur[0]) initialPage();
    }
    fetch(URL+name).then(x => x.text()).then(toLines)
}
function processStr(s) {
    const bismi = /^(بِسْمِ|بِّسْمِ)/
    if (!s) return ''
    if (s[0] == '\n')  //first Page has a NL
      return processStr(s.substring(1))
    if (s.startsWith('سورة'))
      return '<div class=ortala>'+s+'</div>'
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
  let h = location.hash
  if (!h.startsWith('#p=')) return false
  gotoPage(h.substring(3))
  return true
}
function initialPage() {
    if (!gotoHashPage()) {
      console.log("initialPage")
      gotoPage(LS? localStorage.iqraPage : 1)
    }
}
function initReader() {
    //title.innerText = document.title;
    text.addEventListener("touchstart", dragSt);
    html.addEventListener("touchstart", dragSt);
    text.addEventListener("touchmove", drag);
    html.addEventListener("touchmove", drag);
    text.addEventListener("touchend", dragEnd);
    html.addEventListener("touchend", dragEnd);
    //d4.style.overflowX = "hidden"; //for swipe right
    //html.style.direction = "rtl";
    try {
        readNames(); readText(QUR, qur); readText(KUR, kur);
    } catch(err) { 
        isim.innerText = ""+err;
    }
    window.addEventListener("hashchange", gotoHashPage);
    if (opener && opener.location.href.includes('Iqra3'))
        finder = opener
    //slider.focus(); 
    menuFn();
}
/********************
 * Start of Menu functions -- added by Abdurrahman Rajab - FSMVU
 * Ref: https://dev.to/iamafro/how-to-create-a-custom-context-menu--5d7p
 */
function menuFn() {
  const menu = document.querySelector(".menu");
  const options = document.querySelector(".options");
  //let menuVisible = false;

  const showMenu = () => { menu.style.display = "block" }
  const hideMenu = () => { menu.style.display = "" }
  
  options.onclick = (e) => {
      e.preventDefault()
      let s = forceSelection()
      let m = e.target.innerText.substring(0,4)
      if (s) switch (m) {
          case "Copy":
              navigator.clipboard.writeText(s)
              break
          case "Mark":
              markPattern(s)
              break
      }
      hideMenu()
  }
  document.onkeydown = (e) => {
    if (e.key == 'Escape') hideMenu()
  }
  document.onclick = (e) => { hideMenu() }

  const setPosition = (x, y) => {
      //cannot use menu.clientWidth
      let w = d4.clientWidth
      x = Math.min(x, w - 130) 
      menu.style.left = x+'px'
      let h = d4.clientHeight
      y = Math.min(y, h - 40) 
      menu.style.top = y+'px'
      showMenu()
  };
  html.oncontextmenu = (e) => {
      e.preventDefault()
      setPosition(e.clientX, e.clientY)
      return false
  }
}
/**
* End of menu functions 
***********************************************/

