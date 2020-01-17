// Say hello to my variables!
// Api stuff
let urlhead = "https://dictionaryapi.com/api/v3/references/sd4/json/";
let secret = "?key=cca66032-7472-4665-b9fa-848a6cd0a57a";
var mainurl;
// raw url

// Global data variable. Called whenever I need json from the api.
var info;

// Stores searches
var input;

// Gonna use this a lot to generate lists, might as well have it accessible.
var entry;

// This counts the number of defintions.
var count;

// Using local storage to store my history. I hope this is allowed...
if (localStorage["history"] == undefined) {
  localStorage["history"] = "";
}

if (localStorage["num"] == undefined) {
  localStorage["num"] = "1";
}

function test() {}

// A search will trigger the following function
function search() {
  if (navigator.onLine) {
    // return message to normal after one second
    setTimeout(function() {
      document.getElementById("typo4").innerHTML =
        "Search for single words. We feature over 100,000 entries.";
    }, 1000);
  } else {
    // If user is offline, give them warning that searching for new words is useless.
    document.getElementById("typo4").innerHTML =
      "Your internet is down. Searching only works for words logged into your history...";
  }

  // remove typo 3 and shorten banner to only search. Too large and distracts from actual definition.
  document.getElementById("typo3").style.display = "none";
  if ($(window).width() > 1400) {
    document.getElementById("frontbanner").style.transition = "height 0.5s";
    document.getElementById("frontbanner").style.height = "auto";
  }
  // Then comes removal of any previous definiton leftovers.
  // Keep removing child nodes until selected element has no first child.
  var def = document.getElementById("def");
  while (def.firstChild) {
    def.removeChild(def.firstChild);
  }

  // This renews error screen, takes away list of suggestions
  const suggestionNode = document.getElementById("typo7");
  while (suggestionNode.firstChild) {
    suggestionNode.removeChild(suggestionNode.firstChild);
  }

  //The user's search is put into lowercase and formatted for a url request
  input = document
    .getElementById("searchbar")
    .value.toLowerCase()
    .trim();
  var mainurl = urlhead + input + secret;
  fetch(mainurl) // Call the fetch function passing the url of the API as a parameter
    .then(resp => {
      return resp.json();
    }) // Transform the data into json
    .then(function(data) {
      info = data;
      // resets the searchbar
      document.getElementById("searchbar").value = "";
      //if word exists, define. Else, show error
      if (info[0].hasOwnProperty("hwi")) {
        document.getElementById("er").style.height = "0";
        document.getElementById("er").style.display = "none";
        define();
      } else {
        errorScreen();
      }
    })
    .catch(function(error) {
      console.log(error);
    });
}

