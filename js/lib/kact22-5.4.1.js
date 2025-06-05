/**
 * KWCAG 5.4.1: 색에 무관한 콘텐츠 인식
 * 콘텐츠는 색에 관계없이 인식될 수 있어야 한다.
 */
export default {
	id: 'kact-rule-5.4.1',
	kwcagId: '5.4.1',
	title: '색에 무관한 콘텐츠 인식',
	description: '콘텐츠가 색상 정보에만 의존하지 않고 인식될 수 있는지 검토합니다. (KWCAG 5.4.1)',
	tags: ['kwcag', 'kwcag-5.4.1', 'wcag141'], // WCAG 1.4.1 매핑

	/**
	 * KWCAG 5.4.1 준수 여부를 검사합니다.
	 * @param {Document} document 검사할 HTML 문서 객체
	 * @param {Object} options 추가 옵션 (필요시 사용)
	 * @returns {Array<Object>} 검사 결과 목록.
	 */
	check(document, options = {}) {
		const results = [];

		// TODO: 5.4.1 자동 검사 로직 구현
		// - 색상만으로 정보를 전달하는 요소 탐지 (어려울 수 있음, 수동 검토 비중 높음)
		// - 텍스트 블록 내 링크에 밑줄 등 다른 시각적 단서가 있는지 확인
		// - 오류/상태 메시지가 색상 외 다른 방식으로도 전달되는지 확인
		// - 차트/그래프에서 색상 외 패턴/모양 사용 확인
		// - 수동 검토가 필요한 항목 식별

		// 예시: 모든 링크 요소를 수동 검토 항목으로 추가 (텍스트 블록 내 링크 검토 필요)
		document.querySelectorAll('a[href]').forEach(link => {
			// 텍스트 블록 내 링크인지 판단하는 로직 필요
			// 현재는 모든 링크를 대상으로 임시 추가
			results.push({
				id: `kact-5.4.1-review-link-${results.length}`,
				impact: 'review', // 수동 검토 필요 항목
				tags: ['kwcag', 'kwcag-5.4.1', 'manual-review', 'link-color-review'],
				description: `[${this.kwcagId} ${this.title}] 검사 대상: <a> 요소. 텍스트 블록 내 링크가 색상 외 다른 방식으로 구분되는지 수동으로 확인해야 합니다.`,
				help: `이 링크가 주변 텍스트와 색상만으로 구분되는지, 아니면 밑줄과 같은 다른 시각적 단서가 함께 제공되는지 확인하십시오.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: [this.getSelector(link)], // getSelector 함수는 공통 유틸리티로 분리될 예정
					html: link.outerHTML.substring(0, Math.min(link.outerHTML.indexOf('>') + 1, 250)) + (link.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: '텍스트 블록 내 링크 구분 수동 확인 필요',
					any: [], all: [], none: []
				}],
				kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
			});
		});

		// 예시: 모든 요소에 대해 수동 검토 항목으로 추가 (색상만으로 정보 전달 여부 확인)
		document.querySelectorAll('*').forEach(element => {
			// 모든 요소를 대상으로 하는 것은 비효율적일 수 있으나, 임시로 추가
			// 실제 구현 시에는 정보 전달 역할을 하는 특정 요소(아이콘, 상태 메시지 영역 등)를 대상으로 해야 함
			results.push({
				id: `kact-5.4.1-review-element-${results.length}`,
				impact: 'review', // 수동 검토 필요 항목
				tags: ['kwcag', 'kwcag-5.4.1', 'manual-review', 'color-only-info-review'],
				description: `[${this.kwcagId} ${this.title}] 검사 대상: ${element.tagName} 요소. 색상만으로 중요한 정보가 전달되는지 수동으로 확인해야 합니다.`,
				help: `이 요소나 주변 콘텐츠에서 색상만이 유일한 시각적 수단으로 중요한 정보를 전달하는지 확인하십시오.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: [this.getSelector(element)], // getSelector 함수는 공통 유틸리티로 분리될 예정
					html: element.outerHTML.substring(0, Math.min(element.outerHTML.indexOf('>') + 1, 250)) + (element.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: '색상만으로 정보 전달 여부 수동 확인 필요',
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
