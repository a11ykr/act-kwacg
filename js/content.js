console.log("KWCAG Checker: content.js - SCRIPT LOADED AND RUNNING.");

let highlightDiv = null;
let axeLocaleKOData = null; // Axe 한국어 로케일 데이터 캐시
let kwcagCriteriaCache = null; // KWCAG 기준 데이터 캐시

/**
 * KWCAG 기준 데이터를 로드하고 캐시합니다.
 * @returns {Promise<Array>} KWCAG 기준 데이터 배열
 */
async function getKwcagCriteria() {
	if (kwcagCriteriaCache) {
		return kwcagCriteriaCache;
	}
	console.log('KWCAG Checker: content.js - Loading KWCAG criteria data');
	try {
		const response = await fetch(chrome.runtime.getURL('data/kwcag-criteria.json'));
		if (!response.ok) {
			throw new Error(`Failed to load KWCAG criteria: ${response.status} ${response.statusText}`);
		}
		kwcagCriteriaCache = await response.json();
		console.log('KWCAG Checker: content.js - KWCAG criteria data loaded.');
		return kwcagCriteriaCache;
	} catch (error) {
		console.error("KWCAG Checker: content.js - Error loading KWCAG criteria:", error);
		return []; // 오류 발생 시 빈 배열 반환
	}
}

/**
 * Axe 한국어 로케일 데이터를 로드하고 캐시합니다.
 * @returns {Promise<Object|null>} Axe 한국어 로케일 객체 또는 오류 시 null
 */
async function loadAxeLocale() {
  if (axeLocaleKOData) {
    return axeLocaleKOData;
  }
  console.log('KWCAG Checker: content.js - Loading Axe KO locale data');
  try {
    const response = await fetch(chrome.runtime.getURL('data/ko.json'));
    if (!response.ok) {
      throw new Error(`Failed to load ko.json: ${response.status} ${response.statusText}`);
    }
    axeLocaleKOData = await response.json();
    console.log('KWCAG Checker: content.js - Axe KO locale data loaded.');
    return axeLocaleKOData;
  } catch (error) {
    console.error("KWCAG Checker: content.js - Error loading Axe KO locale data:", error);
    return null; // 오류 발생 시 null 반환
  }
}

// /**
//  * 오버레이 iframe을 생성하고 페이지에 삽입합니다.
//  */
// function createOverlay() {
// 	if (overlayElement) {
// 		// 이미 오버레이가 존재하면 src를 다시 로드하여 초기화 (선택적)
// 		// overlayElement.src = chrome.runtime.getURL('overlay.html');
// 		return;
// 	}

// 	console.log('KWCAG Checker: content.js - Creating overlay iframe');
// 	overlayElement = document.createElement('iframe');
// 	overlayElement.id = 'kwcag-checker-overlay';
// 	// 스타일은 CSS 파일에서 관리하는 것이 더 좋지만, 여기서는 직접 설정합니다.
// 	overlayElement.style.position = 'fixed';
// 	overlayElement.style.top = '20px';
// 	overlayElement.style.right = '20px';
// 	overlayElement.style.width = '480px'; // 너비 조정
// 	overlayElement.style.height = 'calc(100vh - 40px)'; // 높이 조정
// 	overlayElement.style.zIndex = '2147483647'; // 매우 높은 z-index
// 	overlayElement.style.border = '1px solid #b0b0b0';
// 	overlayElement.style.backgroundColor = '#f9f9f9';
// 	overlayElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
// 	overlayElement.style.borderRadius = '8px';
// 	overlayElement.style.display = 'none'; // 초기에는 숨김

// 	const overlaySrc = chrome.runtime.getURL('overlay.html');
// 	console.log('KWCAG Checker: content.js - Overlay source URL:', overlaySrc);
// 	overlayElement.src = overlaySrc;

// 	document.body.appendChild(overlayElement);

