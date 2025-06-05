/**
 * KWCAG 5.2.1: 자막 제공
 * 멀티미디어 콘텐츠에는 자막, 대본 또는 수어를 제공해야 한다.
 */
export default {
	id: 'kact-rule-5.2.1',
	kwcagId: '5.2.1',
	title: '자막 제공',
	description: '멀티미디어 콘텐츠에 자막, 대본 또는 수어가 제공되는지 검토합니다. (KWCAG 5.2.1)',
	tags: ['kwcag', 'kwcag-5.2.1', 'wcag122'], // WCAG 1.2.2 매핑

	/**
	 * KWCAG 5.2.1 준수 여부를 검사합니다.
	 * @param {Document} document 검사할 HTML 문서 객체
	 * @param {Object} options 추가 옵션 (필요시 사용)
	 * @returns {Array<Object>} 검사 결과 목록.
	 */
	check(document, options = {}) {
		const results = [];

		// TODO: 5.2.1 자동 검사 로직 구현
		// - <audio> 및 <video> 요소 탐색
		// - track 요소 또는 다른 자막/대본 제공 방식 확인
		// - 수동 검토가 필요한 항목 식별

		// 예시: 모든 <video> 요소를 수동 검토 항목으로 추가
		document.querySelectorAll('video').forEach(video => {
			results.push({
				id: `kact-5.2.1-review-video-${results.length}`,
				impact: 'review', // 수동 검토 필요 항목
				tags: ['kwcag', 'kwcag-5.2.1', 'manual-review', 'video-caption-review'],
				description: `[${this.kwcagId} ${this.title}] 검사 대상: <video> 요소. 자막, 대본 또는 수어 제공 여부를 수동으로 확인해야 합니다.`,
				help: `이 비디오 콘텐츠에 대해 자막, 대본 또는 수어가 제공되는지, 그리고 내용이 정확하고 동기화되어 있는지 확인하십시오.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: [this.getSelector(video)], // getSelector 함수는 panel.js 또는 유틸리티 파일에서 제공될 것으로 예상
					html: video.outerHTML.substring(0, Math.min(video.outerHTML.indexOf('>') + 1, 250)) + (video.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: '비디오 콘텐츠에 대한 자막/대본/수어 제공 수동 확인 필요',
					any: [], all: [], none: []
				}],
				kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
			});
		});

		// 예시: 모든 <audio> 요소를 수동 검토 항목으로 추가
		document.querySelectorAll('audio').forEach(audio => {
			results.push({
				id: `kact-5.2.1-review-audio-${results.length}`,
				impact: 'review', // 수동 검토 필요 항목
				tags: ['kwcag', 'kwcag-5.2.1', 'manual-review', 'audio-caption-review'],
				description: `[${this.kwcagId} ${this.title}] 검사 대상: <audio> 요소. 자막 또는 대본 제공 여부를 수동으로 확인해야 합니다.`,
				help: `이 오디오 콘텐츠에 대해 자막 또는 대본이 제공되는지, 그리고 내용이 정확한지 확인하십시오.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
				nodes: [{
					target: [this.getSelector(audio)], // getSelector 함수는 panel.js 또는 유틸리티 파일에서 제공될 것으로 예상
					html: audio.outerHTML.substring(0, Math.min(audio.outerHTML.indexOf('>') + 1, 250)) + (audio.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: '오디오 콘텐츠에 대한 자막/대본 제공 수동 확인 필요',
					any: [], all: [], none: []
				}],
				kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
			});
		});


		return results;
	},

	// getSelector 함수는 5.1.1 파일에서 가져와 재사용하거나, 공통 유틸리티로 분리해야 합니다.
	// 여기서는 임시로 5.1.1 파일의 함수를 복사하여 사용합니다. 실제 구현 시에는 공통화 필요.
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
