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
function markSelection() {
    let s = getSelection().toString()
    if (!s) alert("Select some Arabic text")
    else markPattern(s)
}
function numberToArabic(n) { //n is an integer
    let t = ''
    for (let c of String(n)) 
      t += String.fromCodePoint(Number(c)+1632)
    return t
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
function doTouchS(evt) {
    //evt.preventDefault()
    swipe.t = new Date().getTime()
    swipe.x = evt.touches[0].pageX
    swipe.y = evt.touches[0].pageY
}
function doTouchE(evt) {
    //evt.preventDefault()
    let ct = evt.changedTouches
    if (ct.length == 0) return
    let dt = new Date().getTime() - swipe.t
    if (dt > 300) return //max time
    let dx = Math.abs(ct[0].pageX - swipe.x)
    let dy = Math.abs(ct[0].pageY - swipe.y)
    //console.log(dt, dx, dy)
    if (dx < 40) return //min distance
    if (dx < 8*dy) return //not horizontal
    let right = ct[0].pageX > swipe.x
    console.log("swipe "+(right? "R" : "L"))
    gotoPage(right? curPage+1 : curPage-1)
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
    return s.substring(0, s.length-2)
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
    text.addEventListener("touchstart", doTouchS);
    html.addEventListener("touchstart", doTouchS);
    text.addEventListener("touchend", doTouchE);
    html.addEventListener("touchend", doTouchE);
    try {
        readNames(); readText(QUR, qur); readText(KUR, kur);
    } catch(err) { 
        isim.innerText = ""+err;
    }
    window.addEventListener("hashchange", gotoHashPage);
    if (opener && opener.location.href.includes('Mujam'))
        finder = opener
    //slider.focus(); 
}

