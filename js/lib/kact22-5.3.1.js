/**
 * KWCAG 5.3.1: 표의 구성
 * 표는 이해하기 쉽게 구성해야 한다.
 */
export default {
	id: 'kact-rule-5.3.1',
	kwcagId: '5.3.1',
	title: '표의 구성',
	description: '표가 이해하기 쉽게 구성되었는지 검토합니다. (KWCAG 5.3.1)',
	tags: ['kwcag', 'kwcag-5.3.1', 'wcag131', 'wcag411'], // WCAG 1.3.1, 4.1.1 매핑

	/**
	 * KWCAG 5.3.1 준수 여부를 검사합니다.
	 * @param {Document} document 검사할 HTML 문서 객체
	 * @param {Object} options 추가 옵션 (필요시 사용)
	 * @returns {Array<Object>} 검사 결과 목록.
	 */
	check(document, options = {}) {
		const results = [];

		// TODO: 5.3.1 자동 검사 로직 구현
		// - <table> 요소 탐색
		// - <caption>, <thead>, <tbody>, <tfoot>, <th>, <td> 요소 구조 확인
		// - scope, headers 속성 사용 확인
		// - 레이아웃 테이블 사용 여부 판단 (어려울 수 있음)
		// - 수동 검토가 필요한 항목 식별

		// 예시: 모든 <table> 요소를 수동 검토 항목으로 추가
		document.querySelectorAll('table').forEach(table => {
			results.push({
				id: `kact-5.3.1-review-table-${results.length}`,
				impact: 'review', // 수동 검토 필요 항목
				tags: ['kwcag', 'kwcag-5.3.1', 'manual-review', 'table-structure-review'],
				description: `[${this.kwcagId} ${this.title}] 검사 대상: <table> 요소. 표의 구성 적절성을 수동으로 확인해야 합니다.`,
				help: `이 표가 데이터 표로 사용되었는지, 레이아웃 목적인지 확인하고, 데이터 표인 경우 캡션, 헤더, 셀 관계 등이 올바르게 마크업되었는지 확인하십시오.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: [this.getSelector(table)], // getSelector 함수는 공통 유틸리티로 분리될 예정
					html: table.outerHTML.substring(0, Math.min(table.outerHTML.indexOf('>') + 1, 250)) + (table.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: '표 구성 적절성 수동 확인 필요',
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
