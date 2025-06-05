// js/kwcag-translator.js

class KwcagTranslator {
	// kwcagCriteriaData: KWCAG 기준 정보 배열
	constructor(kwcagCriteriaData) {
		this.kwcagCriteria = kwcagCriteriaData;
	}

	// KACT 결과를 KWCAG 보고서 형식으로 변환
	translateKactResultsToKwcagReport(kactResults) {
		const report = [];
		const kactViolationsByKwcag = {};

		if (kactResults && kactResults.violations) {
			kactResults.violations.forEach(violation => {
				// content.js에서 첨부한 kwcag 정보 활용
				const kwcagCriterionForViolation = violation.kwcag;
				if (kwcagCriterionForViolation && kwcagCriterionForViolation.id) {
					const kwcagId = kwcagCriterionForViolation.id;
					if (!kactViolationsByKwcag[kwcagId]) {
						kactViolationsByKwcag[kwcagId] = [];
					}
					// KACT 결과의 모든 노드 정보를 그대로 포함
					kactViolationsByKwcag[kwcagId].push({
						ruleId: violation.id, // KACT rule ID
						help: violation.help,
						impact: violation.impact,
						nodes: violation.nodes.map(node => ({
							target: node.target, // CSS selectors
							html: node.html,
							failureSummary: node.failureSummary || violation.help,
							imageHtml: node.imageHtml, // imageHtml 포함
							infoText: node.infoText,   // infoText 포함
							elementSelector: node.elementSelector, // 요소 보기 버튼을 위해 포함
							rawElementOuterHTML: node.rawElementOuterHTML, // 필요시 포함
							kwcagDisplayData: node.kwcagDisplayData // 원본 데이터 포함
						})),
					});
				}
			});
		}

		// 모든 KWCAG 기준에 대해 보고서 항목 생성
		this.kwcagCriteria.forEach(criterion => {
			// 5.1.1 항목에 대해서만 KACT 결과를 violations에 포함
			const violationsForCriterion = (criterion.kwcagId === '5.1.1') ? (kactViolationsByKwcag[criterion.kwcagId] || []) : [];

			report.push({
				kwcagId: criterion.kwcagId,
				kwcagTitle: criterion.kwcagTitle,
				kwcagDescription: criterion.description,
				kwcagLink: criterion.kwcagLink,
				automationType: criterion.automationType || 'manual', // 'auto', 'semi-auto', 'manual'
				violations: violationsForCriterion, // 5.1.1 결과만 포함
				// KACT 결과에서 passes, inapplicable 정보는 현재 없으므로 빈 배열 유지
				passes: [],
				inapplicable: [],
				// content.js에서 manualChecks를 별도로 처리하여 전달하는 경우, 해당 데이터를 사용
				// 현재 content.js는 manualChecks를 반환하지만, KwcagTranslator는 violations만 처리하고 있음.
				// manualChecks도 보고서에 포함하려면 KwcagTranslator의 인자 및 로직 수정 필요.
				// 일단 violations만 처리하도록 유지.
				manualChecks: criterion.manualCheckGuidance || [], // 기준 파일의 수동 점검 안내 사용
				fixGuidance: criterion.fixGuidance || [] // 기준 파일의 정정 방법 안내 사용
			});
		});

		// content.js에서 전달된 manualChecks를 보고서에 추가 (필요시)
		// 현재 KwcagTranslator는 kactResults.violations만 처리하므로, manualChecks는 panel.js에서 직접 처리해야 할 수 있음.
		// 또는 KwcagTranslator의 인자를 { violations, manualChecks } 형태로 받도록 수정.
		// 일단 현재 구조 유지하며 violations만 변환.

		return report;
	}
}

// panel.js에서 new KwcagTranslator(kwcagCriteriaData) 형태로 사용
// translateKactResultsToKwcagReport(response.results) 호출
