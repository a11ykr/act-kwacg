// panel.js

let kwcagCriteriaData = null;

// 데이터 로드 함수
async function loadData() {
	try {
		// 이 부분에서 오류가 발생하는지 DevTools 패널의 콘솔에서 확인
		const criteriaResponse = await fetch(chrome.runtime.getURL('data/kwcag-criteria.json'));
		if (!criteriaResponse.ok) throw new Error(`Failed to fetch kwcag-criteria.json: ${criteriaResponse.statusText}`);
		kwcagCriteriaData = await criteriaResponse.json();

		console.log("KWCAG 데이터 로드 완료 (패널).");
	} catch (error) {
		// ERR_FILE_NOT_FOUND는 여기서 잡힐 가능성이 높습니다.
		console.error("데이터 로드 중 오류 (패널):", error);
		const resultsDiv = document.getElementById('results');
		if (resultsDiv) resultsDiv.textContent = `오류: 중요 데이터 파일을 불러오지 못했습니다. ${error.message}`;
		// 데이터 로드 실패 시 null로 유지하여 이후 로직에서 확인 가능하도록 함
		kwcagCriteriaData = null;
	}
}

function escapeHTML(str) {
	if (typeof str !== 'string') return '';
	const div = document.createElement('div');
	div.appendChild(document.createTextNode(str));
	return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', async () => {
	await loadData(); // 패널이 로드될 때 데이터 로드

	const scanButton = document.getElementById('scanButton');
	const resultsDiv = document.getElementById('results');
	const loadingDiv = document.getElementById('loading'); // HTML에 <div id="loading" style="display:none;">검사 중...</div> 추가 필요

	if (scanButton && resultsDiv && loadingDiv) {
		scanButton.addEventListener('click', async () => {
			if (!kwcagCriteriaData) {
				resultsDiv.textContent = "오류: KWCAG 데이터 파일을 불러오지 못했습니다. 확장 프로그램을 다시 로드하거나 개발자에게 문의하세요.";
				return;
			}

			resultsDiv.innerHTML = ''; // 이전 결과 지우기
			loadingDiv.style.display = 'block';
			scanButton.disabled = true;

			try {
				const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
				if (!tab || !tab.id) {
					throw new Error("활성 탭을 찾을 수 없습니다.");
				}

				const response = await chrome.tabs.sendMessage(tab.id, { action: "runKactCheck" }); // 액션 이름 변경

				if (response && response.success && response.results) {
					// KwcagTranslator 클래스가 이 파일에 포함되거나 import 되어야 합니다.
					// 예: import KwcagTranslator from './kwcag-translator.js'; (manifest.json type: "module" 필요)
					const translator = new KwcagTranslator(kwcagCriteriaData); // axeLocaleKO 인자 제거
					const kwcagReport = translator.translateKactResultsToKwcagReport(response.results); // 함수 이름 변경
					displayKwcagReport(kwcagReport, resultsDiv, tab.id);
				} else {
					throw new Error(response.error || "검사 결과를 받지 못했습니다.");
				}
			} catch (error) {
				console.error('검사 실행 중 오류 (패널):', error);
				displayError(`검사 오류: ${error.message}`, resultsDiv);
			} finally {
				loadingDiv.style.display = 'none';
				scanButton.disabled = false;
			}
		});
	} else {
		console.error("Panel UI elements (scanButton, results, loading) not found.");
	}
});

