/**
 * KWCAG 6.1.3: 조작 가능
 * 사용자 입력 및 콘트롤은 조작 가능하도록 제공되어야 한다.
 */
export default {
	id: 'kact-rule-6.1.3',
	kwcagId: '6.1.3',
	title: '조작 가능',
	description: '사용자 입력 및 컨트롤의 조작 가능성을 검토합니다. (KWCAG 6.1.3)',
	tags: ['kwcag', 'kwcag-6.1.3', 'wcag258'], // WCAG 2.5.8 매핑

	/**
	 * KWCAG 6.1.3 준수 여부를 검사합니다.
	 * @param {Document} document 검사할 HTML 문서 객체
	 * @param {Object} options 추가 옵션 (필요시 사용)
	 * @returns {Array<Object>} 검사 결과 목록.
	 */
	check(document, options = {}) {
		const results = [];

		// TODO: 6.1.3 자동 검사 로직 구현
		// - 대화형 요소(링크, 버튼, 폼 필드 등) 탐색
		// - 각 요소의 크기 계산 (getBoundingClientRect 사용)
		// - 최소 크기 기준 (예: 24x24 CSS 픽셀)과 비교하여 위반 여부 판단
		// - 인접한 타겟 간의 간격 확인 (어려울 수 있음, 수동 검토 필요)
		// - 수동 검토가 필요한 항목 식별

		const MIN_SIZE = 24; // 최소 크기 기준 (CSS 픽셀)

		document.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"], [role="link"], [role="checkbox"], [role="radio"], [role="textbox"], [role="combobox"], [role="slider"]').forEach(interactiveElement => {
			const rect = interactiveElement.getBoundingClientRect();
			const width = rect.width;
			const height = rect.height;

			// 요소가 화면에 표시되고 크기를 가질 때만 검사
			if (width > 0 && height > 0) {
				if (width < MIN_SIZE || height < MIN_SIZE) {
					results.push({
						id: `kact-6.1.3-violation-target-size-${results.length}`,
						impact: 'critical', // 명확한 위반
						tags: ['kwcag', 'kwcag-6.1.3', 'violation', 'target-size'],
						description: `[${this.kwcagId} ${this.title}] 검사 대상: ${interactiveElement.tagName} 또는 role="${interactiveElement.getAttribute('role')}" 요소. 조작 가능한 영역의 크기가 작습니다.`,
						help: `이 요소의 조작 가능한 영역(클릭/터치 가능한 영역)의 크기가 최소 ${MIN_SIZE}x${MIN_SIZE} CSS 픽셀 이상인지 확인하십시오. 현재 크기: ${width.toFixed(1)}x${height.toFixed(1)}`,
						helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
						nodes: [{
							target: [this.getSelector(interactiveElement)], // getSelector 함수는 공통 유틸리티로 분리될 예정
							html: interactiveElement.outerHTML.substring(0, Math.min(interactiveElement.outerHTML.indexOf('>') + 1, 250)) + (interactiveElement.outerHTML.length > 250 ? '...>' : ''),
							failureSummary: `조작 가능한 영역 크기 부족: ${width.toFixed(1)}x${height.toFixed(1)}`,
							any: [], all: [], none: []
						}],
						kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
					});
				}
			}
		});

		// 예시: 모든 대화형 요소를 수동 검토 항목으로 추가 (인접 요소 간 간격 수동 확인 필요)
		document.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"], [role="link"], [role="checkbox"], [role="radio"], [role="textbox"], [role="combobox"], [role="slider"]').forEach(interactiveElement => {
			results.push({
				id: `kact-6.1.3-review-spacing-${results.length}`,
				impact: 'review', // 수동 검토 필요 항목
				tags: ['kwcag', 'kwcag-6.1.3', 'manual-review', 'target-spacing-review'],
				description: `[${this.kwcagId} ${this.title}] 검사 대상: ${interactiveElement.tagName} 또는 role="${interactiveElement.getAttribute('role')}" 요소. 인접한 조작 가능한 요소 간의 간격을 수동으로 확인해야 합니다.`,
				help: `이 요소와 인접한 다른 조작 가능한 요소 사이에 충분한 간격이 있어 실수로 잘못된 요소를 클릭/터치할 가능성이 낮은지 확인하십시오.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: [this.getSelector(interactiveElement)], // getSelector 함수는 공통 유틸리티로 분리될 예정
					html: interactiveElement.outerHTML.substring(0, Math.min(interactiveElement.outerHTML.indexOf('>') + 1, 250)) + (interactiveElement.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: '인접 요소 간 간격 수동 확인 필요',
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
