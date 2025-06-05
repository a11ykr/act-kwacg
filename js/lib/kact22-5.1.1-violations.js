/**
 * KWCAG 5.1.1: 대체 텍스트 제공 - 명확한 위반 사항 검출
 * 텍스트 아닌 콘텐츠에는 그 의미나 용도를 인식할 수 있도록 대체 텍스트를 제공해야 한다.
 */

import { getSelector, escapeHTML, imageUrlToBase64, addReviewItem } from './kact22-5.1.1.js'; // 공통 함수 import

export async function checkViolations(document, reviewItems) { // reviewItems 인자 추가
	// 명확한 위반 사항 검출 (예: alt 속성 없는 img) - 이 부분은 그대로 유지하여 자동 검사 결과로 보고
	const imgElementsMissingAlt = document.querySelectorAll('img:not([alt])');
	for (const img of imgElementsMissingAlt) {
		if (img.getAttribute('aria-hidden') !== 'true' && img.getAttribute('role') !== 'presentation' && img.getAttribute('role') !== 'none') {
			// 필요한 데이터 수집 (addReviewItem과 유사하게)
			const altText = img.getAttribute('alt');
			const ariaLabel = img.getAttribute('aria-label');
			const type = 'img';
			const src = img.src;
			const isDecorative = (altText === "" && img.hasAttribute('alt')) || img.getAttribute('role') === 'presentation' || img.getAttribute('role') === 'none' || img.getAttribute('aria-hidden') === 'true';
			const base64Image = await imageUrlToBase64(src); // Base64 변환 호출
			const data = { type, src, base64Image, altText, ariaLabel, isDecorative, needsManualCheck: false }; // 명확한 위반이므로 manualCheck는 false

			// imageHtml 생성 (addReviewItem과 동일하게)
			let imageHtml = `<div class="kwcag-display-image" style="flex-shrink: 0; margin-right: 10px;">`;
			// Base64 이미지 데이터가 있는 경우 해당 데이터를 사용
			if (data.base64Image) {
				imageHtml += `<img src="${escapeHTML(data.base64Image)}" alt="검사 대상 이미지" style="max-width: 100px; height: auto; vertical-align: middle; border: 1px solid #ccc;">`;
			}
			// kwcagDisplayData가 있고, 타입이 'img'이며, 유효한 src가 있는 경우에만 이미지 표시 (Base64 없을 때 대체)
			else if (data.type === 'img' && data.src) {
				// 이미지 로드 오류 처리를 위해 onerror 핸들러 추가
				imageHtml += `<img src="${escapeHTML(data.src)}" alt="검사 대상 이미지" style="max-width: 100px; height: auto; vertical-align: middle; border: 1px solid #ccc;" onerror="this.onerror=null;this.src='';this.alt='이미지 로드 실패'; this.style.display='none'; this.nextElementSibling.style.display='inline-block';">`;
				// 이미지 로드 실패 시 표시할 대체 텍스트 (초기에는 숨김)
				imageHtml += `<span style="display: none; width: 100px; height: 50px; border: 1px dashed #ccc; text-align: center; line-height: 50px; font-size: 0.8em; color: #999;">이미지 로드 실패</span>`;
			} else {
				// 이미지가 없거나 유효하지 않은 경우 "이미지 표시 불가" 텍스트 표시
				imageHtml += `<span style="display: inline-block; width: 100px; height: 50px; border: 1px dashed #ccc; text-align: center; line-height: 50px; font-size: 0.8em; color: #999;">이미지 표시 불가</span>`;
			}
			imageHtml += `</div>`;


			// infoText 생성 (addReviewItem과 유사하게, 위반 상태는 '명확한 위반'으로 표시)
			let infoParts = [];
			if (data.type) infoParts.push(`유형: ${data.type}`);
			if (data.altText !== undefined && data.altText !== null) {
				infoParts.push(`alt="${escapeHTML(data.altText)}"`);
			} else if (data.ariaLabel) {
				infoParts.push(`aria-label="${escapeHTML(data.ariaLabel)}"`);
			} else if (data.svgTitle) {
				infoParts.push(`title 요소: "${escapeHTML(data.svgTitle)}"`);
			} else {
				infoParts.push(`alt/aria-label/title 없음`);
			}
			infoParts.push('명확한 위반'); // 위반 상태를 '명확한 위반'으로 표시
			// 소스 정보는 마지막에 추가 (Base64가 없을 때만)
			if (!data.base64Image && data.src) {
				infoParts.push(`소스: ${escapeHTML(data.src.substring(0, 100))}${data.src.length > 100 ? '...' : ''}`);
			}
			let infoText = infoParts.join(' | ');


			addReviewItem(reviewItems, img, 'img', { // reviewItems 인자 전달
				id: 'kact-5.1.1-violation-img-missing-alt',
				impact: 'critical',
				tags: ['kwcag', 'kwcag-5.1.1', 'violation'],
				description: `[5.1.1 대체 텍스트 제공] 검사 대상: <img> 요소. alt 속성이 없습니다.`,
				help: `모든 <img> 요소에는 콘텐츠를 설명하는 alt 속성을 제공하거나, 장식용 이미지인 경우 alt=""로 지정해야 합니다.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=5.1.1`,
				nodes: [{
					target: [getSelector(img)],
					html: img.outerHTML.substring(0, Math.min(img.outerHTML.indexOf('>') + 1, 250)) + (img.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: `<img> 요소에 alt 속성이 누락되었습니다.`,
					any: [], all: [], none: [],
					// imageHtml과 infoText 추가
					imageHtml: imageHtml,
					infoText: infoText,
					elementSelector: getSelector(img), // 요소 보기 버튼을 위해 추가
					rawElementOuterHTML: img.outerHTML, // 필요시 추가 정보
					kwcagDisplayData: data // 원본 데이터 추가
				}],
				kwcag: { id: '5.1.1', title: '대체 텍스트 제공', link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=5.1.1` }
			});
		}
	}

	const inputImgElementsMissingAlt = document.querySelectorAll('input[type="image"]:not([alt])');
	for (const inputImg of inputImgElementsMissingAlt) {
		// input[type="image"]에 대한 명확한 위반 처리에도 imageHtml과 infoText 추가
		const altText = inputImg.getAttribute('alt');
		const ariaLabel = inputImg.getAttribute('aria-label');
		const type = 'input-image';
		const src = inputImg.src;
		const isDecorative = altText === "" && inputImg.hasAttribute('alt');
		const base64Image = await imageUrlToBase64(src); // Base64 변환 호출
		const data = { type, src, base64Image, altText, ariaLabel, isDecorative, needsManualCheck: false };

		let imageHtml = `<div class="kwcag-display-image" style="flex-shrink: 0; margin-right: 10px;">`;
		// Base64 이미지 데이터가 있는 경우 해당 데이터를 사용
		if (data.base64Image) {
			imageHtml += `<img src="${escapeHTML(data.base64Image)}" alt="검사 대상 이미지" style="max-width: 100px; height: auto; vertical-align: middle; border: 1px solid #ccc;">`;
		}
		// input type="image"는 img 태그처럼 직접 이미지를 표시하기 어려울 수 있으므로, 이미지 표시 불가 메시지 또는 아이콘 등으로 대체 가능 (Base64 없을 때 대체)
		else {
			imageHtml += `<span style="display: inline-block; width: 100px; height: 50px; border: 1px dashed #ccc; text-align: center; line-height: 50px; font-size: 0.8em; color: #999;">Input Image</span>`;
		}
		imageHtml += `</div>`;

		let infoParts = [];
		if (data.type) infoParts.push(`유형: ${data.type}`);
		if (data.altText !== undefined && data.altText !== null) {
			infoParts.push(`alt="${escapeHTML(data.altText)}"`);
		} else if (data.ariaLabel) {
			infoParts.push(`aria-label="${escapeHTML(data.ariaLabel)}"`);
		} else {
			infoParts.push(`alt/aria-label 없음`);
		}
		infoParts.push('명확한 위반');
		// 소스 정보는 마지막에 추가 (Base64가 없을 때만)
		if (!data.base64Image && data.src) {
			infoParts.push(`소스: ${escapeHTML(data.src.substring(0, 100))}${data.src.length > 100 ? '...' : ''}`);
		}
		let infoText = infoParts.join(' | ');


		addReviewItem(reviewItems, inputImg, 'input-image', { // reviewItems 인자 전달
			id: 'kact-5.1.1-violation-input-image-missing-alt',
			impact: 'critical',
			tags: ['kwcag', 'kwcag-5.1.1', 'violation'],
			description: `[5.1.1 대체 텍스트 제공] 검사 대상: <input type="image"> 요소. alt 속성이 없습니다.`,
			help: `<input type="image"> 요소에는 기능이나 목적을 설명하는 alt 속성을 제공해야 합니다.`,
			helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=5.1.1`,
			nodes: [{
				target: [getSelector(inputImg)],
				html: inputImg.outerHTML.substring(0, Math.min(inputImg.outerHTML.indexOf('>') + 1, 250)) + (inputImg.outerHTML.length > 250 ? '...>' : ''),
				failureSummary: `<input type="image"> 요소에 alt 속성이 누락되었습니다.`,
				any: [], all: [], none: [],
				// imageHtml과 infoText 추가
				imageHtml: imageHtml,
				infoText: infoText,
				elementSelector: getSelector(inputImg), // 요소 보기 버튼을 위해 추가
				rawElementOuterHTML: inputImg.outerHTML, // 필요시 추가 정보
				kwcagDisplayData: data // 원본 데이터 추가
			}],
			kwcag: { id: '5.1.1', title: '대체 텍스트 제공', link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=5.1.1` }
		});
	}

	// alt 속성 없는 area[href] 요소
	const areaElementsMissingAlt = document.querySelectorAll('area[href]:not([alt])');
	for (const area of areaElementsMissingAlt) {
		const altText = area.getAttribute('alt');
		const ariaLabel = area.getAttribute('aria-label');
		const type = 'area';
		const src = area.href;
		const data = { type, src, altText, ariaLabel, needsManualCheck: false }; // 명확한 위반이므로 manualCheck는 false

		// area 요소는 직접적인 이미지 소스가 없으므로 이미지 표시 불가 텍스트 표시
		let imageHtml = `<div class="kwcag-display-image" style="flex-shrink: 0; margin-right: 10px;">`;
		imageHtml += `<span style="display: inline-block; width: 100px; height: 50px; border: 1px dashed #ccc; text-align: center; line-height: 50px; font-size: 0.8em; color: #999;">Area (No Image)</span>`;
		imageHtml += `</div>`;

		let infoParts = [];
		if (data.type) infoParts.push(`유형: ${data.type}`);
		if (data.altText !== undefined && data.altText !== null) {
			infoParts.push(`alt="${escapeHTML(data.altText)}"`);
		} else if (data.ariaLabel) {
			infoParts.push(`aria-label="${escapeHTML(data.ariaLabel)}"`);
		} else {
			infoParts.push(`alt/aria-label 없음`);
		}
		infoParts.push('명확한 위반');
		if (data.src) {
			infoParts.push(`소스: ${escapeHTML(data.src.substring(0, 100))}${data.src.length > 100 ? '...' : ''}`);
		}
		let infoText = infoParts.join(' | ');

		addReviewItem(reviewItems, area, 'area', { // reviewItems 인자 전달
			id: 'kact-5.1.1-violation-area-missing-alt',
			impact: 'critical',
			tags: ['kwcag', 'kwcag-5.1.1', 'violation'],
			description: `[5.1.1 대체 텍스트 제공] 검사 대상: <area> 요소. alt 속성이 없습니다.`,
			help: `<area> 요소에는 기능이나 목적을 설명하는 alt 속성을 제공해야 합니다.`,
			helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=5.1.1`,
			nodes: [{
				target: [getSelector(area)],
				html: area.outerHTML.substring(0, Math.min(area.outerHTML.indexOf('>') + 1, 250)) + (area.outerHTML.length > 250 ? '...>' : ''),
				failureSummary: `<area> 요소에 alt 속성이 누락되었습니다.`,
				any: [], all: [], none: [],
				imageHtml: imageHtml,
				infoText: infoText,
				elementSelector: getSelector(area),
				rawElementOuterHTML: area.outerHTML,
				kwcagDisplayData: data
			}],
			kwcag: { id: '5.1.1', title: '대체 텍스트 제공', link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=5.1.1` }
		});
	}

	// object 요소에 대체 텍스트가 없는 경우 (명확한 위반)
	const objectElementsMissingAlt = document.querySelectorAll('object:not([aria-label]):not([aria-labelledby]):not([title])');
	for (const objectEl of objectElementsMissingAlt) {
		// object 요소 내부에 대체 콘텐츠가 있는지 확인
		const hasFallbackContent = objectEl.innerHTML.trim() !== '';

		if (!hasFallbackContent) {
			const type = 'object';
			const src = objectEl.data || objectEl.type;
			const altText = objectEl.getAttribute('alt'); // 지원 중단된 alt 속성도 확인
			const ariaLabel = objectEl.getAttribute('aria-label');
			const data = { type, src, altText, ariaLabel, needsManualCheck: false };

			let imageHtml = `<div class="kwcag-display-image" style="flex-shrink: 0; margin-right: 10px;">`;
			imageHtml += `<span style="display: inline-block; width: 100px; height: 50px; border: 1px dashed #ccc; text-align: center; line-height: 50px; font-size: 0.8em; color: #999;">Object (No Alt)</span>`;
			imageHtml += `</div>`;

			let infoParts = [];
			if (data.type) infoParts.push(`유형: ${data.type}`);
			if (data.altText !== undefined && data.altText !== null) {
				infoParts.push(`alt="${escapeHTML(data.altText)}"`);
			}
			if (data.ariaLabel) {
				infoParts.push(`aria-label="${escapeHTML(data.ariaLabel)}"`);
			}
			infoParts.push('명확한 위반');
			if (data.src) {
				infoParts.push(`소스: ${escapeHTML(data.src.substring(0, 100))}${data.src.length > 100 ? '...' : ''}`);
			}
			let infoText = infoParts.join(' | ');

			addReviewItem(reviewItems, objectEl, 'object', {
				id: 'kact-5.1.1-violation-object-missing-alt',
				impact: 'critical',
				tags: ['kwcag', 'kwcag-5.1.1', 'violation'],
				description: `[5.1.1 대체 텍스트 제공] 검사 대상: <object> 요소. 대체 텍스트가 없습니다.`,
				help: `<object> 요소에는 대체 콘텐츠, aria-label, aria-labelledby 또는 title 속성을 사용하여 대체 텍스트를 제공해야 합니다.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=5.1.1`,
				nodes: [{
					target: [getSelector(objectEl)],
					html: objectEl.outerHTML.substring(0, Math.min(objectEl.outerHTML.indexOf('>') + 1, 250)) + (objectEl.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: `<object> 요소에 대체 텍스트가 누락되었습니다.`,
					any: [], all: [], none: [],
					imageHtml: imageHtml,
					infoText: infoText,
					elementSelector: getSelector(objectEl),
					rawElementOuterHTML: objectEl.outerHTML,
					kwcagDisplayData: data
				}],
				kwcag: { id: '5.1.1', title: '대체 텍스트 제공', link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=5.1.1` }
			});
		}
	}

	// embed 요소에 대체 텍스트가 없는 경우 (명확한 위반)
	const embedElementsMissingAlt = document.querySelectorAll('embed:not([aria-label]):not([aria-labelledby]):not([title])');
	for (const embedEl of embedElementsMissingAlt) {
		const type = 'embed';
		const src = embedEl.src || embedEl.type;
		const ariaLabel = embedEl.getAttribute('aria-label');
		const data = { type, src, ariaLabel, needsManualCheck: false };

		let imageHtml = `<div class="kwcag-display-image" style="flex-shrink: 0; margin-right: 10px;">`;
		imageHtml += `<span style="display: inline-block; width: 100px; height: 50px; border: 1px dashed #ccc; text-align: center; line-height: 50px; font-size: 0.8em; color: #999;">Embed (No Alt)</span>`;
		imageHtml += `</div>`;

		let infoParts = [];
		if (data.type) infoParts.push(`유형: ${data.type}`);
		if (data.ariaLabel) {
			infoParts.push(`aria-label="${escapeHTML(data.ariaLabel)}"`);
		}
		infoParts.push('명확한 위반');
		if (data.src) {
			infoParts.push(`소스: ${escapeHTML(data.src.substring(0, 100))}${data.src.length > 100 ? '...' : ''}`);
		}
		let infoText = infoParts.join(' | ');

		addReviewItem(reviewItems, embedEl, 'embed', {
			id: 'kact-5.1.1-violation-embed-missing-alt',
			impact: 'critical',
			tags: ['kwcag', 'kwcag-5.1.1', 'violation'],
			description: `[5.1.1 대체 텍스트 제공] 검사 대상: <embed> 요소. 대체 텍스트가 없습니다.`,
			help: `<embed> 요소에는 aria-label, aria-labelledby 또는 title 속성을 사용하여 대체 텍스트를 제공해야 합니다.`,
			helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=5.1.1`,
			nodes: [{
				target: [getSelector(embedEl)],
				html: embedEl.outerHTML.substring(0, Math.min(embedEl.outerHTML.indexOf('>') + 1, 250)) + (embedEl.outerHTML.length > 250 ? '...>' : ''),
				failureSummary: `<embed> 요소에 대체 텍스트가 누락되었습니다.`,
				any: [], all: [], none: [],
				imageHtml: imageHtml,
				infoText: infoText,
				elementSelector: getSelector(embedEl),
				rawElementOuterHTML: embedEl.outerHTML,
				kwcagDisplayData: data
			}],
			kwcag: { id: '5.1.1', title: '대체 텍스트 제공', link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=5.1.1` }
		});
	}

	// svg 요소에 대체 텍스트가 없는 경우 (명확한 위반)
	const svgElementsMissingAlt = document.querySelectorAll('svg:not([aria-label]):not([aria-labelledby]):not([title])');
	for (const svgEl of svgElementsMissingAlt) {
		// svg 요소 내부에 title 또는 desc 요소가 있는지 확인
		const hasTitleElement = svgEl.querySelector('title') !== null;
		const hasDescElement = svgEl.querySelector('desc') !== null;

		if (!hasTitleElement && !hasDescElement) {
			const type = 'svg';
			const ariaLabel = svgEl.getAttribute('aria-label');
			const data = { type, ariaLabel, needsManualCheck: false };

			let imageHtml = `<div class="kwcag-display-image" style="flex-shrink: 0; margin-right: 10px;">`;
			imageHtml += `<span style="display: inline-block; width: 100px; height: 50px; border: 1px dashed #ccc; text-align: center; line-height: 50px; font-size: 0.8em; color: #999;">SVG (No Alt)</span>`;
			imageHtml += `</div>`;

			let infoParts = [];
			if (data.type) infoParts.push(`유형: ${data.type}`);
			if (data.ariaLabel) {
				infoParts.push(`aria-label="${escapeHTML(data.ariaLabel)}"`);
			}
			infoParts.push('명확한 위반');
			let infoText = infoParts.join(' | ');

			addReviewItem(reviewItems, svgEl, 'svg', {
				id: 'kact-5.1.1-violation-svg-missing-alt',
				impact: 'critical',
				tags: ['kwcag', 'kwcag-5.1.1', 'violation'],
				description: `[5.1.1 대체 텍스트 제공] 검사 대상: <svg> 요소. 대체 텍스트가 없습니다.`,
				help: `<svg> 요소에는 <title>, <desc>, aria-label, aria-labelledby 속성을 사용하여 대체 텍스트를 제공해야 합니다.`,
				helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=5.1.1`,
				nodes: [{
					target: [getSelector(svgEl)],
					html: svgEl.outerHTML.substring(0, Math.min(svgEl.outerHTML.indexOf('>') + 1, 250)) + (svgEl.outerHTML.length > 250 ? '...>' : ''),
					failureSummary: `<svg> 요소에 대체 텍스트가 누락되었습니다.`,
					any: [], all: [], none: [],
					imageHtml: imageHtml,
					infoText: infoText,
					elementSelector: getSelector(svgEl),
					rawElementOuterHTML: svgEl.outerHTML,
					kwcagDisplayData: data
				}],
				kwcag: { id: '5.1.1', title: '대체 텍스트 제공', link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=5.1.1` }
			});
		}
	}
}
