/**
 * KWCAG 6.4.2: 제목 제공
 * 페이지, 프레임, 콘텐츠 블록에는 적절한 제목을 제공해야 한다.
 */
export default {
	id: 'kact-rule-6.4.2',
	kwcagId: '6.4.2',
	title: '제목 제공',
	description: '페이지, 프레임, 콘텐츠 블록에 적절한 제목이 제공되는지 검토합니다. (KWCAG 6.4.2)',
	tags: ['kwcag', 'kwcag-6.4.2', 'wcag242', 'wcag246'], // WCAG 2.4.2, 2.4.6 매핑

	/**
	 * KWCAG 6.4.2 준수 여부를 검사합니다.
	 * @param {Document} document 검사할 HTML 문서 객체
	 * @param {Object} options 추가 옵션 (필요시 사용)
	 * @returns {Array<Object>} 검사 결과 목록.
	 */
	check(document, options = {}) {
		const results = [];

		// TODO: 6.4.2 자동 검사 로직 구현
		// - <title> 요소 존재 및 내용 확인
		// - <iframe> 요소의 title 속성 존재 및 내용 확인
		// - <h1> 요소 존재 확인 (페이지당 하나 권장)
		// - 제목 요소(h1-h6)의 빈 내용 또는 부적절한 사용 탐지
		// - 수동 검토가 필요한 항목 식별 (제목의 적절성, 논리적 구조 등)

		// 1. <title> 요소 검사
		const titleElement = document.querySelector('title');
		if (!titleElement || titleElement.textContent.trim().length === 0) {
			results.push({
				id: 'kact-6.4.2-violation-document-title',
				impact: 'critical', // 명확한 위반
				tags: ['kwcag', 'kwcag-6.4.2', 'violation', 'document-title'],
				description: `[${this.kwcagId} ${this.title}] 페이지 제목(<title> 요소)이 없거나 비어 있습니다.`,
				help: `모든 웹 페이지에는 해당 페이지의 주제나 목적을 설명하는 고유하고 적절한 <title> 요소를 제공해야 합니다.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: ['html > head > title'],
					html: titleElement ? titleElement.outerHTML : '<title> 요소 없음',
					failureSummary: '페이지 제목 누락 또는 비어 있음',
					any: [], all: [], none: []
				}],
				kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
			});
		} else {
			// TODO: 페이지 제목의 적절성 수동 검토 항목 추가
			results.push({
				id: 'kact-6.4.2-review-document-title',
				impact: 'review', // 수동 검토 필요 항목
				tags: ['kwcag', 'kwcag-6.4.2', 'manual-review', 'document-title-review'],
				description: `[${this.kwcagId} ${this.title}] 페이지 제목(<title> 요소)이 존재합니다. 제목의 적절성을 수동으로 확인해야 합니다.`,
				help: `페이지 제목(<title>${titleElement.textContent.trim()}</title>)이 해당 페이지의 내용을 명확하게 설명하는지 확인하십시오.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: ['html > head > title'],
					html: titleElement.outerHTML,
					failureSummary: '페이지 제목 적절성 수동 확인 필요',
					any: [], all: [], none: []
				}],
				kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
			});
		}


		// 2. <iframe> 요소 검사
		document.querySelectorAll('iframe').forEach(iframe => {
			const iframeTitle = iframe.getAttribute('title');
			if (!iframeTitle || iframeTitle.trim().length === 0) {
				results.push({
					id: `kact-6.4.2-violation-iframe-title-${results.length}`,
					impact: 'critical', // 명확한 위반
					tags: ['kwcag', 'kwcag-6.4.2', 'violation', 'frame-title'],
					description: `[${this.kwcagId} ${this.title}] 검사 대상: <iframe> 요소. title 속성이 없거나 비어 있습니다.`,
					help: `모든 <iframe> 요소에는 해당 프레임의 콘텐츠를 설명하는 title 속성을 제공해야 합니다.`,
					helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
					nodes: [{
						target: [this.getSelector(iframe)], // getSelector 함수는 공통 유틸리티로 분리될 예정
						html: iframe.outerHTML.substring(0, Math.min(iframe.outerHTML.indexOf('>') + 1, 250)) + (iframe.outerHTML.length > 250 ? '...>' : ''),
						failureSummary: 'iframe title 속성 누락 또는 비어 있음',
						any: [], all: [], none: []
					}],
					kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
				});
			} else {
				// TODO: iframe title 속성의 적절성 수동 검토 항목 추가
				results.push({
					id: `kact-6.4.2-review-iframe-title-${results.length}`,
					impact: 'review', // 수동 검토 필요 항목
					tags: ['kwcag', 'kwcag-6.4.2', 'manual-review', 'frame-title-review'],
					description: `[${this.kwcagId} ${this.title}] 검사 대상: <iframe> 요소. title 속성이 존재합니다. 제목의 적절성을 수동으로 확인해야 합니다.`,
					help: `<iframe title="${iframeTitle}"> 요소의 title 속성이 해당 프레임의 내용을 명확하게 설명하는지 확인하십시오.`,
					helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
					nodes: [{
						target: [this.getSelector(iframe)], // getSelector 함수는 공통 유틸리티로 분리될 예정
						html: iframe.outerHTML.substring(0, Math.min(iframe.outerHTML.indexOf('>') + 1, 250)) + (iframe.outerHTML.length > 250 ? '...>' : ''),
						failureSummary: 'iframe title 속성 적절성 수동 확인 필요',
						any: [], all: [], none: []
					}],
					kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
				});
			}
		});

		// 3. 제목 요소 (h1-h6) 검사
		const h1Elements = document.querySelectorAll('h1');
		if (h1Elements.length === 0) {
			results.push({
				id: 'kact-6.4.2-review-h1-missing',
				impact: 'review', // 권장 사항 (명확한 위반은 아님)
				tags: ['kwcag', 'kwcag-6.4.2', 'manual-review', 'heading-structure-review'],
				description: `[${this.kwcagId} ${this.title}] 페이지에 <h1> 요소가 없습니다.`,
				help: `페이지의 주요 제목으로 <h1> 요소를 사용하는 것이 권장됩니다. 콘텐츠의 논리적 구조를 나타내기 위해 제목 요소를 올바르게 사용했는지 확인하십시오.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [], // 특정 요소에 대한 문제가 아니므로 nodes는 비워둠
				kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
			});
		} else if (h1Elements.length > 1) {
			// TODO: h1이 여러 개인 경우 수동 검토 항목 추가
			h1Elements.forEach((h1, index) => {
				results.push({
					id: `kact-6.4.2-review-multiple-h1-${index}`,
					impact: 'review', // 수동 검토 필요 항목
					tags: ['kwcag', 'kwcag-6.4.2', 'manual-review', 'heading-structure-review'],
					description: `[${this.kwcagId} ${this.title}] 검사 대상: <h1> 요소. 페이지에 여러 개의 <h1> 요소가 있습니다.`,
					help: `일반적으로 페이지당 하나의 <h1> 요소만 사용하는 것이 권장됩니다. 제목 구조가 논리적인지 수동으로 확인하십시오.`,
					helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
					nodes: [{
						target: [this.getSelector(h1)], // getSelector 함수는 공통 유틸리티로 분리될 예정
						html: h1.outerHTML.substring(0, Math.min(h1.outerHTML.indexOf('>') + 1, 250)) + (h1.outerHTML.length > 250 ? '...>' : ''),
						failureSummary: '여러 개의 h1 요소 사용 수동 확인 필요',
						any: [], all: [], none: []
					}],
					kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
				});
			});
		}

		// 빈 제목 요소 검사
		document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
			if (heading.textContent.trim().length === 0) {
				results.push({
					id: `kact-6.4.2-violation-empty-heading-${results.length}`,
					impact: 'critical', // 명확한 위반
					tags: ['kwcag', 'kwcag-6.4.2', 'violation', 'empty-heading'],
					description: `[${this.kwcagId} ${this.title}] 검사 대상: <${heading.tagName.toLowerCase()}> 요소. 제목 내용이 비어 있습니다.`,
					help: `제목 요소는 콘텐츠의 구조를 나타내야 하므로 비어 있으면 안 됩니다.`,
					helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
					nodes: [{
						target: [this.getSelector(heading)], // getSelector 함수는 공통 유틸리티로 분리될 예정
						html: heading.outerHTML.substring(0, Math.min(heading.outerHTML.indexOf('>') + 1, 250)) + (heading.outerHTML.length > 250 ? '...>' : ''),
						failureSummary: '빈 제목 요소 사용',
						any: [], all: [], none: []
					}],
					kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
				});
			}
		});

		// TODO: 제목 요소의 논리적 순서 및 적절성 수동 검토 항목 추가 (모든 제목 요소 대상)


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
