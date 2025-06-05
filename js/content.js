console.log("KWCAG Checker: content.js - SCRIPT LOADED AND RUNNING.");

let highlightElements = []; // 여러 하이라이트 요소를 저장할 배열
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
 * 지정된 CSS 선택자에 해당하는 페이지 요소를 하이라이트합니다.
 * @param {string[]} targetSelectors - 하이라이트할 요소의 CSS 선택자 배열
 */
function highlightElement(targetSelectors) {
	console.log('KWCAG Checker: content.js - Highlighting elements:', targetSelectors);
	removeHighlight(); // 기존 하이라이트 제거

	if (!targetSelectors || targetSelectors.length === 0) {
		console.log('KWCAG Checker: content.js - No selectors provided for highlighting.');
		return;
	}

	let firstElementFound = null;

	targetSelectors.forEach(selector => {
		try {
			// querySelectorAll을 사용하여 해당 선택자에 맞는 모든 요소를 찾습니다.
			const elements = document.querySelectorAll(selector);
			if (elements.length > 0) {
				elements.forEach(element => {
					if (!firstElementFound) {
						// 첫 번째 찾은 요소로 스크롤합니다.
						element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
						firstElementFound = element;
					}

					// 각 요소에 대해 하이라이트 div를 생성합니다.
					const highlightDiv = document.createElement('div');
					highlightDiv.className = 'kwcag-checker-highlight'; // 클래스로 변경하여 여러 개 관리
					// 스타일은 CSS로 관리하는 것이 좋지만, 여기서는 직접 설정합니다.
					highlightDiv.style.position = 'absolute';
					highlightDiv.style.zIndex = '2147483646'; // 오버레이보다는 아래
					highlightDiv.style.border = '3px dashed red'; // 점선으로 변경
					highlightDiv.style.borderRadius = '3px';
					highlightDiv.style.pointerEvents = 'none';
					highlightDiv.style.boxSizing = 'border-box';
					// 스크롤 위치를 고려하여 정확한 위치 계산
					const rect = element.getBoundingClientRect();
					highlightDiv.style.left = `${rect.left + window.scrollX}px`;
					highlightDiv.style.top = `${rect.top + window.scrollY}px`;
					highlightDiv.style.width = `${rect.width}px`;
					highlightDiv.style.height = `${rect.height}px`;

					document.body.appendChild(highlightDiv);
					highlightElements.push(highlightDiv); // 생성된 하이라이트 div를 배열에 추가
				});
			} else {
				console.warn("KWCAG Checker: content.js - Element(s) to highlight not found for selector:", selector);
			}
		} catch (e) {
			console.warn("KWCAG Checker: content.js - Could not highlight element(s) for selector:", selector, e);
		}
	});
}

/**
 * 현재 하이라이트된 모든 요소를 제거합니다.
 */
function removeHighlight() {
	console.log('KWCAG Checker: content.js - Removing all highlights');
	highlightElements.forEach(div => {
		if (div && div.parentNode) {
			div.parentNode.removeChild(div);
		}
	});
	highlightElements = []; // 배열 비우기
}


