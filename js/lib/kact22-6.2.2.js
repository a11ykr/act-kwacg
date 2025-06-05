/**
 * KWCAG 6.2.2: 정지 기능 제공
 * 자동으로 변경되는 콘텐츠는 움직임을 제어할 수 있어야 한다.
 */
export default {
	id: 'kact-rule-6.2.2',
	kwcagId: '6.2.2',
	title: '정지 기능 제공',
	description: '자동으로 변경되는 콘텐츠에 대한 정지, 일시정지 또는 숨기기 기능 제공 여부를 검토합니다. (KWCAG 6.2.2)',
	tags: ['kwcag', 'kwcag-6.2.2', 'wcag222'], // WCAG 2.2.2 매핑

	/**
	 * KWCAG 6.2.2 준수 여부를 검사합니다.
	 * @param {Document} document 검사할 HTML 문서 객체
	 * @param {Object} options 추가 옵션 (필요시 사용)
	 * @returns {Array<Object>} 검사 결과 목록.
	 */
	check(document, options = {}) {
		const results = [];

		// TODO: 6.2.2 자동 검사 로직 구현
		// - <marquee>, <blink> 요소 탐지 (레거시 요소)
		// - CSS 애니메이션, transition 사용 요소 탐지
		// - JavaScript에 의한 콘텐츠 자동 변경 탐지 (어려움)
		// - 5초 이상 지속되는지 판단 (어려움)
		// - 정지/일시정지/숨기기 기능 제공 여부 탐지 (어려움)
		// - 수동 검토가 필요한 항목 식별

		// 예시: <marquee> 또는 <blink> 요소가 사용된 경우 위반 항목으로 추가
		document.querySelectorAll('marquee, blink').forEach(element => {
			results.push({
				id: `kact-6.2.2-violation-legacy-${results.length}`,
				impact: 'critical', // 명확한 위반 (레거시 요소 사용)
				tags: ['kwcag', 'kwcag-6.2.2', 'violation', 'legacy-element'],
				description: `[${this.kwcagId} ${this.title}] 검사 대상: <${element.tagName.toLowerCase()}> 요소. 사용 중단된 자동 변경 요소입니다.`,
				help: `<${element.tagName.toLowerCase()}> 요소는 사용 중단되었으며 접근성 문제가 있습니다. CSS 애니메이션 등으로 대체하고 사용자 제어 기능을 제공해야 합니다.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: [this.getSelector(element)], // getSelector 함수는 공통 유틸리티로 분리될 예정
					html: element.outerHTML.substring(0, Math.min(element.outerHTML.indexOf('>') + 1, 250)) + (element.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: `사용 중단된 <${element.tagName.toLowerCase()}> 요소 사용`,
					any: [], all: [], none: []
				}],
				kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
			});
		});

		// 예시: CSS 애니메이션 또는 transition이 사용된 요소를 수동 검토 항목으로 추가
		document.querySelectorAll('*').forEach(element => {
			if (element.nodeType === Node.ELEMENT_NODE) {
				const style = window.getComputedStyle(element);
				const animation = style.getPropertyValue('animation');
				const transition = style.getPropertyValue('transition');

				if ((animation && animation !== 'none') || (transition && transition !== 'none')) {
					results.push({
						id: `kact-6.2.2-review-animation-${results.length}`,
						impact: 'review', // 수동 검토 필요 항목
						tags: ['kwcag', 'kwcag-6.2.2', 'manual-review', 'animation-control-review'],
						description: `[${this.kwcagId} ${this.title}] 검사 대상: ${element.tagName} 요소. CSS 애니메이션 또는 transition이 사용되었습니다.`,
						help: `이 요소에 적용된 애니메이션이나 전환 효과가 5초 이상 지속되고 다른 콘텐츠와 병행하여 표시되는 경우, 사용자가 이를 정지, 일시정지 또는 숨길 수 있는 컨트롤이 제공되는지 수동으로 확인하십시오.`,
						helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
						nodes: [{
							target: [this.getSelector(element)], // getSelector 함수는 공통 유틸리티로 분리될 예정
							html: element.outerHTML.substring(0, Math.min(element.outerHTML.indexOf('>') + 1, 250)) + (element.outerHTML.length > 250 ? '...>' : ''),
							failureSummary: 'CSS 애니메이션/transition 사용에 따른 제어 기능 수동 확인 필요',
							any: [], all: [], none: []
						}],
						kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
					});
				}
			}
		});

		// TODO: JavaScript에 의한 자동 변경 콘텐츠 탐지 로직 추가 (매우 어려움)


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
