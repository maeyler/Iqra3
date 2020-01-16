"use strict";
/**
 * div element that shows page info
 */
var bilgi;
/**
 * Global array to hold the places of Sajda.
 * used in marking sajdah verses
 *
 * @see displayRef 
 */
var sajda;
/**
 * child window (or tab) to display Quran
 * the same window is used on each click
 * (this is much better than <a> tag)
 */
var iqra;
/**
 * A map holds the letters and its roots.
 * set at report2 @see report2
 */
const letterToRoots = new Map();
/**
 * A map holds the roots and its words.
 * set at report2 @see report2
 */
const rootToWords = new Map();
/**
 * A map holds the roots and its counts.
 * set at report2 @see report2
 */
const rootToCounts = new Map();
/**
 * A map holds the words and its references.
 * set at report2 @see report2
 */
const wordToRefs = new Map();
/**
 * returns Buckwalter code of the current item in menu2
 */
function currentRoot() {
    if (!menu2.value) return null
    let [v] = menu2.value.split(EM_SPACE)
    return toBuckwalter(v)
}

/**
 * 
 * Used to parse indexes from a string encoded by encode36 and add it to index array (indA)
 * 
 * @param {string} str The chapter number.
 * @param {Array} indA index. 
 * 
 */
function addIndexes(str, indA) {
    for (let j = 0; j < str.length; j += 3) {
        let code = str.substring(j, j + 3);
        indA.push(decode36(code));
    }
}
/**
 * 
 * Get the page of index and add it to page array and the holded verses of the page to refA array.
 * note that: Page array are equal to refA array.
 * 
 * @param {array} indA index array which parsed from add indexes.
 * @returns {array} The index(page number,refA string). 
 * 
 */
function indexToArray(indA) {
    let page = [],
        refA = [],
        prev = -1;
    for (let i of indA) {
        let [c, v] = toCV(i);
        let cv = c + ":" + v;
        let p = pageOf(c, v);
        // if the page are same as before.
        if (prev == p)
        // get pop() as the last element of the array, 
        // then add CV at the end 
            cv = refA.pop() + " " + cv;
        else {
            page.push(p);
            prev = p
        }

        refA.push(cv);
    }
    // only used in tests.
    page.push(999); //999 is sentinel
    return [page, refA];
}
/**
 * Add indexes to array, then parse this array with its pages.
 * @see addIndexes
 * @see indexToArray. 
 * @param {str} str index array which parsed from add indexes.
 * @returns {array} array holds pages number and references number 
 * 
 */
function parseRefs(str) {
    let indA = [];
    addIndexes(str, indA);
    return indexToArray(indA)
}
/**
 * Parsing and using remote data. 
 * @see makeMenu
 * 
 * @param {string} t text from remote data.
 */
function report2(t) {
    function convert(s) {
        let [w, n] = s.split(' ')
        let a = toArabic(w)
        //convert space to em-space " "
        return [a, a+EM_SPACE+n] 
    }
    let line = t.split('\n')
    let m = line.length - 1
    console.log(t.length + " chars " + m + " lines");
    let i = 0;
    while (i < m) { //for each line
        let [root, number] = convert(line[i])
        rootToCounts.set(root, number);
        let j = i + 1
        let list = []
        while (j < m) {
            let [xxx, s] = convert(line[j])
            let k = s.indexOf('\t')
            if (k <= 0) break;
            let word = s.substring(0, k)
            let refs = s.substring(k + 1)
            wordToRefs.set(word, refs)
            list.push(word); j++;
        }
        i = j;
        list.sort();
        let ch = root[0]; //first char
        let x = letterToRoots.get(ch);
        if (x) x.push(number);
        else letterToRoots.set(ch, [number]);
        rootToWords.set(number, list);
    }
    let keys = [...letterToRoots.keys()];
    // sort the root list for each letter
    for (let k of keys) letterToRoots.get(k).sort()
    // sort and set menu1 (letters)
    makeMenu(menu1, keys.sort());
    if (!gotoHashRoot()) selectRoot("سجد");
}
/**
 * Read data file from link, then parse it.
 * @see report2
 */
function readData() {
    out2.innerText = "Reading data";
    //const DATA_URL = "https://maeyler.github.io/Iqra3/data/" in common.js
    fetch(DATA_URL+"refs.txt")
        .then(r => r.text()) //response
        .then(report2); //text
}

