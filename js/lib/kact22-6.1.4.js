/**
 * KWCAG 6.1.4: 문자 단축키
 * 문자 단축키는 오동작으로 인한 오류를 방지하여야 한다.
 */
export default {
	id: 'kact-rule-6.1.4',
	kwcagId: '6.1.4',
	title: '문자 단축키',
	description: '단일 문자 단축키 사용 시 오동작 방지 메커니즘 제공 여부를 검토합니다. (KWCAG 6.1.4)',
	tags: ['kwcag', 'kwcag-6.1.4', 'wcag214'], // WCAG 2.1.4 매핑

	/**
	 * KWCAG 6.1.4 준수 여부를 검사합니다.
	 * @param {Document} document 검사할 HTML 문서 객체
	 * @param {Object} options 추가 옵션 (필요시 사용)
	 * @returns {Array<Object>} 검사 결과 목록.
	 */
	check(document, options = {}) {
		const results = [];

		// TODO: 6.1.4 자동 검사 로직 구현
		// - accesskey 속성 사용 요소 탐색
		// - 단일 문자 단축키 사용 여부 탐지 (JavaScript 이벤트 리스너 분석 필요, 매우 어려움)
		// - 오동작 방지 메커니즘 (끄기, 재매핑, 초점 제한) 제공 여부 탐지 (매우 어려움)
		// - 수동 검토가 필요한 항목 식별 (대부분의 경우)

		// 예시: accesskey 속성이 있는 요소를 수동 검토 항목으로 추가 (단축키 오동작 방지 수동 확인 필요)
		document.querySelectorAll('[accesskey]').forEach(elementWithAccesskey => {
			const accesskey = elementWithAccesskey.getAttribute('accesskey');
			results.push({
				id: `kact-6.1.4-review-accesskey-${results.length}`,
				impact: 'review', // 수동 검토 필요 항목
				tags: ['kwcag', 'kwcag-6.1.4', 'manual-review', 'accesskey-review'],
				description: `[${this.kwcagId} ${this.title}] 검사 대상: accesskey="${accesskey}" 요소. 문자 단축키 사용 시 오동작 방지 메커니즘 제공 여부를 수동으로 확인해야 합니다.`,
				help: `이 요소에 할당된 단축키(${accesskey})가 단일 문자인 경우, 사용자가 단축키를 끄거나, 보조 키와 함께 사용하도록 재매핑하거나, 특정 컴포넌트에 초점이 있을 때만 활성화되도록 제한하는 메커니즘이 제공되는지 확인하십시오.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: [this.getSelector(elementWithAccesskey)], // getSelector 함수는 공통 유틸리티로 분리될 예정
					html: elementWithAccesskey.outerHTML.substring(0, Math.min(elementWithAccesskey.outerHTML.indexOf('>') + 1, 250)) + (elementWithAccesskey.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: '문자 단축키 오동작 방지 메커니즘 수동 확인 필요',
					any: [], all: [], none: []
				}],
				kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
			});
		});

		// TODO: JavaScript 이벤트 리스너를 통해 단일 문자 단축키를 사용하는 경우 탐지 로직 추가 (매우 어려움)


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
