/**
 * KWCAG 6.2.1: 응답시간 조절
 * 시간제한이 있는 콘텐츠는 응답시간을 조절할 수 있어야 한다.
 */
export default {
	id: 'kact-rule-6.2.1',
	kwcagId: '6.2.1',
	title: '응답시간 조절',
	description: '시간 제한이 있는 콘텐츠에 대한 응답시간 조절 기능 제공 여부를 검토합니다. (KWCAG 6.2.1)',
	tags: ['kwcag', 'kwcag-6.2.1', 'wcag221'], // WCAG 2.2.1 매핑

	/**
	 * KWCAG 6.2.1 준수 여부를 검사합니다.
	 * @param {Document} document 검사할 HTML 문서 객체
	 * @param {Object} options 추가 옵션 (필요시 사용)
	 * @returns {Array<Object>} 검사 결과 목록.
	 */
	check(document, options = {}) {
		const results = [];

		// TODO: 6.2.1 자동 검사 로직 구현
		// - meta refresh 탐지 (일부 자동화 가능)
		// - JavaScript 타이머에 의한 시간 제한 탐지 (매우 어려움)
		// - 시간 제한 연장/끄기 기능 제공 여부 탐지 (매우 어려움)
		// - 수동 검토가 필요한 항목 식별 (대부분의 경우)

		// 예시: meta refresh가 사용된 경우 수동 검토 항목으로 추가
		document.querySelectorAll('meta[http-equiv="refresh"]').forEach(metaRefresh => {
			const content = metaRefresh.getAttribute('content');
			results.push({
				id: `kact-6.2.1-review-meta-refresh-${results.length}`,
				impact: 'review', // 수동 검토 필요 항목
				tags: ['kwcag', 'kwcag-6.2.1', 'manual-review', 'meta-refresh-review'],
				description: `[${this.kwcagId} ${this.title}] 검사 대상: <meta http-equiv="refresh"> 요소. 페이지 자동 새로고침/리다이렉트가 사용되었습니다.`,
				help: `meta refresh를 사용하여 페이지를 자동으로 새로고침하거나 다른 페이지로 이동시키는 경우, 사용자에게 이를 알리고 제어할 수 있는 수단(예: 새로고침/이동 취소 버튼)을 제공하는지 확인하십시오.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: [this.getSelector(metaRefresh)], // getSelector 함수는 공통 유틸리티로 분리될 예정
					html: metaRefresh.outerHTML.substring(0, Math.min(metaRefresh.outerHTML.indexOf('>') + 1, 250)) + (metaRefresh.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: 'meta refresh 사용에 따른 시간 제한 수동 확인 필요',
					any: [], all: [], none: []
				}],
				kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
			});
		});

		// 예시: 모든 요소에 대해 수동 검토 항목으로 추가 (JavaScript 시간 제한 등 확인)
		document.querySelectorAll('*').forEach(element => {
			// 모든 요소를 대상으로 하는 것은 비효율적일 수 있으나, 임시로 추가
			// 실제 구현 시에는 시간 제한 기능과 관련된 특정 요소나 스크립트 패턴을 대상으로 해야 함
			results.push({
				id: `kact-6.2.1-review-element-${results.length}`,
				impact: 'review', // 수동 검토 필요 항목
				tags: ['kwcag', 'kwcag-6.2.1', 'manual-review', 'javascript-timing-review'],
				description: `[${this.kwcagId} ${this.title}] 검사 대상: ${element.tagName} 요소. JavaScript 등에 의한 시간 제한 콘텐츠 제공 여부를 수동으로 확인해야 합니다.`,
				help: `이 요소나 관련 스크립트에 의해 시간 제한이 있는 콘텐츠(예: 세션 타임아웃, 자동 업데이트)가 제공되는지, 그리고 사용자가 시간을 조절할 수 있는지 확인하십시오.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: [this.getSelector(element)], // getSelector 함수는 공통 유틸리티로 분리될 예정
					html: element.outerHTML.substring(0, Math.min(element.outerHTML.indexOf('>') + 1, 250)) + (element.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: 'JavaScript 등에 의한 시간 제한 콘텐츠 수동 확인 필요',
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