/**
 * Make the targeted menu the document has three.(letters, roots, words)
 * The first element  will be selected.
 * 
 * @param {object} m trgeted menu object (html) to create.
 * @param {array} a array elements of the menu.
 */
function makeMenu(m, a) { //first item is selected
    if (a) m.innerHTML = "<option selected>" + a.join("<option>");
}
/**
 * Select the letter from the menu, if no parameter entered the letter will be the menu1 value.
 * Then create menu2 based on the selected character.
 * @see makeMenu
 * 
 * @param {string} ch letter to be selected (Arabic)
 */
function selectLetter(ch) {
    if (!ch) ch = menu1.value;
    else if (ch == menu1.value) return;
    else menu1.value = ch;
    makeMenu(menu2, letterToRoots.get(ch));
    menu2.value = '';
}
/**
 * select specified root, if undefined the menu2 value will be the selected.
 * 
 * @param {string} root to be seleceted, example: سجد 23
 */
function selectRoot(root, modifyHash=true) { //root in Arabic 
    if (!root) [root] = menu2.value.split(EM_SPACE);
    else if (menu2.value.startsWith(root)) return;
    else {
      selectLetter(root.charAt(0))
      menu2.value = rootToCounts.get(root);
    }
    let cnt = rootToCounts.get(root);
    let list = rootToWords.get(cnt);
    let nL = list? list.length : 0;
    if (list) makeMenu(menu3, list);
    if (nL > 1)
        menu3.selectedIndex = -1; //do not select Word
    menu3.disabled = (nL == 1);
    menu3.style.color = (nL == 1 ? "gray" : "");
    //combine refs in list
    combine.hidden = true;
    if (!modifyHash) return
    /*let indA = []; handled by gotoHashRoot()
    for (let j = 0; j < nL; j++) {
        let str = wordToRefs.get(list[j]);
        addIndexes(str, indA);
    }
    indA.sort((a, b) => (a - b));
    displayRef(root, indexToArray(indA));*/
    //replace special chars
    let b = encodeURI(toBuckwalter(root))
    location.hash = "#r=" + b;
    //history.pushState('', '', "#r=" + b)
    showSelections(true)
}
/**
 * Select word, if undefined menu3 values will be the selected one.
 * when its used combine will be shown.
 * @see displayRef
 * @see parseRefs
 * @see wordToRefs
 * 
 * get the references from wordsToRefs map.
 * 
 * @param {*} word to be selected.
 */
function selectWord(word) { //called by menu3 only
    if (!word) word = menu3.value;
    else if (word == menu3.value) return;
    else menu3.value = word;
    combine.hidden = false;
    let str = wordToRefs.get(word);
    //let [page, refA] = parseRefs(str);
    displayRef(word, parseRefs(str));
}
/**
 * display specified roots, hide the menus.
 * 
 * @param {Array} roots to be displayed
 */
function getIndicesOf(root) {
    let cnt = rootToCounts.get(root);
    let list = rootToWords.get(cnt);
    let indA = [];
    for (let w of list) {
        addIndexes(wordToRefs.get(w), indA);
    }
    indA.sort((a, b) => (a - b));
    return indA
}
function displayRoots(ra) { //root array in Arabic
    //console.log(ra)
    if (!ra.length) throw "displayRoots: "+ra.length
    let i1 = getIndicesOf(ra[0]);
    for (let k=1; k<ra.length; k++) {
       let i2 = getIndicesOf(ra[k])
       i1 = i1.filter(x=> i2.includes(x)) //intersection
    }
    displayRef(ra.join('+'), indexToArray(i1));
    selectRoot(ra[0], false)  //adjust menus
}
/**
 * Create and build the HTML table to show the information on it.
 * 
 * @param {String} word: on single word
 * @param {Array} page: Array of page numbers
 * @param {Array} refA Array of page references (chapter:verse ..)
 */
