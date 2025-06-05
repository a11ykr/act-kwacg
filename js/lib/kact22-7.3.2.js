/**
 * KWCAG 7.3.2: 레이블 제공
 * 사용자 입력에는 대응하는 레이블을 제공해야 한다.
 */
export default {
	id: 'kact-rule-7.3.2',
	kwcagId: '7.3.2',
	title: '레이블 제공',
	description: '사용자 입력 컨트롤에 대응하는 레이블이 제공되는지 검토합니다. (KWCAG 7.3.2)',
	tags: ['kwcag', 'kwcag-7.3.2', 'wcag332'], // WCAG 3.3.2 매핑

	/**
	 * KWCAG 7.3.2 준수 여부를 검사합니다.
	 * @param {Document} document 검사할 HTML 문서 객체
	 * @param {Object} options 추가 옵션 (필요시 사용)
	 * @returns {Array<Object>} 검사 결과 목록.
	 */
	check(document, options = {}) {
		const results = [];

		// TODO: 7.3.2 자동 검사 로직 구현
		// - 사용자 입력 컨트롤 탐색 (input, select, textarea 등)
		// - 각 컨트롤에 연결된 레이블 존재 여부 확인 (<label for="...">, aria-label, aria-labelledby 등)
		// - 레이블 내용의 명확성 수동 검토 항목 추가
		// - 필수 입력 항목 표시 여부 수동 검토 항목 추가

		document.querySelectorAll('input:not([type="hidden"]), select, textarea, [role="textbox"], [role="combobox"]').forEach(inputControl => {
			const hasLabel = document.querySelector(`label[for="${inputControl.id}"]`) ||
							 inputControl.hasAttribute('aria-label') ||
							 inputControl.hasAttribute('aria-labelledby') ||
							 (inputControl.type === 'button' || inputControl.type === 'submit' || inputControl.type === 'reset' || inputControl.type === 'image') || // 버튼류는 value나 alt가 레이블 역할
							 (inputControl.type === 'checkbox' || inputControl.type === 'radio') && inputControl.labels.length > 0; // 체크박스/라디오는 labels 속성 확인

			if (!hasLabel) {
				results.push({
					id: `kact-7.3.2-violation-label-missing-${results.length}`,
					impact: 'critical', // 명확한 위반
					tags: ['kwcag', 'kwcag-7.3.2', 'violation', 'label'],
					description: `[${this.kwcagId} ${this.title}] 검사 대상: <${inputControl.tagName.toLowerCase()}> 요소. 대응하는 레이블이 없습니다.`,
					help: `모든 사용자 입력 컨트롤에는 대응하는 레이블을 제공해야 합니다. <label for="...">, aria-label 또는 aria-labelledby 속성을 사용하십시오.`,
					helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
					nodes: [{
						target: [this.getSelector(inputControl)], // getSelector 함수는 공통 유틸리티로 분리될 예정
						html: inputControl.outerHTML.substring(0, Math.min(inputControl.outerHTML.indexOf('>') + 1, 250)) + (inputControl.outerHTML.length > 250 ? '...>' : ''),
						failureSummary: '대응하는 레이블 누락',
						any: [], all: [], none: []
					}],
					kwcag: { id: this.kwcagId, title: this.title, link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}` }
				});
			} else {
				// TODO: 레이블 내용의 명확성 및 필수 입력 항목 표시 여부 수동 검토 항목 추가
				results.push({
					id: `kact-7.3.2-review-label-content-${results.length}`,
					impact: 'review', // 수동 검토 필요 항목
					tags: ['kwcag', 'kwcag-7.3.2', 'manual-review', 'label-content-review'],
					description: `[${this.kwcagId} ${this.title}] 검사 대상: <${inputControl.tagName.toLowerCase()}> 요소. 레이블이 존재합니다. 레이블 내용의 명확성을 수동으로 확인해야 합니다.`,
					help: `이 입력 컨트롤의 레이블이 어떤 정보를 입력해야 하는지 명확하게 설명하는지 확인하십시오. 필수 입력 항목인 경우 명확하게 표시되었는지도 확인하십시오.`,
					helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=${this.kwcagId}`,
					nodes: [{
						target: [this.getSelector(inputControl)], // getSelector 함수는 공통 유틸리티로 분리될 예정
						html: inputControl.outerHTML.substring(0, Math.min(inputControl.outerHTML.indexOf('>') + 1, 250)) + (inputControl.outerHTML.length > 250 ? '...>' : ''),
						failureSummary: '레이블 내용 및 필수 항목 표시 수동 확인 필요',
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
