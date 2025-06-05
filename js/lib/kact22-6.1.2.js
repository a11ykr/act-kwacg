/**
 * KWCAG 6.1.2: 초점 이동과 표시
 * 키보드에 의한 초점은 논리적으로 이동해야 하며, 시각적으로 구별할 수 있어야 한다.
 */
export default {
	id: 'kact-rule-6.1.2',
	kwcagId: '6.1.2',
	title: '초점 이동과 표시',
	description: '키보드 초점 이동 순서의 논리성 및 초점 표시의 명확성을 검토합니다. (KWCAG 6.1.2)',
	tags: ['kwcag', 'kwcag-6.1.2', 'wcag247'], // WCAG 2.4.7 매핑

	/**
	 * KWCAG 6.1.2 준수 여부를 검사합니다.
	 * @param {Document} document 검사할 HTML 문서 객체
	 * @param {Object} options 추가 옵션 (필요시 사용)
	 * @returns {Array<Object>} 검사 결과 목록.
	 */
	check(document, options = {}) {
		const results = [];

		// TODO: 6.1.2 자동 검사 로직 구현
		// - 키보드 초점 가능한 요소 탐색 (링크, 버튼, 폼 필드, tabindex > -1 요소 등)
		// - DOM 순서와 초점 이동 순서 비교 (tabindex 사용 시 복잡해짐)
		// - 초점 표시 CSS 스타일 확인 (outline, border 등)
		// - aria-hidden="true" 요소가 초점을 받는지 확인
		// - 수동 검토가 필요한 항목 식별 (논리적 순서, 복잡한 초점 관리 등)

		// 예시: 모든 키보드 초점 가능한 요소를 수동 검토 항목으로 추가 (초점 이동 순서 및 표시 수동 확인 필요)
		document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"], [role="link"], [role="checkbox"], [role="radio"], [role="textbox"]').forEach(focusableElement => {
			// aria-hidden="true"가 아닌 요소만 대상으로
			if (focusableElement.getAttribute('aria-hidden') !== 'true') {
				results.push({
					id: `kact-6.1.2-review-focusable-${results.length}`,
					impact: 'review', // 수동 검토 필요 항목
					tags: ['kwcag', 'kwcag-6.1.2', 'manual-review', 'focus-order-review', 'focus-visible-review'],
					description: `[${this.kwcagId} ${this.title}] 검사 대상: ${focusableElement.tagName} 또는 role="${focusableElement.getAttribute('role')}" 요소. 키보드 초점 이동 순서와 시각적 표시를 수동으로 확인해야 합니다.`,
					help: `이 요소에 키보드로 초점을 이동했을 때 시각적으로 명확하게 표시되는지, 그리고 초점 이동 순서가 논리적인지 확인하십시오.`,
					helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
					nodes: [{
						target: [this.getSelector(focusableElement)], // getSelector 함수는 공통 유틸리티로 분리될 예정
						html: focusableElement.outerHTML.substring(0, Math.min(focusableElement.outerHTML.indexOf('>') + 1, 250)) + (focusableElement.outerHTML.length > 250 ? '...>' : ''),
						failureSummary: '키보드 초점 이동 순서 및 표시 수동 확인 필요',
						any: [], all: [], none: []
					}],
					kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
				});
			}
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
