/**
 * KWCAG 5.4.2: 자동 재생 금지
 * 자동으로 소리가 재생되지 않아야 한다.
 */
export default {
	id: 'kact-rule-5.4.2',
	kwcagId: '5.4.2',
	title: '자동 재생 금지',
	description: '페이지 로드 시 자동으로 소리가 재생되는지 검토합니다. (KWCAG 5.4.2)',
	tags: ['kwcag', 'kwcag-5.4.2', 'wcag142'], // WCAG 1.4.2 매핑

	/**
	 * KWCAG 5.4.2 준수 여부를 검사합니다.
	 * @param {Document} document 검사할 HTML 문서 객체
	 * @param {Object} options 추가 옵션 (필요시 사용)
	 * @returns {Array<Object>} 검사 결과 목록.
	 */
	check(document, options = {}) {
		const results = [];

		// TODO: 5.4.2 자동 검사 로직 구현
		// - <audio> 및 <video> 요소 중 autoplay 속성이 있는 요소 탐지
		// - JavaScript에 의한 자동 재생 탐지 (어려울 수 있음, 수동 검토 비중 높음)
		// - 3초 초과 자동 재생 여부 판단 (어려울 수 있음)
		// - 사용자 제어 기능 제공 여부 확인
		// - 수동 검토가 필요한 항목 식별

		// 예시: autoplay 속성이 있는 <audio> 또는 <video> 요소를 수동 검토 항목으로 추가
		document.querySelectorAll('audio[autoplay], video[autoplay]').forEach(mediaElement => {
			results.push({
				id: `kact-5.4.2-review-autoplay-${results.length}`,
				impact: 'review', // 수동 검토 필요 항목
				tags: ['kwcag', 'kwcag-5.4.2', 'manual-review', 'autoplay-review'],
				description: `[${this.kwcagId} ${this.title}] 검사 대상: <${mediaElement.tagName.toLowerCase()}> 요소. autoplay 속성이 사용되었습니다.`,
				help: `이 멀티미디어 콘텐츠가 페이지 로드 시 자동으로 소리를 재생하는지, 그리고 사용자가 이를 정지, 일시정지 또는 음소거할 수 있는 컨트롤이 제공되는지 수동으로 확인하십시오.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: [this.getSelector(mediaElement)], // getSelector 함수는 공통 유틸리티로 분리될 예정
					html: mediaElement.outerHTML.substring(0, Math.min(mediaElement.outerHTML.indexOf('>') + 1, 250)) + (mediaElement.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: 'autoplay 속성 사용에 따른 자동 재생 수동 확인 필요',
					any: [], all: [], none: []
				}],
				kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
			});
		});

		// 예시: 모든 요소에 대해 수동 검토 항목으로 추가 (JavaScript 자동 재생 등 확인)
		document.querySelectorAll('*').forEach(element => {
			// 모든 요소를 대상으로 하는 것은 비효율적일 수 있으나, 임시로 추가
			// 실제 구현 시에는 자동 재생 가능성이 있는 특정 요소나 스크립트 패턴을 대상으로 해야 함
			results.push({
				id: `kact-5.4.2-review-element-${results.length}`,
				impact: 'review', // 수동 검토 필요 항목
				tags: ['kwcag', 'kwcag-5.4.2', 'manual-review', 'javascript-autoplay-review'],
				description: `[${this.kwcagId} ${this.title}] 검사 대상: ${element.tagName} 요소. JavaScript 등에 의한 자동 소리 재생 여부를 수동으로 확인해야 합니다.`,
				help: `이 요소나 관련 스크립트에 의해 페이지 로드 시 자동으로 소리가 재생되는지 확인하십시오.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: [this.getSelector(element)], // getSelector 함수는 공통 유틸리티로 분리될 예정
					html: element.outerHTML.substring(0, Math.min(element.outerHTML.indexOf('>') + 1, 250)) + (element.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: 'JavaScript 등에 의한 자동 소리 재생 수동 확인 필요',
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
