"use strict";
// idea by A Rajab https://a0m0rajab.github.io/LearningQuest/googleDocs/submitForm.html
// https://www.freecodecamp.org/news/cjn-google-sheets-as-json-endpoint/
// https://bionicteaching.com/silent-submission-of-google-forms/

const FORM_URL = "https://docs.google.com/forms/d/e/"
    +"1FAIpQLScdPCvf2w1Mt54JpTw8W893H82jJn8szLhRa0lpg3AS-sVOow/"
const DOCS_URL = "https://docs.google.com/spreadsheets/u/1/d/e/"
    +"2PACX-1vSp1W2iSr6FGHd6aNRbFIOnFSYqZOYoCTAejwEGz_Ul8Ibfjb3moyInjY_H8243fneNwOSWDHoUMgRn/"

function submitData(user, topic, marks) { //to Google Forms -- add one line
    //magic numbers in the link are from "Get pre-filled link" menu
    const link = FORM_URL+"formResponse?usp=pp_url"
        +"&entry.1886222="+user
        +"&entry.1060034848="+topic
        +"&entry.2142667267="+marks
        +"&submit=Submit"
    const post = document.createElement("iframe")
    post.src = decodeURI(link)
    post.id = "postID"
    post.hidden = true;
    document.body.appendChild(post)
    const removeElement = () => {post.parentNode.removeChild(post)}
    setTimeout(removeElement, 2000);
}
// Try various ways to read from Google Sheets -- show all data
const URL = DOCS_URL+'pub?output=tsv' //tab-separated values
function fetchData(success, failure) { //simplest method
    fetch(URL)
      .then(r => r.text()) 
      .then(success).catch(failure)
}
function readTabularData(success) { //uses fetch -- external
    const B = {time:0, user:0, topic:0, marks:0}
    const bm = new TabularData(B, 'bookmarks') //external class
    bm.readData(URL, t => {console.log(bm.data); success(t, bm)})
}
function readLinkData(success, failure) { //complicated XML
    const xmlhttp = new XMLHttpRequest()
    xmlhttp.open('GET', URL, true);
    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
             success(xmlhttp.responseText)
        else failure(xmlhttp)
    }
    xmlhttp.send(null)
}