// 	overlayElement.onload = () => {
// 		console.log('KWCAG Checker: content.js - Overlay iframe loaded.');
// 		// 오버레이가 로드되면 KWCAG 기준 데이터가 준비되었음을 알립니다.
// 		// 실제 검사 실행은 overlay.js 내부의 버튼 클릭으로 트리거됩니다.
// 		if (overlayElement.contentWindow && kwcagCriteriaCache) {
// 			console.log('KWCAG Checker: content.js - Sending kwcagDataReady from overlay.onload');
// 			overlayElement.contentWindow.postMessage({ action: "kwcagDataReady", kwcagCriteria: kwcagCriteriaCache }, '*');
// 		}
// 	};

// 	overlayElement.onerror = () => {
// 		console.error('KWCAG Checker: content.js - Failed to load overlay iframe content.');
// 		if (overlayElement) {
// 			overlayElement.remove();
// 			overlayElement = null;
// 		}
// 	};
// }

// /**
//  * 오버레이를 화면에 표시합니다.
//  */
// function showOverlay() {
// 	console.log('KWCAG Checker: content.js - Attempting to show/create overlay');
// 	if (!overlayElement || !overlayElement.isConnected) { // iframe이 DOM에서 제거되었을 수 있으므로 확인
// 		createOverlay();
// 	}
// 	if (overlayElement) {
// 		overlayElement.style.display = 'block';
// 		overlayVisible = true;
// 		// KWCAG 데이터가 로드되었다면 오버레이에 전달 (iframe이 이미 로드된 경우)
// 		// createOverlay().onload에서도 이 메시지를 보낼 수 있으므로, 중복 호출 방지 또는 상태 확인이 필요할 수 있습니다.
// 		if (overlayElement.contentWindow && kwcagCriteriaCache && !overlayElement.src.includes('overlay.html#loaded')) { // 간단한 중복 방지 예시
// 			overlayElement.contentWindow.postMessage({ action: "kwcagDataReady", kwcagCriteria: kwcagCriteriaCache }, '*');
// 		}
// 	}
// }

// /**
//  * 오버레이를 화면에서 숨깁니다.
//  */
// function hideOverlay() {
// 	console.log('KWCAG Checker: content.js - Hiding overlay');
// 	if (overlayElement) {
// 		overlayElement.style.display = 'none';
// 	}
// 	overlayVisible = false;
// 	removeHighlight(); // 오버레이 숨길 때 하이라이트 제거
// }

/**
 * Axe 검사를 실행하고 결과를 오버레이로 전달합니다.
 */
// async function runAxeAndDisplayInOverlay() {
// 	console.log('KWCAG Checker: content.js - Running Axe scan for overlay display');
// 	const kwcagCriteria = await getKwcagCriteria();
// 	const rulesToRun = kwcagCriteria
// 		.map(criterion => criterion.axeRules)
// 		.filter(rules => rules && rules.length > 0)
// 		.flat()
// 		.filter((value, index, self) => self.indexOf(value) === index);

// 	const axeOptions = {};
// 	if (rulesToRun.length > 0) {
// 		axeOptions.runOnly = { type: 'rule', values: rulesToRun };
// 		console.log("KWCAG Checker: content.js - Running with specific rules:", rulesToRun);
// 	} else {
// 		console.log("KWCAG Checker: content.js - No KWCAG-specific rules provided. Running with default tags (e.g., wcag2aa, best-practice) or consider not running.");
// 		// KWCAG 규칙이 없으면 best-practice 또는 wcag2aa 태그로 실행하거나, 검사를 실행하지 않을 수 있습니다.
// 		// 여기서는 예시로 best-practice를 사용합니다.
// 		axeOptions.runOnly = { type: 'tag', values: ['best-practice', 'wcag2aa'] };
// 	}