function displayRef(word, [page, refA]) {
    // put three zeros on the first of the number (K)
    function threeDigits(k) { //same as (""+k).padStart(3,"0")
        let s = "" + k;
        while (s.length < 3) s = "0" + s;
        return s;
    }
    // get colour based on the number of verses in a page.
    // why not to use 3 colour heat map? or HSL ??
    function toColor(n) {
        if (n == 0) return "";
        if (n > 15) n = 15;
        let g = 255 - 16 * n,
            b = 160 - 10 * n;
        let col = "rgb(" + g + ", " + g + ", " + b + ")";
        return "background: " + col;
    }
    // m number of juzz, 20 pages per juzz.
    // make the table
    const m = 30, n = 20;
    let row = "<th>Sayfa</th>";
    for (let j = 1; j <= n; j++) {
        row += "<th>" + (j % 10) + "</th>"; //use last digit
    }
    let text = "<tr>" + row + "</tr>";
    let pn = 0,
        p = 0,
        q = 0,
        nc = 0;
    pRefs.length = 1; //start with empty array
    for (let i = 1; i <= m + 1; i++) {
        // pn == 20*(i-1);   //s2 is hidden
        let z = i > m ? m : i;
        let s2 = ''  //"<span class=t1>Cüz " + z + "</span>";
        row = "<th class=first>" +threeDigits(pn)+ s2 + "</th>";
        let U = i > m ? 4 : n;
        for (let j = 1; j <= U; j++) {
            pn++; //page number
            let c = 0;
            if (pn == page[p]) {
                c = refA[p].split(" ").length;
                let k = refA[p].indexOf(":");
                k = (k < 0 ? 0 : Number(refA[p].substring(0, k)));
                let refs = "S."+pn+' '+sName[k] +EM_SPACE+ refA[p];
                if (c > 1) refs += EM_SPACE+"("+ c +")";
                //s2 = "<span class=t2>" + refs + "</span>";
                pRefs.push(refs); p++;
                nc += c;
            } else {
                pRefs.push('') //no refs on this page
                //s2 = "<span class=t1>" + pLabel[pn] + "</span>";
            }
            let ch = "&nbsp;"
            if (pn == sajda[q]) {
                ch = "۩"; q++;
            }
            row += "<td style='" +toColor(c)+"'>"+ ch + "</td>";
        }
        if (i > m) { //use th for the last row
          row += "<th colspan=13>Iqra "+VERSION+" (C) 2019 MAE</th>"
           +"<th id=corpus colspan=3 onClick=doClick2()>Corpus</th>"
        }
        text += "<tr>" + row + "</tr>";
    }
    // end of table
    tablo.innerHTML = text;
    tablo.oncontextmenu = showMenuK;
    document.title = TITLE + " -- " + word;
    let nn = refA.length
    out1.innerText = nn + " sayfa"
    out2.innerText = nn +EM_SPACE+ word
    console.log(word, nn)
    for (let x of tablo.querySelectorAll('td')) {
      x.onmouseenter = doHover
      x.onmouseleave = () => {
        if (!menuK.style.display) hideElement(bilgi)
      }
      //x.onmouseup = doClick -- implement later
    }
    bilgi = document.createElement('div') //lost within table
    bilgi.id = 'bilgi'; document.body.append(bilgi)
    bilgi.onclick = doClick
}

/**
 * Open the quran webPage after checking it's event.
 * 
 * @param {*} evt get the event trigger. 
 */
function doClick(evt) {
    //do not handle if menuK is on or bilgi is off
    if (menuK.style.display || !bilgi.style.display) return
    evt.preventDefault()
    let [nam, ref] = bilgi.innerText.split(EM_SPACE)
    let [xx, p] = nam.split(/\.| /)  //dot or space
    let h;
    if (pRefs[p]) { //use first reference & root
        let [cv] = ref.split(' ')
        h = "#v="+cv
        let d = decodedHash()
        if (!d.startsWith('#')) h += "&r="+d
    } else { //use page number
        h = "#p="+p;
    }
    console.log(h); hideMenus()
    let url = isRemote()? "reader" : "reader.html"
    iqra = window.open(url + h, "iqra")
}
/**
 * Open Corpus quran link that related to the selected word specific word. 
 *  
 * @see toBuckwalter
 * 
 */
function doClick2() {
    const REF = "http://corpus.quran.com/qurandictionary.jsp";
    let p = "";
    if (menu2.value) p = "?q=" + currentRoot()
    console.log("Corpus" + p);
    window.open(REF + p, "Corpus")  //, "resizable,scrollbars");
}
/**
 * Use the hash part of URL in the address bar
 *
 * @returns null (no hash), decoded hash ('r='), or as-is (named) 
 * 
 */