function displayKwcagReport(report, container, tabId) {
	container.innerHTML = '';

	if (!report || report.length === 0) {
		container.innerHTML = '<p>분석된 KWCAG 항목이 없습니다.</p>';
		return;
	}

	// 검사 결과 요약 계산 (KACT 결과 기반)
	// content.js에서 5.1.1만 처리하므로, violations 배열에는 5.1.1 결과만 포함될 것으로 예상
	const item511 = report.find(item => item.kwcagId === '5.1.1');
	const total511Violations = item511 ? item511.violations.length : 0;
	// 5.1.1 항목의 violations 배열에 있는 모든 노드의 수를 합산하여 검사 대상 요소 수 계산
	const total511Nodes = item511 ? item511.violations.reduce((acc, v) => acc + (v.nodes ? v.nodes.length : 0), 0) : 0;


	let summaryHtml = '<div class="report-summary" style="padding: 10px; border-bottom: 1px solid #ccc; margin-bottom: 15px;">';
	if (total511Nodes > 0) {
		summaryHtml += `<p><strong>5.1.1 대체 텍스트 제공: ${total511Nodes}개의 검사 대상 요소가 발견되었습니다.</strong></p>`;
		// 명확한 위반 사항이 있다면 추가로 표시 (impact가 critical인 경우)
		const criticalViolations = item511 ? item511.violations.filter(v => v.impact === 'critical').length : 0;
		if (criticalViolations > 0) {
			summaryHtml += `<p><strong>명확한 위반 사항: ${criticalViolations}건 발견.</strong></p>`;
		}
		summaryHtml += `<p>나머지 항목에 대해서는 수동 확인이 필요합니다.</p>`; // 5.1.1 외 항목 또는 5.1.1의 수동 확인 필요 항목
	} else {
		summaryHtml += '<p><strong>5.1.1 대체 텍스트 제공: 검사 대상 요소가 발견되지 않았습니다.</strong></p>';
	}
	summaryHtml += '</div>';
	container.innerHTML += summaryHtml; // 요약 정보를 컨테이너에 추가


	const ul = document.createElement('ul');
	ul.className = 'kwcag-report-list';

	report.forEach(item => {
		const li = document.createElement('li');
		li.className = `kwcag-item ${item.violations.length > 0 ? 'has-violations' : (item.automationType !== 'auto' ? 'needs-manual-check' : 'no-violations-found')}`;

		// automationType에 따라 텍스트 변경
		const automationTypeText = (item.automationType === 'partial' || item.automationType === 'full') ? '자동 검사' : (item.automationType || '정보 없음');

		let itemHtml = `
			<details class="kwcag-item-details">
					<summary>
						<h3>${item.kwcagId || 'ID 없음'} ${item.kwcagTitle || '제목 없음'} (${automationTypeText})</h3>
						<span class="status">
							${item.violations.length > 0 ? `검출: ${item.violations.length}건` : (item.automationType !== 'auto' ? '수동확인필요' : '자동검사 통과/해당없음')}
						</span>
					</summary>
					<div class="kwcag-item-content">
						<p>${item.kwcagDescription || item.description || '설명 없음'}</p>
						${item.kwcagLink ? `<p><a href="${item.kwcagLink}" target="_blank" rel="noopener noreferrer">KWCAG 기준 보기</a></p>` : '<p>KWCAG 기준 링크 정보 없음</p>'}`;

			// KWCAG 5.1.1 규칙에 대한 특별 표시 형식 적용
			// violations 배열에 kwcagDisplayData를 가진 노드가 하나라도 있으면 상세 정보 표시
			if (item.kwcagId === '5.1.1' && item.violations.some(v => v.nodes && v.nodes.some(n => n.kwcagDisplayData))) {
				// 사용자가 요청한 형식으로 변경
				// violations 배열에 있는 모든 노드의 수를 합산하여 표시
				const totalNodes = item.violations.reduce((acc, v) => acc + (v.nodes ? v.nodes.length : 0), 0);
				// "심각도 높음"을 "중요도 높음"으로 변경
				itemHtml += `<p>검사 대상 요소: ${totalNodes}건. 정성 평가 필요. 중요도 높음</p>`;

				itemHtml += `<ol class="violations-list">`;
				item.violations.forEach(v => {
					if (v.nodes && v.nodes.length > 0) {
						v.nodes.forEach((n) => {
							console.log('Node infoText:', n.infoText); // 콘솔 출력 추가
							console.log('Node imageHtml:', n.imageHtml); // 콘솔 출력 추가
							itemHtml += `
              <li class="violation-node">`;

							// 이미지 표시 (kact22-5.1.1.js에서 생성된 imageHtml 사용)
							if (n.imageHtml) {
								itemHtml += n.imageHtml;
							} else {
								// imageHtml이 없는 경우 대체 내용 표시
								itemHtml += `<div class="kwcag-display-image" style="flex-shrink: 0; margin-right: 10px;"><span style="display: inline-block; width: 100px; height: 50px; border: 1px dashed #ccc; text-align: center; line-height: 50px; font-size: 0.8em; color: #999;">이미지 표시 불가</span></div>`;
							}

							// 유형과 alt 값 등 정보 표시 (kact22-5.1.1.js에서 생성된 infoText 사용)
							if (n.infoText) {
								itemHtml += `<div style="flex-grow: 1; font-size: 0.9em; margin-top: 5px;">${escapeHTML(n.infoText)}</div>`;
							} else {
								// infoText가 없는 경우 대체 내용 표시
								itemHtml += `<div style="color: red; margin-top: 5px;">출력 정보 생성 오류 또는 데이터 부족</div>`;
								if (n.failureSummary) itemHtml += `<div style="font-size: 0.9em;">${escapeHTML(n.failureSummary)}</div>`;
							}


						// 요소 보기 버튼 추가 (panel.js에서 이벤트 처리)
						const selector = n.elementSelector || (n.target ? n.target.join(', ') : '선택자 없음');
						const highlightSelectors = selector && selector !== '선택자 없음' ? [selector] : [];
						if (highlightSelectors.length > 0) {
							itemHtml += `<div class="kwcag-display-actions" style="flex-shrink: 0; margin-left: 0; margin-top: 5px;">`; // margin-left를 0으로 변경하고 margin-top 추가
							itemHtml += `<button class="highlight-btn" data-selectors='${JSON.stringify(highlightSelectors)}' style="padding: 4px 8px; font-size: 0.8em;">요소 보기</button>`;
							itemHtml += `</div>`;
						}


						itemHtml += `</li>`; // .violation-node 끝
					});
				}
			});
			itemHtml += `</ol>`;

		} else if (item.violations.length > 0) { // KWCAG 5.1.1 외 다른 규칙의 위반 사항 표시 (KACT 결과 기반으로 변경)
			itemHtml += `<h4>검출된 문제 (${item.violations.length}):</h4><ul class="violations-list">`; // 텍스트 변경
			item.violations.forEach(v => {
				// 심각도 값을 중요도로 매핑
				let importance = '정보 없음';
				if (v.impact === 'critical') {
					importance = '높음';
				} // 다른 심각도 수준이 있다면 여기에 추가

				itemHtml += `
          <li class="violation-detail">
            (${importance})
            <p>${v.help || '도움말 없음'}</p>`; // Axe help 대신 KACT help 사용

				if (v.nodes && v.nodes.length > 0) {
					itemHtml += `<h4>관련 요소:</h4><ul class="violations-list">`; // 텍스트 변경
					v.nodes.forEach(n => {
						const selector = n.target ? n.target.join(', ') : '선택자 없음';
						itemHtml += `
              <li class="violation-node">`; // 클래스명 유지

						itemHtml += `<div class="violation-basic-display" style="border: 1px solid #eee; padding: 8px; margin-bottom: 5px;">`;
						itemHtml += `<p style="margin: 0; font-size: 0.9em;">선택자: ${escapeHTML(selector || '정보 없음')}</p>`; // 다른 규칙은 선택자 표시 유지
						if (n.html) {
							itemHtml += `<p style="margin: 0; font-size: 0.9em;">HTML: <code>${escapeHTML(n.html)}</code></p>`;
						}
						const highlightSelectors = n.target || [];
						if (highlightSelectors.length > 0) {
							itemHtml += `<button class="highlight-btn" data-selectors='${JSON.stringify(highlightSelectors)}' style="padding: 4px 8px; font-size: 0.8em; margin-top: 5px;">요소 보기</button>`;
						} else {
							itemHtml += `<span style="font-size: 0.8em; color: #999; margin-top: 5px; display: inline-block;">요소 보기 불가</span>`;
						}
						itemHtml += `</div>`;

						itemHtml += `</li>`; // .violation-node 끝
					});
					itemHtml += `</ul>`; // .violations-list 끝
				}

				itemHtml += `</li>`; // .violation-detail 끝
			});
			itemHtml += `</ul>`; // .violations-list 끝
		}

		// 수동 점검 항목 및 정정 방법 안내 표시 (KwcagTranslator에서 채워진다고 가정)
		if (item.manualChecks && item.manualChecks.length > 0) itemHtml += `<h4>수동 점검 항목:</h4><ul class="manual-checks-list">${item.manualChecks.map(mc => `<li>${escapeHTML(mc)}</li>`).join('')}</ul>`;
		if (item.fixGuidance && item.fixGuidance.length > 0) itemHtml += `<h4>정정 방법 안내:</h4><ul class="fix-guidance-list">${item.fixGuidance.map(fg => `<li>${escapeHTML(fg)}</li>`).join('')}</ul>`;

		itemHtml += `</div></details>`;
		li.innerHTML = itemHtml;
		ul.appendChild(li);
	});

	container.appendChild(ul);

	container.querySelectorAll('.highlight-btn').forEach(button => {
		button.addEventListener('click', (event) => {
			const selectors = JSON.parse(event.target.dataset.selectors);
			console.log('Clicked button selectors:', selectors); // 콘솔 출력 추가

			// 클릭된 버튼과 연결된 이미지 및 정보 확인 (DOM 탐색 필요)
			const listItem = event.target.closest('li.violation-node');
			if (listItem) {
				const imageElement = listItem.querySelector('.kwcag-display-image img');
				const infoElement = listItem.querySelector('div[style*="flex-grow: 1"]');
				if (imageElement) {
					console.log('Clicked button related image src:', imageElement.src); // 콘솔 출력 추가
					console.log('Clicked button related image alt:', imageElement.alt); // 콘솔 출력 추가
				}
				if (infoElement) {
					console.log('Clicked button related info text:', infoElement.textContent); // 콘솔 출력 추가
				}
			}

			chrome.tabs.sendMessage(tabId, { action: "highlightElement", selectors: selectors });
		});
	});
}

function displayError(message, container) {
	container.innerHTML = `<p class="error">${message}</p>`;
}
