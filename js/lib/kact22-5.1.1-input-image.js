/**
 * KWCAG 5.1.1: 대체 텍스트 제공 - <input type="image"> 요소 검사
 * 텍스트 아닌 콘텐츠에는 그 의미나 용도를 인식할 수 있도록 대체 텍스트를 제공해야 한다.
 */

import { getSelector, escapeHTML, imageUrlToBase64, addReviewItem } from './kact22-5.1.1.js'; // 공통 함수 import

export async function checkInputImage(document, reviewItems) { // reviewItems 인자 추가
	// 2. <input type="image"> 요소 검사 (alt 속성이 있는 경우 - 수동 검토 필요 항목)
	const inputImgElements = document.querySelectorAll('input[type="image"][alt]');
	for (const inputImg of inputImgElements) {
		// alt="" 이고 장식용으로 판단되는 경우는 제외 (violations.js에서 처리)
		const isDecorative = inputImg.getAttribute('alt') === "" && inputImg.hasAttribute('alt');
		if (isDecorative) {
			continue; // 장식용 이미지는 수동 검토 목록에서 제외
		}

		const altText = inputImg.getAttribute('alt');
		const ariaLabel = inputImg.getAttribute('aria-label');
		const base64Image = await imageUrlToBase64(inputImg.src); // Base64 변환 호출
		addReviewItem(reviewItems, inputImg, 'input-image', { // reviewItems 인자 전달
			src: inputImg.src,
			base64Image: base64Image, // Base64 데이터 추가
			altText: altText,
			ariaLabel: ariaLabel,
			isDecorative: altText === "" && inputImg.hasAttribute('alt'),
			needsManualCheck: true // 5.1.1은 기본적으로 수동 검토 필요
		});
	}
}
