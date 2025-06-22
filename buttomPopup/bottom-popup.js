// 创建弹窗主函数
function createPopup(content, options = {}) {
  const {
    title = '提示',
    maskClosable = true,
    animationDuration = 300
  } = options;
  
  // 创建遮罩层
  const mask = document.createElement('div');
  mask.className = 'popup-mask';
  mask.style.transitionDuration = `${animationDuration}ms`;
  
  // 创建弹窗内容容器
  const popup = document.createElement('div');
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  popup.className = `popup-content ${isMobile ? 'mobile' : 'desktop'}`;
  
  // 弹窗内容
  popup.innerHTML = `
    <div class="popup-header">
      <h3 class="popup-title">${title}</h3>
      <button class="popup-close-btn">
        <svg viewBox="0 0 24 24">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
    <div class="popup-inner">${content}</div>
  `;
  
  document.body.appendChild(mask);
  document.body.appendChild(popup);
  
  // 添加遮罩层激活状态
  setTimeout(() => {
    mask.classList.add('active');
    popup.classList.add('active');
  }, 10);
  
  // 关闭按钮事件
  const closeBtn = popup.querySelector('.popup-close-btn');
  closeBtn.addEventListener('click', closePopup);
  
  // 遮罩层点击事件
  if (maskClosable) {
    mask.addEventListener('click', closePopup);
  }
  
  // 移动端触摸关闭事件
  if (isMobile) {
    initTouchEvents(popup, closePopup);
  }
  
  // 键盘事件
  document.addEventListener('keydown', handleEscape);
  
  // 关闭功能
  function closePopup() {
    popup.classList.remove('active');
    mask.classList.remove('active');
    
    setTimeout(() => {
      document.body.removeChild(popup);
      document.body.removeChild(mask);
      document.removeEventListener('keydown', handleEscape);
    }, animationDuration);
  }
  
  function handleEscape(e) {
    if (e.key === 'Escape') closePopup();
  }
  
  // 返回控制对象
  return {
    close: closePopup
  };
}

// 移动端触摸事件处理
function initTouchEvents(element, closeCallback) {
  let startY = 0;
  let currentY = 0;
  let moving = false;
  let startTime = 0;
  
  element.addEventListener('touchstart', e => {
    if (element.scrollTop > 0) return;
    
    startY = e.touches[0].clientY;
    currentY = startY;
    moving = true;
    startTime = Date.now();
    
    // 重置位置转换效果
    element.style.transition = 'none';
  }, { passive: true });
  
  element.addEventListener('touchmove', e => {
    if (!moving) return;
    
    const clientY = e.touches[0].clientY;
    const diff = clientY - currentY;
    
    // 只允许向下滑动
    if (diff > 0) {
      const progress = diff / window.innerHeight;
      const translateY = Math.min(progress * 100, 25);
      element.style.transform = `translateY(${translateY}%)`;
      element.style.opacity = 1 - (translateY / 50);
    }
    
    currentY = clientY;
  }, { passive: true });
  
  element.addEventListener('touchend', () => {
    if (!moving) return;
    moving = false;
    
    const duration = Date.now() - startTime;
    const distance = currentY - startY;
    const velocity = distance / duration;
    
    // 恢复转换效果
    element.style.transition = '';
    
    if (distance > 100 || (velocity > 0.5 && distance > 40)) {
      closeCallback();
    } else {
      // 还原位置
      element.style.transform = '';
      element.style.opacity = '';
    }
  }, { passive: true });
  
  // 防止触摸穿透
  element.addEventListener('touchmove', e => {
    if (element.scrollTop <= 0 && e.cancelable) {
      e.preventDefault();
    }
  }, { passive: false });
}
