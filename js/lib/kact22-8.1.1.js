/**
 * KWCAG 8.1.1: 마크업 오류 방지
 * 마크업 언어의 요소는 열고 닫음, 중첩 관계 및 속성 선언에 오류가 없어야 한다.
 */
export default {
	id: 'kact-rule-8.1.1',
	kwcagId: '8.1.1',
	title: '마크업 오류 방지',
	description: '마크업 언어의 문법 준수 여부를 검토합니다. (KWCAG 8.1.1)',
	tags: ['kwcag', 'kwcag-8.1.1', 'wcag411'], // WCAG 4.1.1 매핑

	/**
	 * KWCAG 8.1.1 준수 여부를 검사합니다.
	 * @param {Document} document 검사할 HTML 문서 객체
	 * @param {Object} options 추가 옵션 (필요시 사용)
	 * @returns {Array<Object>} 검사 결과 목록.
	 */
	check(document, options = {}) {
		const results = [];

		// TODO: 8.1.1 자동 검사 로직 구현
		// - 중복 ID 탐지
		// - ARIA 속성의 유효성 검사 (일부 자동화 가능)
		// - HTML 문법 오류 탐지 (매우 어려움, 외부 라이브러리 또는 서비스 필요)
		// - 수동 검토가 필요한 항목 식별 (대부분의 문법 오류)

		// 1. 중복 ID 탐지
		const elementsWithId = document.querySelectorAll('[id]');
		const idMap = new Map();
		elementsWithId.forEach(element => {
			const id = element.id;
			if (idMap.has(id)) {
				idMap.get(id).push(element);
			} else {
				idMap.set(id, [element]);
			}
		});

		idMap.forEach((elements, id) => {
			if (elements.length > 1) {
				elements.forEach(element => {
					results.push({
						id: `kact-8.1.1-violation-duplicate-id-${id}-${results.length}`,
						impact: 'critical', // 명확한 위반
						tags: ['kwcag', 'kwcag-8.1.1', 'violation', 'duplicate-id'],
						description: `[${this.kwcagId} ${this.title}] 검사 대상: <${element.tagName.toLowerCase()}> 요소. 중복된 ID 속성("${id}")이 사용되었습니다.`,
						help: `페이지 내 모든 ID 속성 값은 고유해야 합니다. 중복된 ID("${id}")를 수정하십시오.`,
						helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
						nodes: [{
							target: [this.getSelector(element)], // getSelector 함수는 공통 유틸리티로 분리될 예정
							html: element.outerHTML.substring(0, Math.min(element.outerHTML.indexOf('>') + 1, 250)) + (element.outerHTML.length > 250 ? '...>' : ''),
							failureSummary: `중복 ID: "${id}"`,
							any: [], all: [], none: []
						}],
						kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
					});
				});
			}
		});

		// TODO: ARIA 속성의 유효성 검사 로직 추가 (role, state, property 등)
		// TODO: HTML 문법 오류 (열고 닫음, 중첩 관계 등) 탐지 로직 추가 (매우 어려움)
		// 예시: 모든 요소를 수동 검토 항목으로 추가 (전반적인 마크업 오류 확인)
		document.querySelectorAll('*').forEach(element => {
			results.push({
				id: `kact-8.1.1-review-markup-${results.length}`,
				impact: 'review', // 수동 검토 필요 항목
				tags: ['kwcag', 'kwcag-8.1.1', 'manual-review', 'markup-validation-review'],
				description: `[${this.kwcagId} ${this.title}] 검사 대상: <${element.tagName.toLowerCase()}> 요소. 전반적인 마크업 오류 여부를 수동으로 확인해야 합니다.`,
				help: `이 요소와 주변 마크업에 열고 닫음, 중첩 관계, 속성 선언 등 문법 오류가 없는지 W3C 유효성 검사 도구 등을 사용하여 확인하십시오.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: [this.getSelector(element)], // getSelector 함수는 공통 유틸리티로 분리될 예정
					html: element.outerHTML.substring(0, Math.min(element.outerHTML.indexOf('>') + 1, 250)) + (element.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: '전반적인 마크업 오류 수동 확인 필요',
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
