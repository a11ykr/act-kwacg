/**
 * KWCAG 5.1.1: 대체 텍스트 제공 - <area> 요소 검사
 * 텍스트 아닌 콘텐츠에는 그 의미나 용도를 인식할 수 있도록 대체 텍스트를 제공해야 한다.
 */

import { getSelector, escapeHTML, imageUrlToBase64, addReviewItem } from './kact22-5.1.1.js'; // 공통 함수 import

export async function checkArea(document, reviewItems) { // reviewItems 인자 추가
	// 3. <area> 요소 검사 (href 속성이 있고 alt 속성이 있는 경우 - 수동 검토 필요 항목)
	const areaElements = document.querySelectorAll('area[href][alt]');
	for (const area of areaElements) {
		// alt="" 이고 장식용으로 판단되는 경우는 제외 (violations.js에서 처리)
		const isDecorative = area.getAttribute('alt') === "" && area.hasAttribute('alt');
		if (isDecorative) {
			continue; // 장식용 이미지는 수동 검토 목록에서 제외
		}

		const altText = area.getAttribute('alt');
		const ariaLabel = area.getAttribute('aria-label');
		// area 요소는 직접적인 이미지 소스가 없으므로 Base64 변환 생략
		addReviewItem(reviewItems, area, 'area', { // reviewItems 인자 전달
			src: area.href,
			altText: altText,
			ariaLabel: ariaLabel,
			isDecorative: altText === "" && area.hasAttribute('alt'),
			needsManualCheck: true // 5.1.1은 기본적으로 수동 검토 필요
		});
	}
}
