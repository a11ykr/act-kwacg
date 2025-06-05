/**
 * KWCAG 6.1.1: 키보드 사용 보장
 * 모든 기능은 키보드만으로도 사용할 수 있어야 한다.
 */
export default {
	id: 'kact-rule-6.1.1',
	kwcagId: '6.1.1',
	title: '키보드 사용 보장',
	description: '모든 기능이 키보드만으로 조작 가능한지 검토합니다. (KWCAG 6.1.1)',
	tags: ['kwcag', 'kwcag-6.1.1', 'wcag211'], // WCAG 2.1.1 매핑

	/**
	 * KWCAG 6.1.1 준수 여부를 검사합니다.
	 * @param {Document} document 검사할 HTML 문서 객체
	 * @param {Object} options 추가 옵션 (필요시 사용)
	 * @returns {Array<Object>} 검사 결과 목록.
	 */
	check(document, options = {}) {
		const results = [];

		// TODO: 6.1.1 자동 검사 로직 구현
		// - 대화형 요소(링크, 버튼, 폼 필드 등) 탐색
		// - 키보드 접근성 및 조작 가능성 자동 판단 (매우 어려움, 대부분 수동 검토 필요)
		// - tabindex="-1"이 잘못 사용된 경우 탐지
		// - 키보드 함정 가능성 탐지 (매우 어려움)
		// - 마우스 오버/클릭으로만 나타나는 콘텐츠에 대한 키보드 접근성 탐지 (어려움)
		// - 사용자 정의 위젯의 키보드 지원 여부 탐지 (매우 어려움)
		// - 수동 검토가 필요한 항목 식별 (대부분의 경우)

		// 예시: 모든 대화형 요소를 수동 검토 항목으로 추가 (키보드 접근성 및 조작 가능성 수동 확인 필요)
		document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"], [role="link"], [role="checkbox"], [role="radio"], [role="textbox"]').forEach(interactiveElement => {
			results.push({
				id: `kact-6.1.1-review-interactive-${results.length}`,
				impact: 'review', // 수동 검토 필요 항목
				tags: ['kwcag', 'kwcag-6.1.1', 'manual-review', 'keyboard-access-review'],
				description: `[${this.kwcagId} ${this.title}] 검사 대상: ${interactiveElement.tagName} 또는 role="${interactiveElement.getAttribute('role')}" 요소. 키보드 접근성 및 조작 가능성을 수동으로 확인해야 합니다.`,
				help: `이 요소에 키보드(Tab, Enter, Space 등)로 접근하고 조작할 수 있는지 확인하십시오. 키보드 함정이 없는지, 마우스 없이도 모든 기능 사용이 가능한지 점검하십시오.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: [this.getSelector(interactiveElement)], // getSelector 함수는 공통 유틸리티로 분리될 예정
					html: interactiveElement.outerHTML.substring(0, Math.min(interactiveElement.outerHTML.indexOf('>') + 1, 250)) + (interactiveElement.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: '키보드 접근성 및 조작 가능성 수동 확인 필요',
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
