/**
 * KWCAG 7.1.1: 기본 언어 표시
 * 주로 사용하는 언어를 명시해야 한다.
 */
export default {
	id: 'kact-rule-7.1.1',
	kwcagId: '7.1.1',
	title: '기본 언어 표시',
	description: '웹 페이지의 기본 언어가 명시되었는지 검토합니다. (KWCAG 7.1.1)',
	tags: ['kwcag', 'kwcag-7.1.1', 'wcag311'], // WCAG 3.1.1 매핑

	/**
	 * KWCAG 7.1.1 준수 여부를 검사합니다.
	 * @param {Document} document 검사할 HTML 문서 객체
	 * @param {Object} options 추가 옵션 (필요시 사용)
	 * @returns {Array<Object>} 검사 결과 목록.
	 */
	check(document, options = {}) {
		const results = [];

		// TODO: 7.1.1 자동 검사 로직 구현
		// - <html> 요소에 lang 속성 존재 확인
		// - lang 속성 값이 유효한 언어 코드인지 확인
		// - 페이지 내용 중 다른 언어 사용 시 해당 부분에 lang 속성 사용 확인 (어려울 수 있음, 수동 검토 필요)

		const htmlElement = document.documentElement;
		const langAttribute = htmlElement.getAttribute('lang');

		if (!langAttribute || langAttribute.trim().length === 0) {
			results.push({
				id: 'kact-7.1.1-violation-html-lang-missing',
				impact: 'critical', // 명확한 위반
				tags: ['kwcag', 'kwcag-7.1.1', 'violation', 'html-has-lang'],
				description: `[${this.kwcagId} ${this.title}] <html> 요소에 lang 속성이 없거나 비어 있습니다.`,
				help: `웹 페이지의 기본 언어를 <html> 요소의 lang 속성으로 명시해야 합니다. 예: <html lang="ko">`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: ['html'],
					html: htmlElement.outerHTML.substring(0, Math.min(htmlElement.outerHTML.indexOf('>') + 1, 250)) + (htmlElement.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: 'html lang 속성 누락 또는 비어 있음',
					any: [], all: [], none: []
				}],
				kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
			});
		} else {
			// TODO: lang 속성 값의 유효성 검사 로직 추가 (간단한 형식만 검사하거나 외부 라이브러리 사용)
			// 현재는 속성이 존재하면 수동 검토 항목으로 추가
			results.push({
				id: 'kact-7.1.1-review-html-lang-valid',
				impact: 'review', // 수동 검토 필요 항목
				tags: ['kwcag', 'kwcag-7.1.1', 'manual-review', 'html-lang-valid-review'],
				description: `[${this.kwcagId} ${this.title}] <html lang="${langAttribute}"> 요소에 lang 속성이 존재합니다. 속성 값의 유효성을 수동으로 확인해야 합니다.`,
				help: `<html> 요소의 lang 속성 값("${langAttribute}")이 유효한 언어 코드(예: "ko", "en-US")인지 확인하십시오.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: ['html'],
					html: htmlElement.outerHTML.substring(0, Math.min(htmlElement.outerHTML.indexOf('>') + 1, 250)) + (htmlElement.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: 'html lang 속성 값 유효성 수동 확인 필요',
					any: [], all: [], none: []
				}],
				kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
			});
		}

		// TODO: 페이지 내용 중 다른 언어 사용 시 해당 부분에 lang 속성 사용 확인 로직 추가 (매우 어려움)


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