function decodedHash() {
  let h = location.hash
  if (h.length < 4) return null
  if (h.startsWith('#r='))
    //replace special chars: call decodeURI() by A Rajab
    return decodeURI(h.substring(3))  //strip '#r='
  else return h
}
/**
 * Use the hash part of URL in the address bar
 *
 * @returns true if hash part of URL is not empty
 * 
 */
function gotoHashRoot() {
  let h = decodedHash()
  if (!h) return false
  showSelections(false)
  if (!h.startsWith('#')) {
    let ra = h.split('&r=').map(toArabic)
    displayRoots(ra)
  } else {
    let title = '', refs = h.substring(1)
    if (refs.includes('='))
        [title, refs] = refs.split('=')
    displayRef(title, parseRefs(refs))
    menu2.value=''; menu3.value=''
    combine.hidden = true
  }
  return true
}
/**
 * Initialize the globals
 * 
 * @param none
 * 
 */
function initMujam() {
    version.innerText = 'Iqra '+VERSION;
    showSelections(false);
    // mark places for sajda
    let str = "1w82bu2i62ne2s430l38z3gg3pq42y4a74qm5k15q5";
    [sajda, ] = parseRefs(str);
//sajda = [175, 250, 271, 292, 308, 333, 364, 378, 415, 453, 479, 527, 589, 597, 999]
    let letters = [];
    for (let c=1575; c<1609; c++) letters.push(String.fromCharCode(c));
    makeMenu(menu1, letters); 
    try {
        readData();
    } catch(err) { 
        out2.innerText = ""+err;
    }
    window.name ="mujam"
    window.onhashchange = gotoHashRoot
    menuFn()
}

  /**
  * Menu functions
  */
function menuFn() {
  function menuItem(m) {
      let s = bilgi.innerText
      if (!s) return
      let [nam, ref] = s.split(EM_SPACE)
      if (!ref) return
      let [cv] = ref.split(' ')
      let [c, v] = cv.split(':')
      openSiteVerse(m, c, v)
      hideMenus()
  }
  menuK.onclick = (evt) => {
      evt.preventDefault()
      menuItem(evt.target.innerText[0])
  }
  document.onclick = (evt) => {
      if (evt.target.tagName == "TD"
        && !menuK.style.display) return
      hideMenus(); evt.preventDefault()
  }
  document.onkeydown = (evt) => {
    if (evt.key == 'Escape') hideMenus()
    else if (menuK.style.display) 
      menuItem(evt.key.toUpperCase())
  }
  window.hideMenus = () => { 
      hideElement(menuK); hideElement(bilgi)
  }
  window.showMenuK = (evt) => { 
      evt.preventDefault(); //hideElement(bilgi)
      let y = Math.max(evt.clientY-200, 0)
      setPosition(menuK, evt.clientX, y)
  }
}

function showSelections(show) {
    if (show) {
      div1.style.display = ''
      div2.style.display = 'none'
    } else {
      div1.style.display = 'none'
      div2.style.display = ''
    }
}
function getPageOf(td) {
    let r = td.parentElement.rowIndex;
    let p = 20*(r-1) + td.cellIndex;
    return p
}
function doHover(evt) {  //listener for each td element
    if (menuK.style.display) return
    let p = getPageOf(evt.target)
    bilgi.innerHTML = pRefs[p]?
         "<div class=t2>" + pRefs[p]  + "</div>"
       : "<div class=t1>" + pLabel[p] + "</div>"
    evt.target.append(bilgi); 
    //center over evt.target
    //setPosition(bilgi, evt.clientX, 20, 180)
    let mw = bilgi.clientWidth || 180
    let x0 = evt.target.offsetLeft + 10
    let dx = Math.max(-mw/2, -x0)  
    //if (x0-mw/2 < 0) dx = -x0
    let cw = (tablo.clientWidth || 460) + 20
    dx = Math.min(dx, cw-mw-x0)
    //if (x0+mw/2 > cw) dx = cw-mw-x0
    bilgi.style.left = (dx)+'px'
    bilgi.style.display = "block"
}

