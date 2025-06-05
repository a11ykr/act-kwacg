/**
 * KWCAG 6.4.1: 반복 영역 건너뛰기
 * 페이지에서 반복되는 내비게이션 등의 영역을 건너뛸 수 있는 수단을 제공해야 합니다.
 */
export default {
	id: 'kact-rule-6.4.1',
	kwcagId: '6.4.1',
	title: '반복 영역 건너뛰기',
	description: '페이지의 반복 영역을 건너뛸 수 있는 수단 제공 여부를 검토합니다. (KWCAG 6.4.1)',
	tags: ['kwcag', 'kwcag-6.4.1', 'wcag241'], // WCAG 2.4.1 매핑

	/**
	 * KWCAG 6.4.1 준수 여부를 검사합니다.
	 * @param {Document} document 검사할 HTML 문서 객체
	 * @param {Object} options 추가 옵션 (필요시 사용)
	 * @returns {Array<Object>} 검사 결과 목록.
	 */
	check(document, options = {}) {
		const results = [];

		// TODO: 6.4.1 자동 검사 로직 구현
		// - 페이지 상단에서 숨겨진 또는 시각적으로 보이는 건너뛰기 링크 탐색
		// - 링크의 href 속성이 유효한 페이지 내 ID를 가리키는지 확인
		// - 링크가 실제로 초점을 받고 활성화될 때 대상 영역으로 이동하는지 확인 (어려울 수 있음)
		// - 수동 검토가 필요한 항목 식별 (링크의 시각적 표시, 동작 확인 등)

		// 예시: 페이지 상단에서 '본문 바로가기'와 유사한 텍스트를 가진 링크를 탐색하여 수동 검토 항목으로 추가
		const skipLinkRegex = /(본문 바로가기|메뉴 건너뛰기|Skip to main content)/i;
		document.querySelectorAll('a[href]').forEach(link => {
			const linkText = link.textContent.trim();
			const href = link.getAttribute('href');

			if (skipLinkRegex.test(linkText) || (href && href.startsWith('#') && linkText.length > 0)) {
				results.push({
					id: `kact-6.4.1-review-skip-link-${results.length}`,
					impact: 'review', // 수동 검토 필요 항목
					tags: ['kwcag', 'kwcag-6.4.1', 'manual-review', 'skip-link-review'],
					description: `[${this.kwcagId} ${this.title}] 검사 대상: <a href="${href}">${linkText.substring(0, 50)}${linkText.length > 50 ? '...' : ''}</a> 요소. 건너뛰기 링크일 가능성이 있습니다.`,
					help: `이 링크가 페이지의 반복되는 영역(예: 주 메뉴)을 건너뛰고 주요 콘텐츠 영역으로 이동하는 기능을 제공하는지, 키보드로 접근 가능하며 초점을 받았을 때 시각적으로 표시되는지 수동으로 확인하십시오.`,
					helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
					nodes: [{
						target: [this.getSelector(link)], // getSelector 함수는 공통 유틸리티로 분리될 예정
						html: link.outerHTML.substring(0, Math.min(link.outerHTML.indexOf('>') + 1, 250)) + (link.outerHTML.length > 250 ? '...>' : ''),
						failureSummary: '건너뛰기 링크 기능 및 표시 수동 확인 필요',
						any: [], all: [], none: []
					}],
					kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
				});
			}
		});

		// TODO: 페이지 상단에 건너뛰기 링크가 없는 경우 위반 항목으로 추가하는 로직 (모든 페이지에 적용되는지 판단 어려움)


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
