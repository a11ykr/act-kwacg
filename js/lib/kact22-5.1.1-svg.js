/**
 * KWCAG 5.1.1: 대체 텍스트 제공 - <svg> 요소 검사
 * 텍스트 아닌 콘텐츠에는 그 의미나 용도를 인식할 수 있도록 대체 텍스트를 제공해야 한다.
 */

import { getSelector, escapeHTML, imageUrlToBase64, addReviewItem } from './kact22-5.1.1.js'; // 공통 함수 import

export async function checkSvg(document, reviewItems) { // reviewItems 인자 추가
	// 4. <svg> 요소 검사 (대체 텍스트가 있는 경우 - 수동 검토 필요 항목)
	// 대체 텍스트가 있는 svg 요소 선택: title, desc, aria-label, aria-labelledby 속성 중 하나라도 있는 경우
	const svgElements = document.querySelectorAll('svg:where([aria-label], [aria-labelledby], [title])'); // :where()를 사용하여 복잡성 감소

	for (const svg of svgElements) {
		// 명확한 위반 (대체 텍스트가 전혀 없는 경우)은 violations.js에서 처리되므로 여기서는 제외
		const hasTitleElement = svg.querySelector('title') !== null;
		const hasDescElement = svg.querySelector('desc') !== null;
		const hasAriaLabel = svg.hasAttribute('aria-label');
		const hasAriaLabelledby = svg.hasAttribute('aria-labelledby');

		if (!hasTitleElement && !hasDescElement && !hasAriaLabel && !hasAriaLabelledby) {
			continue; // 대체 텍스트가 없는 경우는 violations.js에서 처리
		}

		const ariaLabel = svg.getAttribute('aria-label');
		let svgTitle = '';
		const titleElement = svg.querySelector('title');
		if (titleElement) {
			svgTitle = titleElement.textContent.trim();
		}
		const role = svg.getAttribute('role');
		const isDecorative = svg.getAttribute('aria-hidden') === 'true' || role === 'presentation' || role === 'none' || (!ariaLabel && !svgTitle && !svg.hasAttribute('aria-labelledby'));


		// SVG는 직접적인 이미지 소스가 없으므로 Base64 변환 생략
		addReviewItem(reviewItems, svg, 'svg', { // reviewItems 인자 전달
			src: null, // SVG는 src 속성이 없음
			altText: null, // SVG는 alt 속성이 없음
			ariaLabel: ariaLabel,
			ariaLabelledby: svg.getAttribute('aria-labelledby'),
			title: svg.getAttribute('title'), // title 속성도 대체 텍스트로 사용될 수 있음
			svgTitle: svgTitle, // title 요소의 텍스트
			svgDesc: svg.querySelector('desc') ? svg.querySelector('desc').textContent.trim() : null, // desc 요소의 텍스트
			isDecorative: isDecorative,
			needsManualCheck: true // 대체 텍스트 적절성 수동 검토 필요
		});
	}
}
