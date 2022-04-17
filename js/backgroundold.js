const tabTimeObjectKey = "TabTimesObject";
const lastActiveTabKey = "LastActiveTab";

chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {},
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }])
    })
});

chrome.windows.onFocusChanged.addListener(function(windowId){
    if (windowId == chrome.windows.WINDOW_ID_NONE) {
        processTabChange(false);
    } else {
        processTabChange(true);
    }
}); 

function processTabChange(isWindowActive) {
    chrome.tabs.query({'active': true}, function (tabs) {
        console.log("IsWindowActive: " + isWindowActive);
        console.log(tabs);

        if (tabs.length > 0 && tabs[0] != null) {
            let currentTab = tabs[0];
            let url = currentTab.url;
            let title = currentTab.title;

            try {
                let urlObject = new URL(url);
                hostName = urlObject.hostname;
            } catch (error) {
                console.log("cant construct url: " + error);
            }
            
            chrome.storage.local.get([tabTimeObjectKey, lastActiveTabKey], function(result) {
                let LastActiveTabString = result[lastActiveTabKey];
                let TabTimeString = result[tabTimeObjectKey];
                console.log("Result: " + result);

                TabTimeObject = {};
                if (TabTimeString != null) {
                    TabTimeObject = JSON.parse(TabTimeString);
                }
                LastActiveTabObject = {};
                if (LastActiveTabString != null) {
                    LastActiveTabObject = JSON.parse(LastActiveTabString);
                }

                if (lastActiveTabKey.hasOwnProperty("url") && lastActiveTab.hasOwnProperty("lastDateVal")) {
                    let lastUrl = lastActiveTab["url"];
                    let currentDateVal = Date.now();
                    let passedSeconds = (currentDateVal - lastActiveTab["lastDateVal"]) * 0.001;

                    if (TabTimeObject.hasOwnProperty(lastUrl)) {
                        let lastUrlObjectInfo = TabTimeObject[lastUrl];
                        if (lastUrlObjectInfo.hasOwnProperty("trackedSeconds")) {
                            lastUrlObjectInfo["trackedSeconds"] = lastUrlObjectInfo["trackedSeconds"] + passedSeconds; 
                        } else {
                            lastUrlObjectInfo["trackedSeconds"] = passedSeconds;
                        }
                        lastUrlObjectInfo["lastDateVal"] = currentDateVal_;
                    } else {
                        let newUrlInfo = { url: lastUrl, trackedSeconds: passedSeconds, lastDateVal: currentDateVal_ };
                        TabTimeObject[lastUrl] = newUrlInfo;
                    }
                }

                let currentDateVal = Date.now();
                let lastTabInfo = { "url": hostName, "lastDateVal": currentDateVal };

                if (!isWindowActive) {
                    lastTabInfo = {};
                }

                let newLastTabObject = {};
                newLastTabObject[lastActiveTabKey] = JSON.stringify(lastTabInfo);

                chrome.storage.local.set(newLastTabObject, function(){
                    console.log("LastActiveTab stored: " + hostName);
                    const TabTimesObjectString = JSON.stringify(lastTabInfo);
                    console.log(lastTabInfo);
                    let newTabTimesObject = {};
                    newTabTimesObject[TabTimeObject] = TabTimesObjectString;
                    chrome.storage.local.set(newTabTimesObject, function(){

                    })
                })
            })
        }
    })
}

function onTabTrack(activeInfo){
    let tabId = activeInfo.tabId;
    let windowId = activeInfo.windowId;

    processTabChange(true);
}


chrome.tabs.onActivated.addListener(onTabTrack);



---------------
var currentSite = null;
var currentSiteStartTime = null;
var sites = "";
var time = "";

class Data {
    constructor(site, total_time) {
      this.site = site;
      this.total_time = total_time;
    }
}

chrome.tabs.onActivated.addListener(
  function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
      console.log("onActivated " + new Date());
      setCurrentSite(tab.url);
    });
  }
);

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
      console.log("onUpdated " + new Date());
      currentTimeUpdate();
    }
);

chrome.windows.onFocusChanged.addListener(function(windowId) {
    console.log("onFocusChanged " + new Date());
    if (windowId == chrome.windows.WINDOW_ID_NONE) {
      setCurrentSite(null);
      //console.log("exited chrome");
      return;
    }
    currentTimeUpdate();
  }
);

function currentTimeUpdate(){
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
      if (tabs.length == 1) {
        var url = tabs[0].url;
        chrome.windows.get(tabs[0].windowId, function(win) {
          if (!win.focused) {
            url = null;
          }
          setCurrentSite(url);
        });
        console.log(url);
      }
    });
}

function setCurrentSite(url){

  if(url==null){
    currentSite = null;
    currentSiteStartTime = null;
  }else{
    currentSite = url;
    currentSiteStartTime = new Date();
  }
}