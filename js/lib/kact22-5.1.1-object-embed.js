/**
 * KWCAG 5.1.1: 대체 텍스트 제공 - <object> 및 <embed> 요소 검사
 * 텍스트 아닌 콘텐츠에는 그 의미나 용도를 인식할 수 있도록 대체 텍스트를 제공해야 한다.
 */

import { getSelector, escapeHTML, imageUrlToBase64, addReviewItem } from './kact22-5.1.1.js'; // 공통 함수 import

export async function checkObjectEmbed(document, reviewItems) { // reviewItems 인자 추가
	// 5. <object> 요소 검사 (대체 텍스트가 있는 경우 - 수동 검토 필요 항목)
	// 대체 텍스트가 있는 object 요소 선택: aria-label, aria-labelledby, title 속성이 있거나 내부에 콘텐츠가 있는 경우
	const objectElementsWithAlt = document.querySelectorAll('object[aria-label], object[aria-labelledby], object[title]');
	const objectElementsWithContent = Array.from(document.querySelectorAll('object')).filter(el => el.innerHTML.trim() !== '');

	// 중복 제거 및 검사
	const objectElements = new Set([...objectElementsWithAlt, ...objectElementsWithContent]);

	for (const objectEl of objectElements) {
		// 명확한 위반 (대체 텍스트가 전혀 없는 경우)은 violations.js에서 처리되므로 여기서는 제외
		const hasFallbackContent = objectEl.innerHTML.trim() !== '';
		const hasAriaLabel = objectEl.hasAttribute('aria-label');
		const hasAriaLabelledby = objectEl.hasAttribute('aria-labelledby');
		const hasTitle = objectEl.hasAttribute('title');

		if (!hasFallbackContent && !hasAriaLabel && !hasAriaLabelledby && !hasTitle) {
			continue; // 대체 텍스트가 없는 경우는 violations.js에서 처리
		}

		// object 요소의 콘텐츠를 Base64로 변환하는 것은 복잡하므로 일단 src만 포함
		addReviewItem(reviewItems, objectEl, 'object', { // reviewItems 인자 전달
			src: objectEl.data || objectEl.type, // data 또는 type 속성 사용
			altText: objectEl.getAttribute('alt'), // object의 alt 속성 (지원 중단)
			ariaLabel: objectEl.getAttribute('aria-label'),
			ariaLabelledby: objectEl.getAttribute('aria-labelledby'),
			title: objectEl.getAttribute('title'),
			fallbackContent: objectEl.innerHTML.trim().substring(0, 100) + (objectEl.innerHTML.trim().length > 100 ? '...' : ''),
			// object/embed의 경우 params를 대체 텍스트로 활용하는 경우도 있음
			objectEmbedParams: objectEl.querySelector('param') ? Array.from(objectEl.querySelectorAll('param')).map(p => `${p.name}=${p.value}`).join(', ') : null,
			needsManualCheck: true // 대체 텍스트 적절성 수동 검토 필요
		});
	}

	// 6. <embed> 요소 검사 (대체 텍스트가 있는 경우 - 수동 검토 필요 항목)
	// 대체 텍스트가 있는 embed 요소 선택: aria-label, aria-labelledby, title 속성이 있는 경우
	const embedElements = document.querySelectorAll('embed[aria-label], embed[aria-labelledby], embed[title]');
	for (const embedEl of embedElements) {
		// 명확한 위반 (대체 텍스트가 전혀 없는 경우)은 violations.js에서 처리되므로 여기서는 제외
		const hasAriaLabel = embedEl.hasAttribute('aria-label');
		const hasAriaLabelledby = embedEl.hasAttribute('aria-labelledby');
		const hasTitle = embedEl.hasAttribute('title');

		if (!hasAriaLabel && !hasAriaLabelledby && !hasTitle) {
			continue; // 대체 텍스트가 없는 경우는 violations.js에서 처리
		}

		// embed 요소의 콘텐츠를 Base64로 변환하는 것은 복잡하므로 일단 src만 포함
		addReviewItem(reviewItems, embedEl, 'embed', { // reviewItems 인자 전달
			src: embedEl.src || embedEl.type, // src 또는 type 속성 사용
			ariaLabel: embedEl.getAttribute('aria-label'),
			ariaLabelledby: embedEl.getAttribute('aria-labelledby'),
			title: embedEl.getAttribute('title'),
			needsManualCheck: true // 대체 텍스트 적절성 수동 검토 필요
		});
	}
}