// 	try {
// 		if (typeof axe === 'undefined') {
// 			throw new Error('axe-core (axe.js) is not loaded.');
// 		}
// 		const results = await axe.run(document, axeOptions);
// 		console.log("KWCAG Checker: content.js - Axe scan complete for overlay.", results);
// 		if (overlayElement && overlayElement.contentWindow) {
// 			overlayElement.contentWindow.postMessage({ action: "displayResults", results: results, kwcagCriteria: kwcagCriteria }, '*');
// 		}
// 	} catch (err) {
// 		console.error('KWCAG Checker: content.js - Axe scan failed for overlay:', err);
// 		if (overlayElement && overlayElement.contentWindow) {
// 			overlayElement.contentWindow.postMessage({ action: "displayError", error: err.message }, '*');
// 		}
// 	}
// }

/**
 * 지정된 CSS 선택자에 해당하는 페이지 요소를 하이라이트합니다.
 * @param {string[]} targetSelectors - 하이라이트할 요소의 CSS 선택자 배열
 */
function highlightElement(targetSelectors) {
	console.log('KWCAG Checker: content.js - Highlighting elements:', targetSelectors);
	removeHighlight();
	if (!targetSelectors || targetSelectors.length === 0) return;

	// 여러 요소를 하이라이트할 수 있도록 수정 (여기서는 첫 번째 요소만)
	const selector = targetSelectors[0];
	try {
		const element = document.querySelector(selector);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

			highlightDiv = document.createElement('div');
			highlightDiv.id = 'kwcag-checker-highlight';
			// 스타일은 CSS로 관리하는 것이 좋지만, 여기서는 직접 설정합니다.
			highlightDiv.style.position = 'absolute';
			highlightDiv.style.zIndex = '2147483646'; // 오버레이보다는 아래
			highlightDiv.style.border = '3px dashed red'; // 점선으로 변경
			highlightDiv.style.borderRadius = '3px';
			highlightDiv.style.pointerEvents = 'none';
			highlightDiv.style.boxSizing = 'border-box';
			document.body.appendChild(highlightDiv);

			const rect = element.getBoundingClientRect();
			highlightDiv.style.left = `${rect.left + window.scrollX}px`;
			highlightDiv.style.top = `${rect.top + window.scrollY}px`;
			highlightDiv.style.width = `${rect.width}px`;
			highlightDiv.style.height = `${rect.height}px`;
		} else {
			console.warn("KWCAG Checker: content.js - Element to highlight not found for selector:", selector);
		}
	} catch (e) {
		console.warn("KWCAG Checker: content.js - Could not highlight element for selector:", selector, e);
	}
}

/**
 * 현재 하이라이트된 요소를 제거합니다.
 */
function removeHighlight() {
	if (highlightDiv) {
		console.log('KWCAG Checker: content.js - Removing highlight');
		highlightDiv.remove();
		highlightDiv = null;
	}
}

// Axe-core 설정 (manifest.json에 의해 이미 axe.js가 로드된 후 실행됨)
function configureAxe() {
  if (typeof window.axe === 'undefined') {
    console.error("KWCAG Checker: content.js - axe-core is not available for configuration.");
    // 필요한 경우, 재시도 로직 또는 사용자 알림 추가
    return;
  }
  console.log("KWCAG Checker: content.js - Configuring globally available axe-core.");
  window.axe.configure({
    // reporter: 'v2', // DevTools 패널에서 'raw' 결과를 사용하므로 여기서는 불필요할 수 있습니다.
    // branding: { brand: "act-kwcag", application: "KWCAG 2.2 Checker" }, // 선택 사항
    // locale: koLocaleObject, // 만약 axe-core 자체 메시지를 한국어로 하고 싶다면 로케일 객체 전달
    rules: [], // 전역적으로 비활성화할 규칙이 없다면 빈 배열 또는 생략 가능
    disableOtherRules: false // 명시적으로 모든 규칙을 기본적으로 활성화 상태로 둡니다.
  });
  console.log("KWCAG Checker: content.js - axe-core configured.");
}