// The magic happens here
function define() {
  
  // Based on how many definitions for a word there are,
  // create div elements to contain definitions.
  for (count = 1; count <= info.length; count++) {
    var def = document.createElement("div"); // create a new div element and set class and id for it
    def.setAttribute("class", "alldefs");
    def.setAttribute("Id", "d" + count);
    // append this to definitions
    document.getElementById("def").appendChild(def);

    var main = document.createElement("div");
    main.setAttribute("class", "main");
    main.setAttribute("Id", "main" + count);
    def.appendChild(main);

    // Now, create headword
    var head = document.createElement("h2");
    head.setAttribute("class", "headword");
    head.setAttribute("Id", "hw" + count);
    head.innerHTML = info[count - 1].hwi.hw.replace(/\*/g, ""); // headword retrived from json
    main.appendChild(head);

    // verb/adjective/adverb/etc is displayed
    var wordtype = document.createElement("h3");
    wordtype.setAttribute("class", "wordtype");
    wordtype.setAttribute("Id", "wt" + count);
    var insertfl;
    if (info[count - 1].fl == "undefined") {
      insertfl = "";
    } else {
      insertfl = info[count - 1].fl;
    }

    if (info[count - 1].hasOwnProperty("cxs")) {
      wordtype.innerHTML =
        insertfl +
        ", " +
        info[count - 1].cxs[0].cxl +
        " " +
        info[count - 1].cxs[0].cxtis[0].cxt;
    } else {
      wordtype.innerHTML = insertfl;
    }
    main.appendChild(wordtype);

    // other similar alternate words are retrieved and appended
    var wordbranches = document.createElement("div");
    wordbranches.setAttribute("class", "wordbranches");
    wordbranches.setAttribute("Id", "wb" + count);
    main.appendChild(wordbranches);

    var x = "";
    for (entry = 1; entry < info[count - 1].meta.stems.length; entry++) {
      x += info[count - 1].meta.stems[entry] + ",&nbsp;&nbsp;";
    }

    x = x.substring(0, x.length - 11);
    wordbranches.innerHTML = x;

    // pronounciation div is created
    var pro = document.createElement("div");
    pro.setAttribute("class", "pronounce");
    pro.setAttribute("Id", "pro" + count);
    def.appendChild(pro);

    // pronounciation data and audio is retrieved, first I separate syllbales with a - sign
    document.getElementById("pro" + count).innerHTML =
      '<p class="syllable">' +
      info[count - 1].hwi.hw.replace(/\*/g, "-") +
      "</p>";

    if (info[count - 1].hwi.hasOwnProperty("prs")) {
      var pronouncelength = info[count - 1].hwi.prs.length;
      console.log("API offers " + pronouncelength + " pronounciations");
      if (pronouncelength > 4) {
        pronouncelength = 4;
      }
    } else {
      var pronouncelength = 0;
    }

    for (entry = 1; entry <= pronouncelength; entry++) {
      var pr = document.createElement("p"); // creates a pronounciation
      var audio = document.createElement("i");
      pr.setAttribute("class", "pronouncings");
      pr.setAttribute("Id", "p" + entry);
      pr.innerHTML = "&nbsp;/ " + info[count - 1].hwi.prs[entry - 1].mw + " /";
      // if another pronounciation works, prepend it to the new p element
      if (info[count - 1].hwi.prs[entry - 1].hasOwnProperty("sound")) {
        audio.setAttribute("class", "fa fa-volume-up");
        audio.setAttribute("title", "listen to " + entry);
        audio.setAttribute("Id", "picon" + count + entry);

        // This gets the proper url for the audio
        var part;
        if (info[count - 1].hwi.prs[entry - 1].sound.audio.match(/^bix/)) {
          part = "bix";
        } else if (
          info[count - 1].hwi.prs[entry - 1].sound.audio.match(/^gg/)
        ) {
          part = "gg";
        } else if (info[count - 1].hwi.prs[entry - 1].sound.audio.match(/^"/)) {
          part = "number";
        } else if (
          info[count - 1].hwi.prs[entry - 1].sound.audio.match(/^\d/)
        ) {
          part = "number";
        } else {
          part = info[count - 1].hwi.prs[entry - 1].sound.audio.substring(0, 1);
        }
        var audioUrl =
          "https://media.merriam-webster.com/soundc11/" +
          part +
          "/" +
          info[count - 1].hwi.prs[entry - 1].sound.audio +
          ".wav";

        console.log("The following audio url has been selected: " + audioUrl);
        audio.href = audioUrl;
        audio.setAttribute("onclick", "pronounce()");
        $(pr).prepend(audio);
      } else {
        // if pronounciation fails, append unavailable sign
        $(pr).append(" <small><i>(audio unavailable)</i></small> ");
      }
      document.getElementById("pro" + count).appendChild(pr);
    }

    // Actual defintions
    var ol = document.createElement("ol"); // creates a new p element and set class and id for it
    ol.setAttribute("class", "actualdef");
    ol.setAttribute("Id", "ol" + count);
    def.appendChild(ol);

    var a = info[count - 1].def[0].sseq[0];
    var b = a[0];
    if (b.includes("pseq")) {
      var c = b[1];
      var d = c[0];
      var f = d[1].dt;
      var g = f[0];
      var e = g[0];
    } else if (b.includes("bs")) {
      var c = b[1].sense;
      var d = c.dt;
      var f = d[0];
      var e = f[0];
    } else {
      var c = b[1].dt;
      var d = c[0];
      var e = d[0];
    }
    console.log("The response form is " + e);

    // If I get a direct text response, go for it and get the definition down.
    if (e === "text") {
      for (entry = 1; entry <= info[count - 1].def[0].sseq.length; entry++) {
        var a = info[count - 1].def[0].sseq[entry - 1];
        var b = a[0];
        if (b.includes("pseq")) {
          var c = b[1];
          var d = c[0];
          var f = d[1].dt;
          var g = f[0];
          var e = g[1];
        } else if (b.includes("bs")) {
          var c = b[1].sense;
          var d = c.dt;
          var f = d[0];
          var e = f[1];
        } else {
          var c = b[1].dt;
          var d = c[0];
          var e = d[1];
        }

        // remove strarting space
        if (e.includes("{bc}")) {
          var e = e.replace(/\{bc}/gi, " ");
        }

        if (e.includes("{amp}")) {
          var e = e.replace(/\ {amp}/gi, "");
        }

        // If there is a comparison, quickLink it.
        if (e.includes("{dx}compare")) {
          var e = e.replace(" {dx}compare ", ". See ");
          var e = e.replace(
            "{dxt|",
            '<i onclick="quickSearch()" id="hey' + count + entry + '">'
          );
          var e = e.split("||")[0] + "</i>";
        }
        // If there are italics, emphasize it.
        if (e.includes("{it}")) {
          var e = e.replace(/\{it}/g, "<em>");
          var e = e.split("{/it}").join("</em>");
        }
        // If there are left/right quotes, quote.
        if (e.includes("{ldquo}")) {
          var e = e.replace(/\{ldquo}/g, "&#8220");
        }
        if (e.includes("{rdquo}")) {
          var e = e.replace(/\{rdquo}/g, " &#8221");
        }

        // Smallen small words
        if (e.includes("{sc}")) {
          var e = e.replace(/\{sc}/gi, "<small>");
          var e = e.split("{/sc}").join("</small>");
        }
        if (e.includes("*")) {
          var e = e.replace(/\*/gi, "-");
        }
        // SubCategories are bolded
        if (e.includes("{b}")) {
          var e = e.replace(/\{b}/g, "&nbsp;<b>");
          var e = e.split("{/b}").join("</b>");
        }
        // If there are subscripts, change
        if (e.includes("{inf}")) {
          var e = e.replace(/\{inf}/gi, "<sub>");
          var e = e.split("{/inf}").join("</sub>");
        }
        // If there are superscripts, change
        if (e.includes("{sup}")) {
          var e = e.replace(/\{sup}/gi, "<sup>");
          var e = e.split("{/sup}").join("</sup>");
        }
        if (e.includes("{dx}see")) {
          var e = e.split("{dx}see")[0];
        }
        if (e.includes("{sx|")) {
          var e = e.replace(
            /\ {sx/g,
            '(another term for <i onclick="quickSearch()" id="heya' +
              count +
              entry +
              '">'
          );
          var e = e.replace(/\}/g, "");
          var e = e.split("||")[0] + "</i>)";
          var e = e.replace(/\|/gi, "");
          console.log("searching for " + e);
        }

        // Sometimes the api just returns really strange responses that are half finished.
        // These responses are formatted to look better.
        if (e.endsWith(",")) {
          var e = e.substring(0, e.length - 1);
        } else if (e.trimEnd().endsWith(",")) {
          var e = e.substring(0, e.length - 1);
        }
        if (e.endsWith(": as")) {
          var e = e.substring(0, e.length - 4);
        } else if (e.trimEnd().endsWith(": as")) {
          var e = e.substring(0, e.length - 4);
        }
        if (e.endsWith(":")) {
          var e = e.substring(0, e.length - 1);
        } else if (e.trimEnd().endsWith(":")) {
          var e = e.substring(0, e.length - 1);
        }
        if (e.trimEnd() === "") {
          var e =
            "<em>no information avaiable for this word from the current dictionary</em>";
        }

        var list = document.createElement("li");
        list.setAttribute("Id", "line" + entry);
        list.setAttribute("class", "every");
        list.innerHTML = e;
        document.getElementById("ol" + count).appendChild(list);
      }
    } else {
      for (entry = 1; entry <= info[count - 1].shortdef.length; entry++) {
        var quickdef = info[0].shortdef[entry - 1].replace("\u2014", "");
        var list = document.createElement("li");
        list.setAttribute("Id", "d" + entry);
        list.setAttribute("class", "every");
        list.innerHTML = quickdef;
        document.getElementById("ol" + count).appendChild(list);
      }
    }
  }
  updateHistory()
}

// Now, code for history items
function updateHistory() {
  
  // This number helps quicksearch target proper history item
  localStorage["num"]++;

  // store stuff into chache history
  var store = info[0].hwi.hw.replace(/\*/g, "") + " ";
  localStorage["history"] +=
    '<strong onclick="quickSearch()" id="his' +
    localStorage["num"] +
    '">' +
    store +
    "</strong>";
  
  var u = localStorage["history"].match(/ /gi).length/3;
  if (u > 20) {
    localStorage["history"] = localStorage["history"].split(/strong>(.+)/)[1];
  }

  // If there are too many entries in history, erase the earlier entries, but still keep their
  // Json in cache
  var u = (localStorage["history"].match(/<strong>/g) || []).length;
  if (u > 20) {
    localStorage["history"].split(/strong>(.+)/)[1];
  }

}

function quickSearch() {
  var suggestion;
  var targeting = event.currentTarget.id;
  console.log("User clicks on: " + targeting);
  suggestion = document.getElementById(targeting).innerHTML;
  document.getElementById("searchbar").value = suggestion;
  search();
}

function random() {
  var isOnline = navigator.onLine;

  // allow random searches if online, message if offline
  if (isOnline == true) {
    document.getElementById("typo4").innerHTML =
      "Please wait patiently while we search for obscure words...";
    // I'm getting random words from this api.
    // It uses temproary api keys. I first fetch a key then use it to get a proper request.
    var randomUrlHead =
      "https://cors-anywhere.herokuapp.com/https://random-word-api.herokuapp.com/key?";
    var randomUrl = "https://random-word-api.herokuapp.com/word?key=";
    fetch(randomUrlHead)
      .then(resp => resp.text())
      .then(function(data) {
        var randomkey = data;
        fetch(randomUrl + randomkey + "&number=1&swear=0")
          .then(resp => {
            return resp.json();
          }) // Transform the data into json
          .then(function(data) {
            document.getElementById("searchbar").value = data[0];
            console.log("Random search returns: " + data[0]);
            search();
          })
          .catch(function(error) {
            console.log(error);
          });
      })
      .catch(function(error) {
        console.log(error);
      });
  } else {
    errorScreen();
  }
}

//Audio pronunciations. Four separate defintions are possible.
// I have not yet found a word which has four different pronounciations, and I don't think my API would have one.
function pronounce() {
  var targeting = event.currentTarget.href;
  new Audio(targeting).play();
}

// Displays error message
function errorScreen() {
  document.getElementById("typo3").style.display = "none";
  if ($(window).width() > 1400) {
    document.getElementById("frontbanner").style.transition = "height 0.5s";
    document.getElementById("frontbanner").style.height = "auto";
  }
  document.getElementById("er").style.height = "100%";
  document.getElementById("er").style.display = "block";
  var quote = document.getElementById("typo5");
  // If an error appears and user has internet, it is not an English word.
  // This causes my api to return an array of possible word suggestions. I utilize this.
  if (navigator.onLine) {
    var x = Math.floor(Math.random() * 5 + 1);
    if (x == 1) {
      quote.innerHTML = "That word is unfamiliar to me, you must try again.";
    } else if (x == 2) {
      quote.innerHTML =
        "Either your spelling is faulty, or you searched for something inappropriate.";
    } else if (x == 3) {
      quote.innerHTML = "I do not understand the meaning of this nonsenese.";
    } else if (x == 4) {
      quote.innerHTML =
        "Hmm... That word does not exist. I expected more of you.";
    } else {
      quote.innerHTML =
        "How dare you present me with rubbish? I only define REAL words.";
    }
    document.getElementById("typo6").innerHTML =
      "<b>You searched for: <i>" +
      input +
      "</i></b><br><br>This does not appear to be an English word. Perhaps you meant something else?";
    // This cannot be quick searched because there are multiple suggestions.
    for (entry = 0; entry < info.length; entry++) {
      var li = document.createElement("li");
      li.setAttribute("class", "errorlink");
      li.setAttribute("onclick", "suggestionSearch()");
      li.setAttribute("Id", "suggestion" + entry);
      li.innerHTML = "<i>" + info[entry] + "</i>";
      document.getElementById("typo7").appendChild(li);
    }
  } else {
    // If they don't have internet, search function will not work
    quote.innerHTML =
      "Your internet connection is questionable. Check to see if you have any wifi.";
    document.getElementById("typo6").innerHTML =
      "This feature requires an internet connection. Definitions in your history can be accessed offline, but new searches require bars. Please connect and try again.";
  }
}

// search for suggestion
function suggestionSearch() {
  var suggestion;
  var targeting = event.currentTarget.id;
  suggestion = document.getElementById(targeting).innerHTML.substring(3);
  suggestion = suggestion.substring(0, suggestion.length - 4);
  document.getElementById("searchbar").value = suggestion;
  search();
}
// BOO YAH. MY LINKS WORK!!!!

// Generates snarky saying
function updateQuote() {
  var quote = document.getElementById("t1");
  var x = Math.floor(Math.random() * 10 + 1);
  if (x == 1) {
    quote.innerHTML = "Increase your vocabulary. <i>I dare you.</i>";
  } else if (x == 2) {
    quote.innerHTML = "Trust in the dictionary. <i>It is never wrong.</i>";
  } else if (x == 3) {
    quote.innerHTML = "Come then! Give me a word, <i>any word.</i>";
  } else if (x == 4) {
    quote.innerHTML =
      "You have my knowledge at your disposal. <i>Don't sit there doing nothing.</i>";
  } else if (x == 5) {
    quote.innerHTML =
      "I live to serve you, my master. <i>What is thy bidding?</i>";
  } else if (x == 6) {
    quote.innerHTML = "Your vocabulary is laughable. <i>Try me.</i>";
  } else if (x == 7) {
    quote.innerHTML = "I am never mistaken. <i>Test me.</i>";
  } else if (x == 8) {
    quote.innerHTML =
      "Do you wish to master English? <i>You will require my assistance.</i>";
  } else if (x == 9) {
    quote.innerHTML =
      "Pretend Google doesn't exist. <i>I'm much more useful that way.</i>";
  } else {
    quote.innerHTML =
      "I suspect you came for something. <i>My knowledge is yours.</i>";
  }
}

// Changes snarky saying
function effect() {
  var quote1 = document.getElementById("t1");
  var quote2 = document.getElementById("t2");
  quote1.style.opacity = 0;
  quote1.innerHTML = "";
  quote2.style.opacity = 1;
  quote2.innerHTML = "What word seems to be troubling you?";
}

// Code for mobile/tablet dropdown menu. Handy Dandy.
function openNav() {
  var x = document.getElementById("nav");
  var y = document.getElementById("typos");
  if (x.className === "nav") {
    x.className += " responsive";
  } else {
    x.className = "nav";
  }
  if (y.className === "typography") {
    y.className += " mobile";
  } else {
    y.className = "typography";
  }
}

// Code for opening and closing history bar.
var toggle = "off";
function toggleHistory() {
  var x = document.getElementById("his");
  x.innerHTML = localStorage["history"];
  if (toggle == "off") {
    x.style.display = "block";
    x.style.height = "auto";
    toggle = "on";
    $("#hy").hover(
      function() {
        $(this).css("color", "black");
      },
      function() {
        $(this).css("color", "#207dff");
      }
    );
  } else {
    x.style.height = "0";
    x.style.display = "none";
    toggle = "off";
    $("#hy").hover(
      function() {
        $(this).css("color", "black");
      },
      function() {
        $(this).css("color", "dimgray");
      }
    );
  }
}

// Makes navigation interactive, constantly updating the screen to suit the user.
function updateScreen() {
  if ($(window).width() > 1200) {
    document.getElementById("nav").className = "nav";
    document.getElementById("typos").className = "typography";
  }
  setTimeout(updateScreen, 100);
}

// Alright, now for the difficult offline functionality
function getDataFromCache(coords) {
  if (!("caches" in window)) {
    return null;
  }
  const url = `${window.location.origin}/info/${coords}`;
  return caches
    .match(url)
    .then(response => {
      if (response) {
        return response.json();
      }
      return null;
    })
    .catch(err => {
      console.error("Error getting data from cache", err);
      return null;
    });
} // getdatafromcache

// Performs the neccecary js when HTML finishbes loading
function update() {
  updateScreen();
  updateQuote();
  // This allows for user to use enter key to search.
  $("#searchbar").keypress(function(e) {
    if (e.which == 13) {
      //Enter key pressed
      $("#icon2").click(); //Trigger search button click event
    }
  });
}
