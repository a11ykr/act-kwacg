// /Users/hj/Sites/a11y/act-kwacg/background.js
chrome.action.onClicked.addListener((tab) => {
	if (tab.id) {
		chrome.tabs.sendMessage(tab.id, { action: "toggleOverlay" });
	}
});

// 확장프로그램 설치/활성화 시 초기화
chrome.runtime.onInstalled.addListener(() => {
  console.log('KWCAG 검사기가 설치되었습니다.');
});

// DevTools 패널과의 통신을 위한 연결 관리 (선택 사항)
// panel.js가 content script와 직접 통신하므로, 이 부분은 현재 활성화된 검사 로직에 직접 관여하지 않을 수 있습니다.
// 만약 DevTools 패널과 background 간의 다른 통신이 필요하다면 유지합니다.

// devtools 패널과의 통신을 위한 연결 관리
let devToolsConnection = null;

chrome.runtime.onConnect.addListener(function(port) {
  if (port.name === "devtools-panel") {
    console.log("DevTools panel connected to background script.");
    devToolsConnection = port;
    
    // DevTools 패널로부터 메시지를 수신할 때
    devToolsConnection.onMessage.addListener(function(message) {
      console.log("Message from DevTools panel:", message);
      if (message.action === "runAxeCheck") {
        // 현재 panel.js는 content script로 직접 메시지를 보냅니다.
        // 이 로직이 여전히 필요하다면, panel.js에서 background로 메시지를 보내고,
        // 여기서 content script로 전달하는 방식으로 변경해야 합니다.
        // 하지만 현재 구조에서는 이 부분이 중복될 가능성이 높습니다.
        console.warn("runAxeCheck message received in background.js from devtools-panel, but panel.js should handle this directly with content.js.");
        // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        //   const tab = tabs[0];
        //   if (tab && tab.id) {
        //     chrome.tabs.sendMessage(tab.id, { action: "runAxeCheck" }, response => {
        //       if (chrome.runtime.lastError) {
        //         devToolsConnection.postMessage({ action: "axeCheckError", error: chrome.runtime.lastError.message });
        //         return;
        //       }
        //       devToolsConnection.postMessage({ action: "axeCheckComplete", results: response });
        //     });
        //   } else {
        //     devToolsConnection.postMessage({ action: "axeCheckError", error: "Active tab not found for Axe check." });
        //   }
        // });
      }
    });
    
    // 연결이 끊어졌을 때 처리
    devToolsConnection.onDisconnect.addListener(function() {
      console.log("DevTools panel disconnected from background script.");
      devToolsConnection = null;
    });
  }
});