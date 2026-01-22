// 总系统主文件 - 处理页面切换和基本功能
// 完全不依赖Supabase，确保公开网站正常访问

// DOM元素
const pages = document.querySelectorAll('.page');

// 页面切换函数
function showPage(pageId) {
    // 隐藏所有页面
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // 显示指定页面
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

// 初始化事件监听器
function initEventListeners() {
    console.log('初始化总系统事件监听器...');
    
    // 主导航栏事件 - 优先绑定，确保页面切换功能正常
    document.querySelectorAll('.nav-menu .nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = item.getAttribute('data-page');
            console.log(`切换到页面: ${pageId}`);
            showPage(pageId);
            
            // 更新导航状态
            document.querySelectorAll('.nav-menu .nav-item').forEach(nav => {
                nav.classList.remove('active');
            });
            item.classList.add('active');
        });
    });
    
    console.log('初始化荣誉公示标签切换...');
    // 荣誉公示标签切换 - 优先绑定
    document.querySelectorAll('.honors-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = btn.getAttribute('data-tab');
            
            // 更新标签按钮状态
            document.querySelectorAll('.honors-tabs .tab-btn').forEach(tabBtn => {
                tabBtn.classList.remove('active');
            });
            btn.classList.add('active');
            
            // 更新内容显示
            document.querySelectorAll('.honors-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // 图书馆入口 - 单独处理，避免依赖图书馆系统
    document.getElementById('enter-library-btn')?.addEventListener('click', () => {
        showPage('library-entry');
    });
    
    // 图书馆入口页面功能
    document.getElementById('enter-student-library')?.addEventListener('click', () => {
        showPage('student-home');
    });
    
    document.getElementById('enter-admin-library')?.addEventListener('click', () => {
        showPage('admin-login-page');
    });
    
    document.getElementById('back-to-main-btn')?.addEventListener('click', () => {
        showPage('home');
        // 更新导航状态
        document.querySelectorAll('.nav-menu .nav-item').forEach(nav => {
            nav.classList.remove('active');
        });
        document.querySelector('.nav-menu .nav-item[data-page="home"]')?.classList.add('active');
    });
    
    // 返回按钮事件监听器 - 修复返回键无法返回的问题
    // 借书页面返回按钮
    document.getElementById('back-to-home')?.addEventListener('click', () => {
        showPage('student-home');
    });
    
    // 还书页面返回按钮
    document.getElementById('return-back')?.addEventListener('click', () => {
        showPage('student-home');
    });
    
    // 搜索页面返回按钮
    document.getElementById('search-back')?.addEventListener('click', () => {
        showPage('student-home');
    });
    
    // 图书馆页面返回按钮
    document.getElementById('back-to-student-home')?.addEventListener('click', () => {
        showPage('student-home');
    });
    
    // 管理员登录页面返回按钮
    document.getElementById('back-to-home-btn')?.addEventListener('click', () => {
        showPage('home');
    });
    
    console.log('总系统事件监听器初始化完成');
}

// 导航栏滚动效果
function initScrollEffects() {
    window.addEventListener('scroll', () => {
        const mainNav = document.querySelector('.main-nav');
        if (window.scrollY > 50) {
            mainNav.classList.add('scrolled');
        } else {
            mainNav.classList.remove('scrolled');
        }
    });
}

// 初始化总系统
function initMainSystem() {
    console.log('开始初始化总系统...');
    
    // 初始化事件监听器
    initEventListeners();
    
    // 初始化滚动效果
    initScrollEffects();
    
    console.log('总系统初始化完成！');
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMainSystem);
} else {
    initMainSystem();
}
