// /Users/hj/Sites/a11y/act-kwacg/lib/kwcag-5.1.1.js
/**
 * KWCAG 5.1.1: 대체 텍스트 제공
 * 텍스트 아닌 콘텐츠에는 그 의미나 용도를 인식할 수 있도록 대체 텍스트를 제공해야 한다.
 */

import { checkImg } from './kact22-5.1.1-img.js';
import { checkInputImage } from './kact22-5.1.1-input-image.js';
import { checkArea } from './kact22-5.1.1-area.js';
import { checkSvg } from './kact22-5.1.1-svg.js';
import { checkObjectEmbed } from './kact22-5.1.1-object-embed.js';
import { checkBackgroundImage } from './kact22-5.1.1-background-image.js';
import { checkViolations } from './kact22-5.1.1-violations.js';

// 공통 함수들 (이 파일에 유지)
export const getSelector = (element) => {
    // 입력 element의 유효성 확인
    if (!element || typeof element.nodeType === 'undefined') {
        return '유효하지 않은 요소'; // 또는 다른 적절한 값 반환
    }

	if (element.id) {
		// ID에 특수문자가 포함될 경우를 대비하여 escape 처리
		const escapedId = element.id.replace(/(:|\.|\[|\]|,|=|@)/g, '\\$1');
		try {
			// 생성된 선택자가 실제로 요소를 유일하게 선택하는지 확인 (선택 사항)
			if (document.querySelectorAll(`#${escapedId}`).length === 1) {
				return `#${escapedId}`;
			}
		} catch (e) {
			// 유효하지 않은 선택자 생성 시 오류 무시하고 다음 로직으로
		}
	}

	// axe-core의 선택자 생성 방식과 유사하게 좀 더 견고한 선택자 생성 시도
	let path = '';
	let currentElement = element;
	while (currentElement && currentElement.nodeType === Node.ELEMENT_NODE) {
        // currentElement의 nodeName 유효성 확인
        if (!currentElement.nodeName) {
            break; // nodeName이 없으면 루프 중단
        }
		let selector = currentElement.nodeName.toLowerCase();
		if (currentElement.id) {
			const escapedId = currentElement.id.replace(/(:|\.|\[|\]|,|=|@)/g, '\\$1');
			selector += `#${escapedId}`;
			path = selector + (path ? ' > ' + path : '');
			// ID가 고유하면 여기서 중단하고 반환 시도 (최상위 문서 기준)
			try {
				if (document.querySelectorAll(path).length === 1) return path;
			} catch (e) { /* ignore */ }

		} else {
			let sibling = currentElement;
			let nth = 1;
			while (sibling = sibling.previousElementSibling) {
                // sibling의 nodeName 유효성 확인
                if (!sibling.nodeName) {
                    break; // nodeName이 없으면 루프 중단
                }
				if (sibling.nodeName.toLowerCase() === selector.split(':')[0]) nth++; // :nth-of-type 고려
			}
            // currentElement.parentNode의 유효성 확인 및 children 순회 시 nodeName 유효성 확인
			if (currentElement.parentNode && Array.from(currentElement.parentNode.children).filter(el => el.nodeName && el.nodeName.toLowerCase() === selector.split(':')[0]).length > 1) {
				selector += `:nth-of-type(${nth})`;
			}
		}
		path = selector + (path ? ' > ' + path : '');
		currentElement = currentElement.parentNode;
		if (currentElement === document.body || currentElement === document.documentElement) break;
	}
    // 최종 반환 전에 element의 tagName 유효성 확인
	return path ? (document.body.contains(element) ? (path.startsWith('body > ') ? path : 'body > ' + path) : path) : (element && element.tagName ? element.tagName.toLowerCase() : '유효하지 않은 요소');
};

export const escapeHTML = (str) => {
	if (typeof str !== 'string') return '';
	const div = document.createElement('div');
	div.appendChild(document.createTextNode(str));
	return div.innerHTML;
};

// content.js에 정의된 imageUrlToBase64 함수를 사용하기 위해 전역 스코프에 있다고 가정
// 실제 환경에서는 메시지 통신 등을 통해 호출해야 할 수 있습니다.
// 여기서는 편의상 전역 함수로 가정합니다.
let _imageUrlToBase64 = window.imageUrlToBase64;
if (!_imageUrlToBase64) {
    _imageUrlToBase64 = async (url) => {
        return null;
    };
}
export const imageUrlToBase64 = _imageUrlToBase64;

