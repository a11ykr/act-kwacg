/**
 * KWCAG 5.3.2: 콘텐츠의 논리적 순서
 * 콘텐츠는 논리적인 순서로 제공되어야 하며, 화면낭독기 등 보조기술로도 그 순서가 유지되어야 합니다.
 */
export default {
	id: 'kact-rule-5.3.2',
	kwcagId: '5.3.2',
	title: '콘텐츠의 논리적 순서',
	description: '콘텐츠가 논리적인 순서로 제공되는지 검토합니다. (KWCAG 5.3.2)',
	tags: ['kwcag', 'kwcag-5.3.2', 'wcag132'], // WCAG 1.3.2 매핑

	/**
	 * KWCAG 5.3.2 준수 여부를 검사합니다.
	 * @param {Document} document 검사할 HTML 문서 객체
	 * @param {Object} options 추가 옵션 (필요시 사용)
	 * @returns {Array<Object>} 검사 결과 목록.
	 */
	check(document, options = {}) {
		const results = [];

		// TODO: 5.3.2 자동 검사 로직 구현
		// - DOM 순서와 시각적 순서 비교 (어려울 수 있음)
		// - CSS display, float, position 등으로 인한 순서 변경 가능성 탐지
		// - tabindex 속성 사용 검토
		// - 제목 요소(h1-h6)의 순서 검토
		// - 수동 검토가 필요한 항목 식별

		// 예시: 모든 heading 요소를 수동 검토 항목으로 추가 (제목 순서 검토 필요)
		document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
			results.push({
				id: `kact-5.3.2-review-heading-${results.length}`,
				impact: 'review', // 수동 검토 필요 항목
				tags: ['kwcag', 'kwcag-5.3.2', 'manual-review', 'heading-order-review'],
				description: `[${this.kwcagId} ${this.title}] 검사 대상: ${heading.tagName} 요소. 제목의 논리적 순서를 수동으로 확인해야 합니다.`,
				help: `페이지 내 제목(h1-h6)이 논리적인 계층 구조와 순서를 따르는지 확인하십시오.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: [this.getSelector(heading)], // getSelector 함수는 공통 유틸리티로 분리될 예정
					html: heading.outerHTML.substring(0, Math.min(heading.outerHTML.indexOf('>') + 1, 250)) + (heading.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: '제목의 논리적 순서 수동 확인 필요',
					any: [], all: [], none: []
				}],
				kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
			});
		});

		// 예시: tabindex 속성이 0보다 큰 요소를 수동 검토 항목으로 추가 (tabindex 순서 검토 필요)
		document.querySelectorAll('[tabindex]:not([tabindex="-1"])').forEach(element => {
			const tabindex = parseInt(element.getAttribute('tabindex'), 10);
			if (tabindex > 0) {
				results.push({
					id: `kact-5.3.2-review-tabindex-${results.length}`,
					impact: 'review', // 수동 검토 필요 항목
					tags: ['kwcag', 'kwcag-5.3.2', 'manual-review', 'tabindex-order-review'],
					description: `[${this.kwcagId} ${this.title}] 검사 대상: tabindex="${tabindex}" 요소. 키보드 초점 이동 순서를 수동으로 확인해야 합니다.`,
					help: `tabindex 속성이 0보다 큰 요소는 키보드 초점 이동 순서를 변경할 수 있습니다. 시각적 순서와 논리적 순서가 일치하는지 확인하십시오.`,
					helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
					nodes: [{
						target: [this.getSelector(element)], // getSelector 함수는 공통 유틸리티로 분리될 예정
						html: element.outerHTML.substring(0, Math.min(element.outerHTML.indexOf('>') + 1, 250)) + (element.outerHTML.length > 250 ? '...>' : ''),
						failureSummary: 'tabindex 속성에 의한 초점 이동 순서 수동 확인 필요',
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