// KACT 검사 실행 함수 (모든 자동 검사 항목 처리)
async function runKactCheck() {
  try {
    const kwcagCriteria = await getKwcagCriteria();
    if (!kwcagCriteria || kwcagCriteria.length === 0) {
      throw new Error('KWCAG 검사 기준을 로드할 수 없습니다.');
    }

    const allKactResults = []; // 모든 KACT 규칙의 결과를 담을 배열

    // 자동 검사 또는 부분 자동 검사 항목 필터링
    const automatedCriteria = kwcagCriteria.filter(c => c.automationType === 'partial' || c.automationType === 'full');

    console.log(`KWCAG Checker: content.js - Found ${automatedCriteria.length} automated criteria to process.`);

    for (const criterion of automatedCriteria) {
        if (criterion.kactRules && typeof criterion.kactRules === 'string') {
            console.log(`KWCAG Checker: content.js - Processing criterion: ${criterion.kwcagId} (${criterion.kactRules})`);
            try {
                // KACT 규칙 파일 동적 import
                const ruleModule = await import(chrome.runtime.getURL(criterion.kactRules));

                if (ruleModule.default && typeof ruleModule.default.check === 'function') {
                    console.log(`KWCAG Checker: content.js - Running KACT rule: ${criterion.kwcagId}`);
                    // check 함수 실행 및 결과 수집
                    const ruleResults = await ruleModule.default.check(document, { /* KACT 규칙 실행 옵션 */ }); // await 추가
                    console.log(`KWCAG Checker: content.js - KACT rule ${criterion.kwcagId} returned results:`, ruleResults);

                    // KACT 규칙 결과를 allKactResults 배열에 추가
                    // kact22-5.1.1.js의 check 함수는 이미 kwcag 정보를 포함한 배열을 반환한다고 가정
                    if (Array.isArray(ruleResults)) {
                        allKactResults.push(...ruleResults); // 배열의 모든 요소를 추가
                    } else {
                         console.warn(`KWCAG Checker: content.js - KACT rule ${criterion.kwcagId} did not return an array.`);
                         // 배열이 아닌 경우 오류 처리 또는 무시
                    }

                } else {
                    console.error(`KWCAG Checker: content.js - KACT rule ${criterion.kactRules} is missing a default export or a check function.`);
                    const errorMessage = `KACT 규칙 ${criterion.kwcagId} (${criterion.kactRules}) 파일의 형식이 올바르지 않습니다. 유효한 default export 또는 check 함수가 없습니다.`;
                    console.error(`KWCAG Checker: content.js - ${errorMessage}`);
                    allKactResults.push({
                        id: `kact-malformed-${criterion.kwcagId}`,
                        impact: 'critical',
                        tags: ['kwcag', 'kact-error', 'kact-malformed', criterion.automationType === 'partial' ? 'partial-check' : 'full-check'],
                        description: `KACT 규칙 ${criterion.kwcagId} (${criterion.kactRules}) 파일의 형식이 올바르지 않습니다.`,
                        help: errorMessage,
                        helpUrl: criterion.kwcagLink,
                        nodes: [{ failureSummary: errorMessage }],
                        kwcag: { id: criterion.kwcagId, title: criterion.kwcagTitle, link: criterion.kwcagLink }
                    });
                }
            } catch (e) {
                console.error(`KWCAG Checker: content.js - Error running KACT rule ${criterion.kactRules}:`, e);
                allKactResults.push({
                    id: `kact-error-${criterion.kwcagId}`,
                    impact: 'critical',
                    tags: ['kwcag', 'kact-error', criterion.automationType === 'partial' ? 'partial-check' : 'full-check'],
                    description: `KACT 규칙 ${criterion.kwcagId} (${criterion.kactRules}) 실행 중 오류가 발생했습니다.`,
                    help: `오류: ${e.message}`,
                    helpUrl: criterion.kwcagLink,
                    nodes: [{ failureSummary: `KACT 규칙 ${criterion.kactRules} 실행 실패: ${e.message}` }],
                    kwcag: { id: criterion.kwcagId, title: criterion.kwcagTitle, link: criterion.kwcagLink }
                });
            }
        } else {
             console.warn(`KWCAG Checker: content.js - Criterion ${criterion.kwcagId} is marked as automated but is missing kactRules or kactRules is not a string.`);
             allKactResults.push({
                id: `kact-config-error-${criterion.kwcagId}`,
                impact: 'critical',
                tags: ['kwcag', 'kact-error', 'kact-config-error', criterion.automationType === 'partial' ? 'partial-check' : 'full-check'],
                description: `KWCAG 기준 ${criterion.kwcagId}의 설정 오류: kactRules가 지정되지 않았거나 문자열이 아닙니다.`,
                help: `kwcag-criteria.json 파일에서 KWCAG ID ${criterion.kwcagId} 항목의 kactRules 설정을 확인하십시오.`,
                helpUrl: criterion.kwcagLink,
                nodes: [{ failureSummary: `KWCAG 기준 ${criterion.kwcagId} 설정 오류` }],
                kwcag: { id: criterion.kwcagId, title: criterion.kwcagTitle, link: criterion.kwcagLink }
            });
        }
    }

    // 최종 결과 객체 구성 (모든 KACT 규칙 결과 포함)
    // KACT 규칙 결과는 모두 'violations' 배열에 포함시킵니다.
    // 'passes', 'incomplete', 'inapplicable' 등은 KACT 규칙에서 직접 보고하지 않으므로 비워둡니다.
    return {
      violations: allKactResults, // 모든 KACT 결과를 violations에 담음
      manualChecks: [], // 수동 검사 항목은 panel.js에서 kwcagCriteriaData를 보고 판단
      passes: [],
      incomplete: [],
      inapplicable: [],
      toolOptions: { reporter: 'v2' },
      testEngine: { name: "kact-rules", version: 'unknown' }, // KACT 규칙 버전 정보 필요 시 추가
      testRunner: { name: "KWCAG Checker" },
      testEnvironment: { userAgent: navigator.userAgent, windowWidth: window.innerWidth, windowHeight: window.innerHeight },
      timestamp: new Date().toISOString(),
      url: document.location.href
    };
  } catch (error) {
    console.error('KWCAG Checker: content.js - KACT scan failed:', error);
    throw error;
  }
}

// 통합된 메시지 리스너
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("KWCAG Checker: content.js - MESSAGE RECEIVED:", message);

  if (message.action === "runKactCheck") { // 액션 이름 변경
    runKactCheck() // 함수 호출 변경
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

/**
 * 이미지 URL을 Base64 데이터 URL로 변환합니다.
 * @param {string} url 이미지 URL
 * @returns {Promise<string|null>} Base64 데이터 URL 또는 오류 시 null
 */
async function imageUrlToBase64(url) {
    try {
        // 동일 출처(same-origin) 정책으로 인해 외부 이미지 로드가 제한될 수 있습니다.
        // 크로스 오리진 이미지를 로드하려면 해당 서버에서 CORS 헤더를 허용해야 합니다.
        // 또는 background script를 통해 이미지를 가져오는 방법도 고려할 수 있습니다.
        const response = await fetch(url, { mode: 'cors' }); // CORS 모드 사용
        if (!response.ok) {
            console.warn(`KWCAG Checker: content.js - Failed to fetch image ${url}: ${response.status} ${response.statusText}`);
            return null;
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.warn(`KWCAG Checker: content.js - Error converting image URL to Base64 for ${url}:`, error);
        return null;
    }
}


// 초기화
console.log("KWCAG Checker: content.js - Message listeners attached.");