// reviewItems 배열을 매개변수로 받도록 수정
export const addReviewItem = (reviewItems, element, type, data = {}) => {
	const selector = getSelector(element); // 제거된 라인 다시 추가
	// failureSummary는 더 이상 출력에 직접 사용되지 않지만, 디버깅 등을 위해 유지할 수 있습니다.
	let failureSummary = `유형: ${type}`;
	if (data.src) failureSummary += `, 소스: ${data.src.substring(0, 100)}${data.src.length > 100 ? '...' : ''}`;
	if (data.altText !== undefined && data.altText !== null) failureSummary += `, Alt: "${data.altText}"`;
	if (data.ariaLabel) failureSummary += `, ARIA Label: "${data.ariaLabel}"`;
	if (data.svgTitle) failureSummary += `, SVG Title: "${data.svgTitle}"`;
	if (data.isDecorative) failureSummary += ` (장식용으로 판단됨)`;

	let htmlSnippet = '';
	try {
		htmlSnippet = element.outerHTML ? element.outerHTML.substring(0, Math.min(element.outerHTML.indexOf('>') + 1, 250)) : 'N/A';
		if (element.outerHTML && element.outerHTML.length > 250) htmlSnippet += '...>';
	} catch (e) {
		htmlSnippet = 'HTML 가져오기 오류';
	}

	// 실제 이미지 표시 HTML 생성
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
	imageHtml += `</div>`; // .kwcag-display-image 끝

	// 정보 조합 및 텍스트 문자열 생성
	let infoParts = [];
	if (type) infoParts.push(`유형: ${type}`); // data.type 대신 매개변수 type 사용
	if (data.altText !== undefined && data.altText !== null) {
		infoParts.push(`alt="${escapeHTML(data.altText)}"`);
	} else if (data.ariaLabel) {
		infoParts.push(`aria-label="${escapeHTML(data.ariaLabel)}"`);
	} else if (data.svgTitle) {
		infoParts.push(`title 요소: "${escapeHTML(data.svgTitle)}"`);
	} else {
		infoParts.push(`alt/aria-label/title 없음`);
	}

	// 위반 여부 추가 (needsManualCheck 기반)
	let violationStatus = '위반 여부 정보 없음';
	if (data.needsManualCheck) {
		violationStatus = '내용 점검 필요'; // 텍스트 변경
	} else {
		violationStatus = '명확한 위반'; // violations.js에서 호출될 경우
	}
	infoParts.push(violationStatus);

	// 소스 정보는 마지막에 추가 (Base64가 없을 때만)
	if (!data.base64Image && data.src) {
		infoParts.push(`소스: ${escapeHTML(data.src.substring(0, 100))}${data.src.length > 100 ? '...' : ''}`);
	}


	let infoText = infoParts.join(' | ');


	// displayHtml 대신 imageHtml과 infoText를 nodes 객체에 추가
	reviewItems.push({ // reviewItems 배열에 직접 push
		id: `kact-5.1.1-review-${type}-${Math.random().toString(36).substr(2, 9)}`, // 고유 ID 생성
		impact: data.needsManualCheck ? 'info' : 'critical', // manualCheck 여부에 따라 impact 결정
		tags: ['kwcag', 'kwcag-5.1.1', data.needsManualCheck ? 'manual-review' : 'violation', 'image-alt-review', `review-${type}`],
		description: data.needsManualCheck ?
			`[5.1.1 대체 텍스트 제공] 검사 대상: ${type} 요소. 대체 텍스트 내용을 점검해야 합니다.` : // 텍스트 변경
			`[5.1.1 대체 텍스트 제공] 검사 대상: ${type} 요소. alt 속성이 없습니다.`, // 위반 메시지
		help: data.needsManualCheck ?
			`이 ${type} 콘텐츠에 대해 제공된 대체 텍스트(있는 경우)가 콘텐츠의 의미나 기능을 적절히 설명하는지, 또는 장식용인 경우 올바르게 처리되었는지 확인하십시오.` :
			`모든 ${type} 요소에는 콘텐츠를 설명하는 alt 속성을 제공하거나, 장식용 이미지인 경우 alt=""로 지정해야 합니다.`, // 위반 도움말
		helpUrl: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=5.1.1`,
		nodes: [{
			target: [selector],
			html: htmlSnippet, // 기존 html snippet 유지
			failureSummary: failureSummary, // 기존 failureSummary 유지
			any: [],
			all: [],
			none: [],
			// 생성된 HTML 문자열 대신 데이터 속성 추가
			imageHtml: imageHtml, // 이미지 HTML
			infoText: infoText, // 정보 텍스트
			// panel.js에서 필요한 데이터도 함께 전달 (요소 보기 버튼 등)
			elementSelector: selector,
			rawElementOuterHTML: element.outerHTML,
			kwcagDisplayData: data // 원본 데이터도 함께 전달
		}],
		kwcag: { id: '5.1.1', title: '대체 텍스트 제공', link: `https://www.wah.or.kr/board/boardview.asp?brd_sn=10&brd_group_sn=2&brd_depth=1&brd_parent_sn=0&brd_id=KWCAG2.2&search_field=title&search_value=5.1.1` }
	});
};


export default {
	id: 'kact-rule-5.1.1', // KACT 사용자 정의 규칙임을 명시적으로 나타내는 ID로 변경
	kwcagId: '5.1.1',  // 관련 KWCAG 항목 ID
	title: '대체 텍스트 제공',
	description: '텍스트 아닌 콘텐츠의 대체 텍스트 제공 여부와 적절성을 검토합니다. (KWCAG 5.1.1)',
	tags: ['kwcag', 'kwcag-5.1.1', 'wcag111'], // 관련 태그 (예: WCAG 1.1.1 매핑)

	/**
	 * KWCAG 5.1.1 준수 여부를 검사하고 검토할 이미지 목록을 반환합니다.
	 * @param {Document} document 검사할 HTML 문서 객체
	 * @param {Object} options 추가 옵션 (필요시 사용)
	 * @returns {Promise<Array<Object>>} 검토 항목 및 명확한 위반 사항 목록을 포함하는 Promise.
	 */
	check: async function(document, options = {}) { // check 함수를 async function으로 변경
		let reviewItems = [];

		// 분리된 각 검사 함수 호출
		await checkImg(document, reviewItems);
		await checkInputImage(document, reviewItems);
		await checkArea(document, reviewItems);
		await checkSvg(document, reviewItems);
		await checkObjectEmbed(document, reviewItems);
		await checkBackgroundImage(document, reviewItems);
		await checkViolations(document, reviewItems);

		return reviewItems;
	}
};
