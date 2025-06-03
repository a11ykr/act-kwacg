// js/kwcag-translator.js

class KwcagTranslator {
	// kwcagCriteriaData: KWCAG 기준 정보 배열
	// axeLocaleKO: Axe 규칙 등에 대한 한국어 번역 객체
	constructor(kwcagCriteriaData, axeLocaleKO) {
		this.kwcagCriteria = kwcagCriteriaData;
		this.axeLocale = axeLocaleKO;
	}

	// Axe 규칙 설명을 한국어로 번역 (ko.json 구조에 따라 조정 필요)
	translateAxeHelp(ruleId, axeHelpDefault) {
		if (this.axeLocale && this.axeLocale.rules && this.axeLocale.rules[ruleId] && this.axeLocale.rules[ruleId].help) {
			return this.axeLocale.rules[ruleId].help;
		}
		return axeHelpDefault || ruleId;
	}

	// Axe impact를 한국어로 번역 (ko.json 구조에 따라 조정 필요)
	translateAxeImpact(impact) {
		if (this.axeLocale && this.axeLocale.impact && this.axeLocale.impact[impact]) {
			return this.axeLocale.impact[impact];
		}
		return impact;
	}

	// Axe 결과를 KWCAG 보고서 형식으로 변환
	translateAxeToKwcagReport(axeResults) {
		const report = [];
		const violationsByKwcag = {};

		if (axeResults && axeResults.violations) {
			axeResults.violations.forEach(violation => {
				// content.js에서 첨부한 kwcag 정보 활용
				const kwcagCriterionForViolation = violation.kwcag; 
				if (kwcagCriterionForViolation && kwcagCriterionForViolation.id) {
					const kwcagId = kwcagCriterionForViolation.id;
					if (!violationsByKwcag[kwcagId]) {
						violationsByKwcag[kwcagId] = [];
					}
					violationsByKwcag[kwcagId].push({
						ruleId: violation.id, // Axe rule ID
						axeHelp: violation.help, // Axe's original help string
						translatedHelp: this.translateAxeHelp(violation.id, violation.help),
						impact: this.translateAxeImpact(violation.impact),
						nodes: violation.nodes.map(node => ({
							target: node.target, // CSS selectors
							html: node.html,
							failureSummary: node.failureSummary || violation.help, // Axe failure summary
							// elementRef: node.elementRef // DevTools 패널에서 직접 DOM 조작이 어렵다면, selector 기반으로 하이라이트
						})),
					});
				}
			});
		}

		// 모든 KWCAG 기준에 대해 보고서 항목 생성
		this.kwcagCriteria.forEach(criterion => {
			report.push({
				kwcagId: criterion.kwcagId,
				kwcagTitle: criterion.kwcagTitle,
				kwcagDescription: criterion.description,
				kwcagLink: criterion.kwcagLink,
				automationType: criterion.automationType || 'manual', // 'auto', 'semi-auto', 'manual'
				violations: violationsByKwcag[criterion.kwcagId] || [],
				// Axe 결과에서 passes, inapplicable 정보도 매핑 가능
				passes: [], 
				inapplicable: [],
				manualChecks: criterion.manualCheckGuidance || [],
				fixGuidance: criterion.fixGuidance || []
			});
		});

		return report;
	}
}

// panel.js에서 new KwcagTranslator(kwcagCriteriaData, axeLocaleKO) 형태로 사용