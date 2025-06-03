// panel.js

let kwcagCriteriaData = null;
let axeLocaleKO = null;

// 데이터 로드 함수
async function loadData() {
	try {
		// 이 부분에서 오류가 발생하는지 DevTools 패널의 콘솔에서 확인
		const criteriaResponse = await fetch(chrome.runtime.getURL('data/kwcag-criteria.json'));
		if (!criteriaResponse.ok) throw new Error(`Failed to fetch kwcag-criteria.json: ${criteriaResponse.statusText}`);
		kwcagCriteriaData = await criteriaResponse.json();

		// 또는 이 부분에서 오류가 발생하는지 확인
		const localeResponse = await fetch(chrome.runtime.getURL('data/ko.json'));
		if (!localeResponse.ok) throw new Error(`Failed to fetch ko.json: ${localeResponse.statusText}`);
		axeLocaleKO = await localeResponse.json();

		console.log("KWCAG 데이터 및 한국어 로케일 로드 완료 (패널).");
	} catch (error) {
		// ERR_FILE_NOT_FOUND는 여기서 잡힐 가능성이 높습니다.
		console.error("데이터 로드 중 오류 (패널):", error);
		const resultsDiv = document.getElementById('results');
		if (resultsDiv) resultsDiv.textContent = `오류: 중요 데이터 파일을 불러오지 못했습니다. ${error.message}`;
		// 데이터 로드 실패 시 null로 유지하여 이후 로직에서 확인 가능하도록 함
		kwcagCriteriaData = null;
		axeLocaleKO = null;
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
			if (!kwcagCriteriaData || !axeLocaleKO) {
				resultsDiv.textContent = "오류: KWCAG 데이터 또는 한국어 로케일 파일을 불러오지 못했습니다. 확장 프로그램을 다시 로드하거나 개발자에게 문의하세요.";
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

				const response = await chrome.tabs.sendMessage(tab.id, { action: "runAxeCheck" });

				if (response && response.success && response.results) {
					// KwcagTranslator 클래스가 이 파일에 포함되거나 import 되어야 합니다.
					// 예: import KwcagTranslator from './kwcag-translator.js'; (manifest.json type: "module" 필요)
					const translator = new KwcagTranslator(kwcagCriteriaData, axeLocaleKO);
					const kwcagReport = translator.translateAxeToKwcagReport(response.results);
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

	// 위반 사항 요약 계산
	const totalKwcagItemsWithViolations = report.filter(item => item.violations.length > 0).length;
	const grandTotalAxeViolations = report.reduce((acc, item) => acc + item.violations.length, 0);
	const totalManualCheckItems = report.filter(item => item.automationType !== 'auto' && item.violations.length === 0).length;

	let summaryHtml = '<div class="report-summary" style="padding: 10px; border-bottom: 1px solid #ccc; margin-bottom: 15px;">';
	if (grandTotalAxeViolations > 0) {
		summaryHtml += `<p><strong>총 ${totalKwcagItemsWithViolations}개의 KWCAG 평가 항목에서 ${grandTotalAxeViolations}개의 자동 검사 위반 사항이 발견되었습니다.</strong></p>`;
	} else {
		summaryHtml += '<p><strong>자동 검사 위반 사항이 발견되지 않았습니다.</strong></p>';
	}
	if (totalManualCheckItems > 0 && grandTotalAxeViolations === 0) { // 자동 위반 없고 수동만 있을 때
		summaryHtml += `<p>일부 항목에 대해 수동 확인이 필요합니다. (${totalManualCheckItems}개 항목)</p>`;
	} else if (totalManualCheckItems > 0 && totalKwcagItemsWithViolations > 0) { // 자동 위반도 있고 수동도 있을 때
		summaryHtml += `<p>위반 사항 외 ${totalManualCheckItems}개 항목에 대해 추가적인 수동 확인이 필요할 수 있습니다.</p>`;
	}
	summaryHtml += '</div>';
	container.innerHTML += summaryHtml; // 요약 정보를 컨테이너에 추가

	const ul = document.createElement('ul');
	ul.className = 'kwcag-report-list';

	report.forEach(item => {
		const li = document.createElement('li');
		li.className = `kwcag-item ${item.violations.length > 0 ? 'has-violations' : (item.automationType !== 'auto' ? 'needs-manual-check' : 'no-violations-found')}`;

		let itemHtml = `
			<details class="kwcag-item-details">
				<summary>
					<h3>${item.kwcagId || 'ID 없음'} ${item.kwcagTitle || '제목 없음'} (${item.automationType || '정보 없음'})</h3>
					<span class="status">
						${item.violations.length > 0 ? `위반: ${item.violations.length}건` : (item.automationType !== 'auto' ? '수동확인필요' : '자동검사 통과/해당없음')}
					</span>
				</summary>
				<div class="kwcag-item-content">
					<p>${item.kwcagDescription || item.description || '설명 없음'}</p>
					${item.kwcagLink ? `<p><a href="${item.kwcagLink}" target="_blank" rel="noopener noreferrer">KWCAG 기준 보기</a></p>` : '<p>KWCAG 기준 링크 정보 없음</p>'}`;

		if (item.violations.length > 0) {
			itemHtml += `<h4>위반 사항 (${item.violations.length}):</h4><ul class="violations-list">`;
			item.violations.forEach(v => {
				itemHtml += `
          <li class="violation-detail">
            <strong>Axe 규칙: ${v.ruleId}</strong> (Impact: ${v.impact || '정보 없음'})
            <p>${v.translatedHelp || v.axeHelp}</p>
            ${v.nodes.map(n => `
              <div class="violation-node">
                <p>대상: <code>${escapeHTML(n.target.join(', '))}</code></p>
                ${n.html ? `<pre><code>${escapeHTML(n.html)}</code></pre>` : ''}
                <p>메시지: ${escapeHTML(n.failureSummary || '메시지 없음')}</p>
                <button class="highlight-btn" data-selectors='${JSON.stringify(n.target)}'>요소 보기</button>
              </div>`).join('')}
          </li>`;
			});
			itemHtml += `</ul>`;
		}

		// 수동 점검 항목 및 정정 방법 안내 표시 (KwcagTranslator에서 채워진다고 가정)
		if (item.manualChecks && item.manualChecks.length > 0) itemHtml += `<h4>수동 점검 항목:</h4><ul>${item.manualChecks.map(mc => `<li>${escapeHTML(mc)}</li>`).join('')}</ul>`;
		if (item.fixGuidance && item.fixGuidance.length > 0) itemHtml += `<h4>정정 방법 안내:</h4><ul>${item.fixGuidance.map(fg => `<li>${escapeHTML(fg)}</li>`).join('')}</ul>`;

		itemHtml += `</div></details>`;
		li.innerHTML = itemHtml;
		ul.appendChild(li);
	});

	container.appendChild(ul);

	container.querySelectorAll('.highlight-btn').forEach(button => {
		button.addEventListener('click', (event) => {
			const selectors = JSON.parse(event.target.dataset.selectors);
			chrome.tabs.sendMessage(tabId, { action: "highlightElement", selectors: selectors });
		});
	});
}

function displayError(message, container) {
	container.innerHTML = `<p class="error">${message}</p>`;
}