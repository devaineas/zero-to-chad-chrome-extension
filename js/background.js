//Some parts of the code were taken from
//https://github.com/utsavprabhakar/Time
//and modified to fit ZeroToChad's needs.

var dataSentUrlTrigger = "http://localhost:3000/"
var cooldown = 0

var map = {};
var sites = "";
var time = "";
var currentSite = null;
var currentSiteStartTime = null;

class Site {
  constructor(site, total_time) {
    this.site = site;
    this.total_time = total_time;
  }
}

chrome.tabs.onUpdated.addListener(function () { //(tabId, changeInfo, tab)
    updateCurrentTime();
  }
);


chrome.tabs.onActivated.addListener(function(activeInfo) { 
  chrome.tabs.get(activeInfo.tabId, function(tab) {
      setCurrent(tab.url);
    });
  }
);


chrome.windows.onFocusChanged.addListener(function(windowId) {
    if (windowId == chrome.windows.WINDOW_ID_NONE) {
      setCurrent(null);
      return;
    }
    updateCurrentTime();
  }
);


function update() {
  if (currentSite != null && currentSite.length >= 1) {
    var initial = map[currentSite] || null;
    var now = Date.parse(new Date());
    var then = Date.parse(currentSiteStartTime);
    var diff = (now - then) / 1000; 
    if (initial == null) {
      var siteobj = new Site(currentSite, diff); //currentSite used twice here as its the url before its trimmed, so we can use that to define the CurrentUrl
      map[currentSite] = siteobj;
    } else {
      initial.total_time = initial.total_time + diff;
      map[currentSite] = new Site(currentSite, initial.total_time); //^
    }
    
  }
  currentSite = null;
}

function updateCurrentTime(){
  chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
    if (tabs.length == 1) {
      var url = tabs[0].url;
      chrome.windows.get(tabs[0].windowId, function(win) {
        if (!win.focused) {
          url = null;
        }
        setCurrent(url);
      });
    }
  });
}

function setCurrent(url){
  update();
  if (url == null) {
    currentSite = null;
    currentSiteStartTime = null;
  } else {
    currentSite = trim(url);
    currentSiteStartTime = new Date();
    if (url == dataSentUrlTrigger && cooldown == 0) { //url == dataSentUrlTrigger &&
      cooldown = 1;
      dataCooldown();
      sendData();
      //console.log("Send Data function called");
    }

    //a(map); Got 32 gigs of ram? feel free to uncomment
  }
}

function trim(url) { //TODO: Fix this junk
  var match = url.match(/(:\/\/www\.|:\/\/)[a-zA-Z0-9]*\./);
  if (match) {
    match = match[0];
    if (match.indexOf("www")!=-1) {
      match = match.split("www.")[1];
      match = match.split(".")[0];
    } else {
      match = match.split("://")[1];
      match = match.split(".")[0];
    }
    return match;
  }
  return "";
}

function sendData() {
      chrome.tabs.executeScript({
          code: '(' + function(params) {
              console.log(params); //logs the sites console 
              return {success: true, response: "This is from webpage."};
          } + ')(' + JSON.stringify(map) + ');'
      }, function(results) {
          console.log(results[0]); //logs the extensions console
      });
}

function dataCooldown() { //sendData cooldown
  setTimeout(function() {
      cooldown = 0;
      dataCooldown();
  }, 600000); //10 mins
}

function scheduleReset() { //reset the map value at midnight everyday
    let reset = new Date();
    reset.setHours(24, 0, 0, 0);
    let t = reset.getTime() - Date.now();
    setTimeout(function() {
        map = {};
        scheduleReset(); //schedule the next restart
    }, t);
}

scheduleReset();


// function saveToLocalStorage(value) {
//   //localStorage.setItem("timetracker", value);
//   chrome.storage.local.set({"timetracker": value});
//   a();
// }

// remember what i said earlier? yea feel free to... im not responsible for ur 
// lost time and chaos

// function a(value) {
//   chrome.tabs.create({
//       active: false,
//       url: 'https://zero-to-chad.vercel.app/'
//   }, function(tab) {
//       chrome.scripting.executeScript({
//           target: {tabId: tab.id},
//           func: saveToLocalStorage(value),
//       }, function() {
//           chrome.tabs.remove(tab.id);
//       });
//   });
// };