class KWCAGOverlay {
  constructor() {
    this.element = null;
    this.visible = false;
    // initialize()는 외부에서 호출하거나, DOM이 준비된 후 호출하도록 변경 가능
  }


  initialize() {
    this.create();
    this.attachEventListeners();
  }

  create() {
    this.element = document.createElement('div');
    this.element.id = 'kwcag-checker-overlay';
    this.element.innerHTML = `
      <div class="overlay-header">
        <h1>KWCAG 2.2 검사 결과</h1>
        <button class="close-button" aria-label="닫기">×</button>
      </div>
      <div class="overlay-content">
        <div class="summary"></div>
        <div class="results"></div>
      </div>
    `;

    this.applyStyles();
    document.body.appendChild(this.element);
  }

  applyStyles() {
    const styles = {
      container: {
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '400px',
        maxHeight: 'calc(100vh - 40px)',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        zIndex: '2147483647',
        display: 'none',
        overflow: 'hidden',
        border: '1px solid #e0e0e0'
      },
      header: {
        padding: '15px 20px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f9fa'
      },
      content: {
        padding: '20px',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 140px)'
      }
    };

    Object.assign(this.element.style, styles.container);
    const headerEl = this.element.querySelector('.overlay-header');
    Object.assign(headerEl.style, styles.header);
    const contentEl = this.element.querySelector('.overlay-content');
    Object.assign(contentEl.style, styles.content);
  }

  attachEventListeners() {
    this.element.querySelector('.close-button').addEventListener('click', () => {
      this.hide();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.visible) {
        this.hide();
      }
    });
  }

  show() {
    this.element.style.display = 'block';
    this.visible = true;
  }

  hide() {
    this.element.style.display = 'none';
    this.visible = false;
  }

  updateResults(results) {
    const summaryEl = this.element.querySelector('.summary');
    const resultsEl = this.element.querySelector('.results');

    summaryEl.innerHTML = this.createSummaryHTML(results);
    resultsEl.innerHTML = this.createResultsHTML(results);

    // "문제 요소 보기" 버튼에 대한 이벤트 리스너는 이 Overlay를 사용하는 곳에서 설정하는 것이
    // Overlay 컴포넌트의 재사용성을 높일 수 있습니다.
    // 예: content.js에서 overlay.updateResults() 호출 후,
    // overlay.element.querySelectorAll('.show-elements').forEach(btn => btn.addEventListener(...));
    // 또는, 생성자나 별도 메소드를 통해 highlight 콜백 함수를 전달받아 내부에서 설정할 수도 있습니다.
    this.element.querySelectorAll('.show-elements').forEach(button => {
      button.addEventListener('click', this.handleShowElementsClick.bind(this));
    });
  }

  createSummaryHTML(results) {
    return `
      <h2>검사 요약</h2>
      <p>발견된 접근성 문제: ${results.violations.length}개</p>
    `;
  }

  createResultsHTML(results) {
    if (!results.violations.length) {
      return '<p>발견된 접근성 문제가 없습니다.</p>';
    }

    return `
      <h2>상세 결과</h2>
      <ul class="violations-list">
        ${results.violations.map(violation => this.createViolationHTML(violation)).join('')}
      </ul>
    `;
  }

  createViolationHTML(violation) {
    return `
      <li class="violation-item">
        <h3>${violation.kwcag ? violation.kwcag.title : violation.help}</h3>
        <p class="impact ${violation.impact}">${violation.impact}</p>
        <p>${violation.description}</p>
        <button class="show-elements" data-selectors='${escapeHTML(JSON.stringify(violation.nodes.map(node => node.target)))}'>
          문제 요소 보기 (${violation.nodes.length}개)
        </button>
      </li>
    `;
  }

  // "문제 요소 보기" 버튼 클릭 핸들러
  handleShowElementsClick(event) {
    const selectors = JSON.parse(event.target.dataset.selectors);
    // content.js에 highlight 요청 메시지 전송
    // 이 부분은 KWCAGOverlay가 content.js의 일부로 직접 함수를 호출하거나,
    // content.js가 이벤트를 구독하는 방식으로 변경될 수 있습니다.
    // 현재는 메시지 전송 방식을 가정합니다.
    chrome.runtime.sendMessage({ action: "highlightElement", selectors: selectors });
  }
}

// export default KWCAGOverlay; // ES6 모듈을 사용하는 경우
// 전역 스코프에 할당하려면: window.KWCAGOverlay = KWCAGOverlay;
// 또는 content.js에서 직접 이 파일을 로드하여 사용합니다.
