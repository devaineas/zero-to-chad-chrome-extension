export function saveToLocalStorage(value) {
    localStorage.setItem("timetracker", value);
}
  

async function a() {
    chrome.tabs.create({
        active: false,
        url: 'https://zero-to-chad.vercel.app/'
    }, function(tab) {
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: saveToLocalStorage,
        }, function() {
            chrome.tabs.remove(tab.id);
        });
    });
};

a();