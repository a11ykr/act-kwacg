/**
 * KWCAG 5.1.1: 대체 텍스트 제공 - 배경 이미지 검사
 * 텍스트 아닌 콘텐츠에는 그 의미나 용도를 인식할 수 있도록 대체 텍스트를 제공해야 한다.
 */

import { getSelector, escapeHTML, imageUrlToBase64, addReviewItem } from './kact22-5.1.1.js'; // 공통 함수 import

export async function checkBackgroundImage(document, reviewItems) { // reviewItems 인자 추가
	// 7. 배경 이미지 검사
	const allElements = document.querySelectorAll('*');
	for (const el of allElements) {
		if (el.nodeType === Node.ELEMENT_NODE) { // 요소 노드만 검사
			const style = window.getComputedStyle(el);
			const backgroundImage = style.getPropertyValue('background-image');
			const displayStyle = style.getPropertyValue('display'); // display 스타일 확인

			// 'none'이 아니고 'url('을 포함하며, display가 'none'이 아닌 경우 배경 이미지가 있다고 간주
			if (backgroundImage && backgroundImage !== 'none' && backgroundImage.includes('url(') && displayStyle !== 'none') {
				// 요소 내부에 텍스트 콘텐츠가 있는지 확인
				const hasTextContent = el.textContent && el.textContent.trim().length > 0;

				// 내부에 텍스트 콘텐츠가 있는 경우에만 검사 대상 항목으로 추가
				if (hasTextContent) {
					// CSS 문자열에서 URL 추출 (간단한 버전, 더 복잡한 URL 형식은 추가 처리 필요)
					const urlMatch = backgroundImage.match(/url\("?([^")]+)"?\)/);
					const imageUrl = urlMatch ? urlMatch[1] : backgroundImage;

					const base64Image = await imageUrlToBase64(imageUrl); // Base64 변환 호출

					addReviewItem(reviewItems, el, 'background-image', { // reviewItems 인자 전달
						src: imageUrl,
						base64Image: base64Image, // Base64 데이터 추가
						ariaLabel: el.getAttribute('aria-label'),
						// 배경 이미지의 경우, 요소의 텍스트 콘텐츠 일부를 참고용으로 제공
						altText: el.textContent ? el.textContent.trim().substring(0, 50) + (el.textContent.trim().length > 50 ? '...' : '') : null,
						isDecorative: false, // 배경 이미지는 기본적으로 장식용이 아니라고 가정, 수동 판단 필요
						needsManualCheck: true // 5.1.1은 기본적으로 수동 검토 필요
					});
				}
			}
		}
	}
}
