/**
 * KWCAG 6.4.3: 적절한 링크 텍스트
 * 링크 텍스트는 용도나 목적을 이해할 수 있도록 제공해야 한다.
 */
export default {
	id: 'kact-rule-6.4.3',
	kwcagId: '6.4.3',
	title: '적절한 링크 텍스트',
	description: '링크 텍스트가 용도나 목적을 이해할 수 있도록 제공되는지 검토합니다. (KWCAG 6.4.3)',
	tags: ['kwcag', 'kwcag-6.4.3', 'wcag244'], // WCAG 2.4.4 매핑

	/**
	 * KWCAG 6.4.3 준수 여부를 검사합니다.
	 * @param {Document} document 검사할 HTML 문서 객체
	 * @param {Object} options 추가 옵션 (필요시 사용)
	 * @returns {Array<Object>} 검사 결과 목록.
	 */
	check(document, options = {}) {
		const results = [];

		// TODO: 6.4.3 자동 검사 로직 구현
		// - <a> 요소 탐색
		// - 링크 텍스트, aria-label, aria-labelledby, 이미지 alt 텍스트 등 접근 가능한 이름 확인
		// - '여기를 클릭하세요', '더 보기' 등 모호한 텍스트 사용 탐지
		// - 동일한 텍스트가 다른 목적지로 연결되는 경우 탐지 (어려울 수 있음)
		// - 이미지 링크의 대체 텍스트 적절성 검토 (5.1.1과 연관)
		// - 수동 검토가 필요한 항목 식별 (링크 텍스트의 문맥적 적절성 등)

		// 예시: 모든 링크 요소를 수동 검토 항목으로 추가 (링크 텍스트 적절성 수동 확인 필요)
		document.querySelectorAll('a[href]').forEach(link => {
			const linkText = link.textContent.trim();
			const ariaLabel = link.getAttribute('aria-label');
			const ariaLabelledby = link.getAttribute('aria-labelledby');
			const accessibleName = ariaLabel || (ariaLabelledby ? document.getElementById(ariaLabelledby)?.textContent.trim() : null) || linkText;

			results.push({
				id: `kact-6.4.3-review-link-text-${results.length}`,
				impact: 'review', // 수동 검토 필요 항목
				tags: ['kwcag', 'kwcag-6.4.3', 'manual-review', 'link-text-review'],
				description: `[${this.kwcagId} ${this.title}] 검사 대상: <a href="${link.getAttribute('href')}"> 요소. 링크 텍스트의 적절성을 수동으로 확인해야 합니다.`,
				help: `이 링크의 텍스트("${accessibleName.substring(0, 50)}${accessibleName.length > 50 ? '...' : ''}")만으로 링크의 용도나 목적을 명확히 알 수 있는지 확인하십시오. '여기를 클릭하세요'와 같은 모호한 텍스트 사용을 피하십시오.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: [this.getSelector(link)], // getSelector 함수는 공통 유틸리티로 분리될 예정
					html: link.outerHTML.substring(0, Math.min(link.outerHTML.indexOf('>') + 1, 250)) + (link.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: '링크 텍스트 적절성 수동 확인 필요',
					any: [], all: [], none: []
				}],
				kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
			});
		});

		// TODO: '여기를 클릭하세요', '더 보기' 등 모호한 텍스트를 가진 링크 탐지 및 위반/수동 검토 항목 추가
		// TODO: 동일한 텍스트를 가진 링크가 다른 목적지로 연결되는 경우 탐지 및 위반/수동 검토 항목 추가 (어려움)


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
