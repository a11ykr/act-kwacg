/**
 * KWCAG 5.4.3: 텍스트 콘텐츠의 명도 대비
 * 텍스트 콘텐츠와 배경 간의 명도 대비는 4.5 대 1 이상이어야 한다.
 */
export default {
	id: 'kact-rule-5.4.3',
	kwcagId: '5.4.3',
	title: '텍스트 콘텐츠의 명도 대비',
	description: '텍스트 콘텐츠와 배경 간의 명도 대비가 충분한지 검토합니다. (KWCAG 5.4.3)',
	tags: ['kwcag', 'kwcag-5.4.3', 'wcag143'], // WCAG 1.4.3 매핑

	/**
	 * KWCAG 5.4.3 준수 여부를 검사합니다.
	 * @param {Document} document 검사할 HTML 문서 객체
	 * @param {Object} options 추가 옵션 (필요시 사용)
	 * @returns {Array<Object>} 검사 결과 목록.
	 */
	check(document, options = {}) {
		const results = [];

		// TODO: 5.4.3 자동 검사 로직 구현
		// - 페이지 내 모든 텍스트 노드 또는 텍스트를 포함하는 요소 탐색
		// - 각 텍스트 요소의 색상 및 배경 색상 가져오기 (getComputedStyle 사용)
		// - 색상 값을 RGB로 변환
		// - 명도(Luminance) 계산
		// - 명도 대비(Contrast Ratio) 계산
		// - 일반 텍스트 (4.5:1) 및 큰 텍스트 (3:1) 기준과 비교하여 위반 여부 판단
		// - 이미지 위의 텍스트, 그라데이션 배경 등 자동 판단 어려운 경우 수동 검토 항목으로 추가

		// 예시: 모든 텍스트를 포함하는 요소를 수동 검토 항목으로 추가 (명도 대비 수동 확인 필요)
		// 실제 구현 시에는 텍스트 노드를 직접 검사하거나, 텍스트를 포함하는 특정 요소만 대상으로 해야 함
		document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button, input[type="text"], textarea').forEach(element => {
			if (element.textContent.trim().length > 0) { // 텍스트가 있는 요소만 대상으로
				results.push({
					id: `kact-5.4.3-review-text-${results.length}`,
					impact: 'review', // 수동 검토 필요 항목
					tags: ['kwcag', 'kwcag-5.4.3', 'manual-review', 'color-contrast-review'],
					description: `[${this.kwcagId} ${this.title}] 검사 대상: ${element.tagName} 요소. 텍스트와 배경 간의 명도 대비를 수동으로 확인해야 합니다.`,
					help: `이 텍스트 콘텐츠와 배경 간의 명도 대비가 일반 텍스트는 4.5:1, 큰 텍스트는 3:1 이상인지 색상 피커 도구 등을 사용하여 확인하십시오.`,
					helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
					nodes: [{
						target: [this.getSelector(element)], // getSelector 함수는 공통 유틸리티로 분리될 예정
						html: element.outerHTML.substring(0, Math.min(element.outerHTML.indexOf('>') + 1, 250)) + (element.outerHTML.length > 250 ? '...>' : ''),
						failureSummary: '텍스트 명도 대비 수동 확인 필요',
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
