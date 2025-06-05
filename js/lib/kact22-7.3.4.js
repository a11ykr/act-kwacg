/**
 * KWCAG 7.3.4: 반복 입력 정보
 * 반복되는 입력 정보는 자동 입력 또는 선택 입력할 수 있어야 한다.
 */
export default {
	id: 'kact-rule-7.3.4',
	kwcagId: '7.3.4',
	title: '반복 입력 정보',
	description: '반복되는 입력 정보에 대한 자동 입력 또는 선택 입력 기능 제공 여부를 검토합니다. (KWCAG 7.3.4)',
	tags: ['kwcag', 'kwcag-7.3.4', 'wcag337'], // WCAG 3.3.7 매핑

	/**
	 * KWCAG 7.3.4 준수 여부를 검사합니다.
	 * @param {Document} document 검사할 HTML 문서 객체
	 * @param {Object} options 추가 옵션 (필요시 사용)
	 * @returns {Array<Object>} 검사 결과 목록.
	 */
	check(document, options = {}) {
		const results = [];

		// TODO: 7.3.4 자동 검사 로직 구현
		// - 양식 필드 탐색
		// - autocomplete 속성 사용 여부 및 값의 적절성 확인
		// - 반복 입력 정보 자동 채우기/선택 기능 제공 여부 탐지 (매우 어려움, 수동 검토 비중 높음)
		// - 수동 검토가 필요한 항목 식별 (대부분의 경우)

		// 예시: 모든 양식 필드를 수동 검토 항목으로 추가 (반복 입력 기능 수동 확인 필요)
		document.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(formField => {
			const autocomplete = formField.getAttribute('autocomplete');
			results.push({
				id: `kact-7.3.4-review-form-field-${results.length}`,
				impact: 'review', // 수동 검토 필요 항목
				tags: ['kwcag', 'kwcag-7.3.4', 'manual-review', 'redundant-entry-review'],
				description: `[${this.kwcagId} ${this.title}] 검사 대상: <${formField.tagName.toLowerCase()}> 요소. 반복 입력 정보에 대한 자동 입력/선택 기능 제공 여부를 수동으로 확인해야 합니다.`,
				help: `이 양식 필드에 입력하는 정보가 다른 곳에서 반복되는 경우, 자동 입력(autocomplete)이나 선택 입력 기능이 제공되는지 확인하십시오. autocomplete 속성: "${autocomplete || '없음'}"`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: [this.getSelector(formField)], // getSelector 함수는 공통 유틸리티로 분리될 예정
					html: formField.outerHTML.substring(0, Math.min(formField.outerHTML.indexOf('>') + 1, 250)) + (formField.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: '반복 입력 정보 자동 입력/선택 기능 수동 확인 필요',
					any: [], all: [], none: []
				}],
				kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
			});
		});

		// TODO: autocomplete 속성 값의 유효성 검사 로직 추가


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