// axe 검사 실행 함수
async function runAxeCheck() {
  if (typeof axe === 'undefined') {
    throw new Error('axe-core가 로드되지 않았습니다.');
  }

  // Axe 검사 전에 한국어 로케일 데이터 로드 시도
  const currentAxeLocale = await loadAxeLocale();
  // 로케일 로드 실패 시에도 검사는 진행하되, 메시지는 기본 언어(영어)로 나올 수 있음
  // 필요하다면 로케일 로드 실패 시 오류를 발생시키거나 사용자에게 알릴 수 있습니다.

  try {
    const kwcagCriteria = await getKwcagCriteria();
    if (!kwcagCriteria || kwcagCriteria.length === 0) {
      throw new Error('KWCAG 검사 기준을 로드할 수 없습니다.');
    }

    // KWCAG 기준에서 활성화된 axe 규칙 추출
    const enabledRules = kwcagCriteria
      .filter(criterion => criterion.enabled !== false && criterion.axeRules && criterion.axeRules.length > 0) // axeRules 존재 여부 및 비활성화된 기준 필터링
      .reduce((rules, criterion) => {
        if (criterion.axeRules) {
          criterion.axeRules.forEach(ruleId => {
            if (ruleId) { // ruleId가 null이나 undefined가 아닌지 확인
              rules[ruleId] = { enabled: true };
            }
          });
        }
        return rules;
      }, {});

    if (Object.keys(enabledRules).length === 0) {
      console.warn("KWCAG Checker: content.js - No Axe rules derived from KWCAG criteria. Axe will run with its default ruleset or rules specified in global config if any.");
    // KWCAG 기준에서 파생된 규칙이 없을 경우의 처리 (예: 기본 규칙 실행 또는 오류)
    // 현재는 axe.run이 이 상황을 처리하도록 둡니다.
    }

    const options = {
      resultTypes: ['violations'],
      rules: enabledRules,
      iframes: false,
      elementRef: true,
      locale: currentAxeLocale // 로드된 한국어 로케일 전달
    };

    console.log('KWCAG Checker: content.js - Running Axe with options:', JSON.stringify(options));
    const results = await axe.run(document, options);

    console.log('KWCAG Checker: content.js - Axe scan complete. Raw results:', results);

    if (results.violations) {
      results.violations = results.violations
        .filter(violation => 
          violation.nodes && violation.nodes.length > 0 // nodes 존재 확인
        )
        .map(violation => {
          const criterion = kwcagCriteria.find(c => 
            c.axeRules && 
            c.axeRules.includes(violation.id)
          );
          return criterion ? { // kwcag 객체에 link 추가
            ...violation,
            kwcag: { id: criterion.kwcagId, title: criterion.kwcagTitle, link: criterion.kwcagLink }
          } : violation; // 해당 KWCAG 기준이 없으면 원래 violation 반환
        });
    }

    return results;
  } catch (error) {
    console.error('KWCAG Checker: content.js - Axe scan failed:', error);
    throw error;
  }
}

// 통합된 메시지 리스너
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("KWCAG Checker: content.js - MESSAGE RECEIVED:", message);

  if (message.action === "runAxeCheck") {
    runAxeCheck()
      .then(results => sendResponse({ success: true, results }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.action === "highlightElement" && message.selectors) {
    highlightElement(message.selectors);
    sendResponse({ success: true });
    return;
  }

  if (message.action === "removeHighlight") {
    removeHighlight();
    sendResponse({ success: true });
    return;
  }

  return true;
});

// 초기화
// DOM이 로드된 후 Axe 설정을 실행합니다.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', configureAxe);
} else {
  configureAxe(); // DOMContentLoaded가 이미 발생한 경우 즉시 실행
}

console.log("KWCAG Checker: content.js - Message listeners attached and Axe configuration queued/run.");