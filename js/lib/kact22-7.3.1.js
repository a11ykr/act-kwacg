/**
 * KWCAG 7.3.1: 오류 정정
 * 입력 오류를 정정할 수 있는 방법을 제공해야 한다.
 */
export default {
	id: 'kact-rule-7.3.1',
	kwcagId: '7.3.1',
	title: '오류 정정',
	description: '입력 오류 발생 시 오류 정정 방법 제공 여부를 검토합니다. (KWCAG 7.3.1)',
	tags: ['kwcag', 'kwcag-7.3.1', 'wcag331', 'wcag333'], // WCAG 3.3.1, 3.3.3 매핑

	/**
	 * KWCAG 7.3.1 준수 여부를 검사합니다.
	 * @param {Document} document 검사할 HTML 문서 객체
	 * @param {Object} options 추가 옵션 (필요시 사용)
	 * @returns {Array<Object>} 검사 결과 목록.
	 */
	check(document, options = {}) {
		const results = [];

		// TODO: 7.3.1 자동 검사 로직 구현
		// - 양식 제출 시 오류 발생 시나리오 재현 (자동화 어려움)
		// - aria-invalid 속성 사용 요소 탐지
		// - 오류 메시지 존재 및 오류 필드와의 연관성 확인 (어려움)
		// - 오류 정정 지침 제공 여부 탐지 (매우 어려움)
		// - 중요한 데이터 제출 전 검토/수정 기능 제공 여부 탐지 (매우 어려움)
		// - 수동 검토가 필요한 항목 식별 (대부분의 경우)

		// 예시: aria-invalid="true" 속성이 있는 요소를 수동 검토 항목으로 추가
		document.querySelectorAll('[aria-invalid="true"]').forEach(invalidElement => {
			results.push({
				id: `kact-7.3.1-review-aria-invalid-${results.length}`,
				impact: 'review', // 수동 검토 필요 항목
				tags: ['kwcag', 'kwcag-7.3.1', 'manual-review', 'error-identification-review'],
				description: `[${this.kwcagId} ${this.title}] 검사 대상: aria-invalid="true" 요소. 입력 오류가 발생한 필드입니다.`,
				help: `이 오류 필드에 대해 오류 내용과 정정 방법이 명확하게 제공되는지 수동으로 확인하십시오.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: [this.getSelector(invalidElement)], // getSelector 함수는 공통 유틸리티로 분리될 예정
					html: invalidElement.outerHTML.substring(0, Math.min(invalidElement.outerHTML.indexOf('>') + 1, 250)) + (invalidElement.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: '입력 오류 필드에 대한 오류 정보 및 정정 방법 수동 확인 필요',
					any: [], all: [], none: []
				}],
				kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
			});
		});

		// 예시: 모든 폼 요소를 수동 검토 항목으로 추가 (전반적인 오류 정정 메커니즘 확인)
		document.querySelectorAll('form').forEach(form => {
			results.push({
				id: `kact-7.3.1-review-form-${results.length}`,
				impact: 'review', // 수동 검토 필요 항목
				tags: ['kwcag', 'kwcag-7.3.1', 'manual-review', 'error-handling-review'],
				description: `[${this.kwcagId} ${this.title}] 검사 대상: <form> 요소. 양식 제출 시 오류 정정 메커니즘을 수동으로 확인해야 합니다.`,
				help: `이 양식 제출 시 입력 오류가 발생했을 때, 사용자에게 오류가 명확히 안내되고 오류를 쉽게 정정할 수 있는 방법이 제공되는지 확인하십시오. 중요한 데이터의 경우 제출 전 검토/수정 기능도 확인하십시오.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: [this.getSelector(form)], // getSelector 함수는 공통 유틸리티로 분리될 예정
					html: form.outerHTML.substring(0, Math.min(form.outerHTML.indexOf('>') + 1, 250)) + (form.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: '양식 오류 정정 메커니즘 수동 확인 필요',
					any: [], all: [], none: []
				}],
				kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
			});
		});


		return results;
	},

	// getSelector 함수는 공통 유틸리티로 분리하여 사용해야 합니다.
	// 여기서는 임시로 복사하여 사용합니다.
	getSelector: (element) => {
		if (element.id) {
			const escapedId = element.id.replace(/(:|\.|\[|\]|,|=|@)/g, '\\$1');
			try {
				if (document.querySelectorAll(`#${escapedId}`).length === 1) {
					return `#${escapedId}`;
				}
			} catch (e) { /* ignore */ }
		}

		let path = '';
		let currentElement = element;
		while (currentElement && currentElement.nodeType === Node.ELEMENT_NODE) {
			let selector = currentElement.nodeName.toLowerCase();
			if (currentElement.id) {
				const escapedId = currentElement.id.replace(/(:|\.|\[|\]|,|=|@)/g, '\\$1');
				selector += `#${escapedId}`;
				path = selector + (path ? ' > ' + path : '');
				try {
					if (document.querySelectorAll(path).length === 1) return path;
				} catch (e) { /* ignore */ }

			} else {
				let sibling = currentElement;
				let nth = 1;
				while (sibling = sibling.previousElementSibling) {
					if (sibling.nodeName.toLowerCase() === selector.split(':')[0]) nth++;
				}
				if (currentElement.parentNode && Array.from(currentElement.parentNode.children).filter(el => el.nodeName.toLowerCase() === selector.split(':')[0]).length > 1) {
					selector += `:nth-of-type(${nth})`;
				}
			}
			path = selector + (path ? ' > ' + path : '');
			currentElement = currentElement.parentNode;
			if (currentElement === document.body || currentElement === document.documentElement) break;
		}
		return path ? (document.body.contains(element) ? (path.startsWith('body > ') ? path : 'body > ' + path) : path) : element.tagName.toLowerCase();
	}
};
