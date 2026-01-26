// 注意：该文件现在作为普通脚本加载，不再是ES模块
// 移除了import语句，使用全局变量或直接引用

// 添加自我检查，防止重复执行
if (typeof window.appJsLoaded !== 'undefined') {
    console.log('app.js已加载，防止重复执行');
    // 直接退出，避免重复定义函数
    // 使用return语句退出脚本执行
    void(0);
} else {
    // 设置加载标志
    window.appJsLoaded = true;
    console.log('app.js开始执行，设置加载标志');
}

// 获取全局服务对象
const bookService = window.bookService;
const readerService = window.readerService;
const borrowRecordService = window.borrowRecordService;
const announcementService = window.announcementService;
const authService = window.authService;
const statsService = window.statsService;

// Supabase客户端已在supabase-config.js中初始化，直接使用全局对象
const appSupabase = window.supabaseInstance;

// 确保页面功能可用
console.log('Supabase初始化完成，页面功能仍可使用');

// 全局变量
let currentUser = null;
let isAdmin = false;
let currentPage = 'home';
let currentAdminPage = 'dashboard';

// 标志变量，用于避免事件监听器重复绑定
let studentButtonsBound = false;

// 数据存储 - 从Supabase获取
let announcements = [];
let books = [];
let readers = [];
let borrowRecords = [];

// DOM元素
const adminPages = document.querySelectorAll('.admin-page');
// 图书馆系统初始化
console.log('图书馆系统初始化中...');

// 定义图书馆事件监听器初始化函数 - 条件定义，防止重复声明
if (typeof initLibraryEventListeners !== 'function') {
    window.initLibraryEventListeners = function() {
        console.log('开始初始化图书馆事件监听器...');
        
        // 图书馆入口页面按钮事件
        const enterStudentLibraryBtn = document.getElementById('enter-student-library');
        if (enterStudentLibraryBtn) {
            enterStudentLibraryBtn.onclick = function() {
                console.log('学生入口按钮被点击');
                showPage('student-home');
            };
        }
        
        const enterAdminLibraryBtn = document.getElementById('enter-admin-library');
        if (enterAdminLibraryBtn) {
            enterAdminLibraryBtn.onclick = function() {
                console.log('管理员入口按钮被点击');
                showPage('admin-login-page');
            };
        }
        
        // 返回主系统按钮
        const backToMainBtn = document.getElementById('back-to-main-btn');
        if (backToMainBtn) {
            backToMainBtn.onclick = function() {
                console.log('返回主系统按钮被点击');
                showPage('home');
            };
        }
        
        // 学生主页面功能按钮事件
        bindStudentFunctionButtons();
        
        // 各种返回按钮事件
        const backToStudentHomeBtn = document.getElementById('back-to-student-home');
        if (backToStudentHomeBtn) {
            backToStudentHomeBtn.onclick = function() {
                console.log('返回学生主页面按钮被点击');
                showPage('student-home');
            };
        }
        
        const searchBackBtn = document.getElementById('search-back');
        if (searchBackBtn) {
            searchBackBtn.onclick = function() {
                console.log('搜索页面返回按钮被点击');
                showPage('student-home');
            };
        }
        
        const backToHomeBtn = document.getElementById('back-to-home');
        if (backToHomeBtn) {
            backToHomeBtn.onclick = function() {
                console.log('借书页面返回按钮被点击');
                showPage('student-home');
            };
        }
        
        const returnBackBtn = document.getElementById('return-back');
        if (returnBackBtn) {
            returnBackBtn.onclick = function() {
                console.log('还书页面返回按钮被点击');
                showPage('student-home');
            };
        }
        
        // 管理员登录按钮事件
        const adminLoginSubmitBtn = document.getElementById('admin-login-submit');
        if (adminLoginSubmitBtn) {
            adminLoginSubmitBtn.onclick = function() {
                console.log('管理员登录按钮被点击');
                adminLogin();
            };
        }
        
        // 返回首页按钮
        const backToHomePageBtn = document.getElementById('back-to-home-btn');
        if (backToHomePageBtn) {
            backToHomePageBtn.onclick = function() {
                console.log('管理员登录页面返回首页按钮被点击');
                showPage('library-entry');
            };
        }
        
        // 管理员退出按钮事件
        const adminLogoutBtn = document.getElementById('admin-logout');
        if (adminLogoutBtn) {
            adminLogoutBtn.onclick = function() {
                console.log('管理员退出按钮被点击');
                logout();
            };
        }
        
        // 确认借书按钮事件
        const confirmBorrowBtn = document.getElementById('confirm-borrow-btn');
        if (confirmBorrowBtn) {
            confirmBorrowBtn.onclick = function() {
                console.log('确认借书按钮被点击');
                confirmBorrow();
            };
        }
        
        // 确认还书按钮事件
        const confirmReturnBtn = document.getElementById('confirm-return-btn');
        if (confirmReturnBtn) {
            confirmReturnBtn.onclick = function() {
                console.log('确认还书按钮被点击');
                confirmReturn();
            };
        }
        
        console.log('图书馆事件监听器初始化完成');
    };
}

// initLibraryEventListeners函数已在条件语句中直接赋值给window对象，无需再次赋值

// 当app.js加载完成后，初始化图书馆系统功能
window.initLibrarySystem = async function() {
    console.log('图书馆系统初始化中...');
    // 初始化事件监听器
    try {
        initLibraryEventListeners();
        console.log('图书馆系统事件监听器初始化完成');
        
        // 初始化数据
        await initData();
        console.log('图书馆系统数据初始化完成');
    } catch (error) {
        console.error('初始化失败:', error);
    }
    console.log('图书馆系统初始化完成');
};

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initLibrarySystem);
} else {
    window.initLibrarySystem();
}

// 批量导入功能
async function handleBatchImport() {
    console.log('开始处理批量导入...');
    const fileInput = document.getElementById('batch-import-file');
    const useAiCheckbox = document.getElementById('use-ai-checkbox');
    const progressDiv = document.getElementById('batch-import-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('请选择一个CSV文件');
        return;
    }
    
    const file = fileInput.files[0];
    const useAI = useAiCheckbox.checked;
    
    // 显示进度条
    progressDiv.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = '0% 准备中...';
    
    try {
        // 读取文件
        const fileContent = await readFile(file);
        console.log('文件读取完成，开始解析CSV...');
        
        // 解析CSV
        const books = parseCSV(fileContent);
        console.log(`解析完成，共 ${books.length} 本书`);
        
        let processedBooks = books;
        
        // 如果启用AI处理
        if (useAI) {
            console.log('开始AI处理...');
            processedBooks = await processBooksWithAI(books, (progress) => {
                const percent = Math.round((progress / books.length) * 30) + 30; // AI处理占30%进度
                progressFill.style.width = `${percent}%`;
                progressText.textContent = `${percent}% AI处理中...`;
            });
            console.log('AI处理完成');
        } else {
            // 直接跳过AI处理，进度到60%
            progressFill.style.width = '60%';
            progressText.textContent = '60% 准备导入...';
        }
        
        // 批量添加图书
        console.log('开始批量添加图书...');
        const result = await addBooksBatch(processedBooks, (progress) => {
            const percent = Math.round((progress / processedBooks.length) * 40) + 60; // 添加图书占40%进度
            progressFill.style.width = `${percent}%`;
            progressText.textContent = `${percent}% 导入中...`;
        });
        
        // 完成
        progressFill.style.width = '100%';
        progressText.textContent = '100% 导入完成';
        
        // 重新从数据库加载图书数据，更新本地books数组
        console.log('刷新本地图书数据...');
        try {
            // 调用getAllBooks重新获取所有图书数据
            books = await bookService.getAllBooks();
            console.log('本地图书数据刷新成功，共', books.length, '本图书');
        } catch (error) {
            console.error('刷新本地图书数据失败:', error);
        }
        
        alert(`批量导入成功！共导入 ${result.success} 本图书，失败 ${result.failed} 本`);
        
        // 关闭模态框
        document.getElementById('batch-import-modal').style.display = 'none';
        
        // 刷新图书列表
        if (typeof initBookList === 'function') {
            initBookList();
        }
        
        // 重置文件输入
        fileInput.value = '';
        useAiCheckbox.checked = false;
        
    } catch (error) {
        console.error('批量导入失败:', error);
        alert(`批量导入失败: ${error.message}`);
        
        // 隐藏进度条
        progressDiv.style.display = 'none';
    }
}

// 读取文件
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        reader.onerror = (e) => {
            reject(new Error('文件读取失败'));
        };
        reader.readAsText(file, 'UTF-8');
    });
}

// 解析CSV
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const books = [];
    
    // 跳过表头
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const fields = line.split(',');
        if (fields.length < 7) {
            console.warn(`跳过无效行: ${line}`);
            continue;
        }
        
        const book = {
            number: fields[0].trim(),
            title: fields[1].trim(),
            author: fields[2].trim(),
            isbn: fields[3].trim(),
            category: fields[4].trim(),
            publisher: fields[5].trim(),
            quantity: parseInt(fields[6].trim()) || 1
        };
        
        books.push(book);
    }
    
    return books;
}

// 使用智谱AI处理图书
async function processBooksWithAI(books, progressCallback) {
    const processedBooks = [];
    const apiKey = '6cc5158bafbc44458e007a27825464be.NgsJybRTDD7KPMIA';
    
    for (let i = 0; i < books.length; i++) {
        const book = books[i];
        
        // 调用智谱AI API
        try {
            const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'glm-4',
                    messages: [
                        {
                            role: 'system',
                            content: '你是一个图书信息处理助手，请根据提供的图书信息，补充完整图书的详细信息，包括书名、作者、ISBN、分类、出版社、简介等。如果信息已经完整，请直接返回原始信息。'
                        },
                        {
                            role: 'user',
                            content: JSON.stringify(book)
                        }
                    ]
                })
            });
            
            const data = await response.json();
            
            if (data.choices && data.choices[0] && data.choices[0].message) {
                const aiContent = data.choices[0].message.content;
                try {
                    const aiBook = JSON.parse(aiContent);
                    processedBooks.push({ ...book, ...aiBook });
                } catch (parseError) {
                    console.warn(`AI返回的格式无效，使用原始数据: ${aiContent}`);
                    processedBooks.push(book);
                }
            } else {
                processedBooks.push(book);
            }
        } catch (error) {
            console.error(`AI处理失败，使用原始数据: ${error.message}`);
            processedBooks.push(book);
        }
        
        // 调用进度回调
        if (progressCallback) {
            progressCallback(i + 1);
        }
        
        // 避免请求过于频繁
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return processedBooks;
}

// 批量添加图书
async function addBooksBatch(books, progressCallback) {
    let success = 0;
    let failed = 0;
    
    for (let i = 0; i < books.length; i++) {
        const book = books[i];
        
        try {
            // 调整数据结构，确保使用数据库中实际存在的列名
            const bookData = {
                number: book.number,
                title: book.title,
                author: book.author,
                isbn: book.isbn,
                category: book.category,
                publisher: book.publisher,
                status: 'available',
                available: book.quantity || 1
            };
            
            // 检查ISBN是否已经存在
            const existingBook = await bookService.getBookByISBN(book.isbn);
            
            if (existingBook) {
                // ISBN已存在，更新现有图书的数量
                console.log(`图书${book.title}的ISBN已存在，更新数量`);
                await bookService.updateBook(existingBook.id, {
                    available: existingBook.available + (book.quantity || 1),
                    // 如果数据库中有quantity列，也需要更新
                    // quantity: existingBook.quantity + (book.quantity || 1)
                });
            } else {
                // ISBN不存在，添加新图书
                console.log(`添加新图书：${book.title}`);
                await bookService.addBook(bookData);
            }
            
            success++;
        } catch (error) {
            console.error(`添加图书失败: ${book.title}`, error);
            failed++;
        }
        
        // 调用进度回调
        if (progressCallback) {
            progressCallback(i + 1);
        }
    }
    
    return { success, failed };
}

// 重点修复：直接绑定到main.js的showPage函数，确保页面切换时能正确处理
if (typeof window.showPage === 'function') {
    // 保存原始showPage函数
    const originalShowPage = window.showPage;
    // 重写showPage函数，添加图书馆系统特定处理
    window.showPage = function(pageId) {
        // 调用原始showPage函数
        originalShowPage(pageId);
        
        // 如果切换到图书馆入口页面，确保事件监听器已绑定
        if (pageId === 'library-entry') {
            console.log('切换到图书馆入口页面，重新初始化事件监听器');
            setTimeout(() => {
                try {
                    initLibraryEventListeners();
                    console.log('图书馆入口页面事件监听器重新初始化完成');
                } catch (error) {
                    console.error('重新初始化事件监听器失败:', error);
                }
            }, 100);
        }
        
        // 如果切换到学生主页面，绑定学生功能按钮事件监听器
        if (pageId === 'student-home') {
            console.log('切换到学生主页面，绑定功能按钮事件监听器');
            setTimeout(() => {
                bindStudentFunctionButtons();
            }, 100);
            
            // 只在进入学生主页面时显示最新公告
            console.log(`切换到${pageId}页面，显示最新公告`);
            setTimeout(() => {
                try {
                    showLatestAnnouncements();
                } catch (error) {
                    console.error('显示公告失败:', error);
                }
            }, 200);
        }
        
        // 如果切换到借书页面，绑定确认借书按钮事件监听器
        if (pageId === 'borrow-page') {
            console.log('切换到借书页面，绑定确认借书按钮事件监听器');
            setTimeout(() => {
                try {
                    const confirmBorrowBtn = document.getElementById('confirm-borrow-btn');
                    if (confirmBorrowBtn) {
                        confirmBorrowBtn.onclick = function() {
                            console.log('确认借书按钮被点击');
                            confirmBorrow();
                        };
                        console.log('确认借书按钮事件监听器绑定成功');
                    }
                } catch (error) {
                    console.error('绑定确认借书按钮事件监听器失败:', error);
                }
            }, 100);
        }
    };
}

// 绑定学生功能按钮事件监听器 - 重点修复：直接绑定，确保可靠
function bindStudentFunctionButtons() {
    // 检查是否已经绑定过事件监听器
    if (studentButtonsBound) {
        console.log('学生功能按钮事件监听器已经绑定，跳过重复绑定');
        return;
    }
    
    console.log('开始绑定学生功能按钮事件监听器...');
    
    // 直接获取元素并绑定事件
    const borrowBtn = document.getElementById('borrow-btn');
    const returnBtn = document.getElementById('return-btn');
    const libraryBtn = document.getElementById('library-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (borrowBtn) {
        borrowBtn.onclick = function() {
            console.log('借书按钮被点击');
            if (typeof window.showPage === 'function') {
                window.showPage('borrow-page');
            }
        };
        console.log('借书按钮事件监听器绑定成功');
    } else {
        console.log('借书按钮未找到');
    }
    
    if (returnBtn) {
        returnBtn.onclick = function() {
            console.log('还书按钮被点击');
            if (typeof window.showPage === 'function') {
                window.showPage('return-page');
            }
        };
        console.log('还书按钮事件监听器绑定成功');
    } else {
        console.log('还书按钮未找到');
    }
    
    if (libraryBtn) {
        libraryBtn.onclick = function() {
            console.log('查看书库按钮被点击');
            // 使用原始的showLibraryPage函数
            showLibraryPage();
        };
        console.log('查看书库按钮事件监听器绑定成功');
    } else {
        console.log('查看书库按钮未找到');
    }
    
    if (logoutBtn) {
        logoutBtn.onclick = function() {
            console.log('退出登录按钮被点击');
            logout();
        };
        console.log('退出登录按钮事件监听器绑定成功');
    } else {
        console.log('退出登录按钮未找到');
    }
    
    // 标记为已绑定
    studentButtonsBound = true;
    console.log('学生功能按钮事件监听器绑定完成');
}

// 初始化数据
async function initData() {
    console.log('尝试初始化数据...');
    
    // 检查Supabase客户端是否已经正确初始化
    if (!appSupabase) {
        console.log('Supabase客户端未初始化，跳过数据加载');
        // 初始化空数组，避免系统崩溃
        announcements = [];
        books = [];
        readers = [];
        borrowRecords = [];
        return;
    }
    
    // 检查服务对象是否已经初始化
    if (!bookService) {
        console.log('bookService未初始化，跳过数据加载');
        return;
    }
    if (!readerService) {
        console.log('readerService未初始化，跳过数据加载');
        return;
    }
    if (!borrowRecordService) {
        console.log('borrowRecordService未初始化，跳过数据加载');
        return;
    }
    if (!announcementService) {
        console.log('announcementService未初始化，跳过数据加载');
        return;
    }
    
    try {
        // 从Supabase获取数据
        console.log('开始初始化数据...');
        announcements = await announcementService.getAllAnnouncements();
        console.log('公告数据加载成功');
        books = await bookService.getAllBooks();
        console.log('图书数据加载成功');
        readers = await readerService.getAllReaders();
        console.log('读者数据加载成功');
        borrowRecords = await borrowRecordService.getAllBorrowRecords();
        console.log('借阅记录数据加载成功');
        console.log('数据初始化成功');
        
        // 数据初始化完成后，显示最新公告
        showLatestAnnouncements();
    } catch (error) {
        console.error('初始化数据失败:', error);
        // 初始化空数组，避免系统崩溃
        announcements = [];
        books = [];
        readers = [];
        borrowRecords = [];
        
        // 检查是否是表不存在的错误
        if (error.code === 'PGRST205') {
            // 改为console.error，避免阻塞代码执行
            console.error('数据库表不存在，请先在Supabase控制台执行supabase-schema.sql脚本创建表结构。\n\n错误详情：', error);
        } else if (error.message.includes('Cannot read property') || error.message.includes('Cannot read properties')) {
            // 处理Supabase客户端未正确初始化的情况
            console.error('Supabase客户端未正确初始化，无法加载数据。请检查Supabase配置。\n\n错误详情：', error);
        } else {
            // 改为console.error，避免阻塞代码执行
            console.error('数据初始化失败，请检查网络连接或Supabase配置。\n\n错误详情：', error);
        }
    }
}

// 将initData函数暴露到全局作用域，以便在index.html中调用
window.initData = initData;



// 确保main.js的showPage函数可用
if (typeof showPage === 'function') {
    // 将main.js的showPage函数保存到全局作用域
    window.showPage = showPage;
}

// 显示最新公告
function showLatestAnnouncements() {
    const announcementModal = document.getElementById('announcement-modal');
    const announcementContent = document.getElementById('announcement-content');
    
    // 按发布日期降序排序公告
    const sortedAnnouncements = [...announcements].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 获取最新的3条公告
    const latestAnnouncements = sortedAnnouncements.slice(0, 3);
    
    if (latestAnnouncements.length > 0) {
        // 显示公告弹窗
        announcementModal.style.display = 'block';
        
        // 构建公告内容
        const announcementsHTML = latestAnnouncements.map(announcement => {
            const date = new Date(announcement.date).toLocaleDateString();
            return `
                <div class="announcement-item">
                    <div class="announcement-title">${announcement.title}</div>
                    <div class="announcement-date">发布日期：${date}</div>
                    <div class="announcement-text">${announcement.content}</div>
                </div>
            `;
        }).join('');
        
        announcementContent.innerHTML = announcementsHTML;
    } else {
        // 如果没有公告，不显示弹窗
        announcementModal.style.display = 'none';
    }
}

// 关闭公告
function closeAnnouncement() {
    const announcementModal = document.getElementById('announcement-modal');
    announcementModal.style.display = 'none';
}

function showAdminPage(pageId) {
    console.log('showAdminPage called with pageId:', pageId);
    if (!pageId) {
        console.warn('Invalid pageId, skipping showAdminPage');
        return;
    }
    
    // 确保adminPages和page都不为空
    if (adminPages && adminPages.length > 0) {
        adminPages.forEach(page => {
            if (page && page.classList) {
                page.classList.remove('active');
            }
        });
    }
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        if (targetPage.classList) {
            targetPage.classList.add('active');
        }
        currentAdminPage = pageId;
        
        // 更新导航状态
        const navItems = document.querySelectorAll('.nav-item');
        if (navItems) {
            navItems.forEach(item => {
                if (item && item.classList) {
                    item.classList.remove('active');
                }
            });
        }
        
        const targetNavItem = document.querySelector(`[data-page="${pageId}"]`);
        if (targetNavItem && targetNavItem.classList) {
            targetNavItem.classList.add('active');
        } else {
            console.warn(`Nav item with data-page="${pageId}" not found`);
        }
    } else {
        console.warn(`Page with id="${pageId}" not found`);
    }
    
    // 如果切换到图书管理页面，绑定添加图书、批量导入、导出报表按钮事件监听器，以及编辑图书模态框事件监听器
    if (pageId === 'books') {
        console.log('切换到图书管理页面，绑定添加图书、批量导入和导出报表按钮事件监听器');
        setTimeout(() => {
            // 绑定添加图书按钮事件
            const addBookBtn = document.querySelector('#books .btn-primary');
            if (addBookBtn) {
                addBookBtn.onclick = function() {
                    console.log('添加图书按钮被点击');
                    addBook();
                };
                console.log('添加图书按钮事件监听器绑定成功');
            }
            
            // 绑定批量导入按钮事件
            const batchImportBtn = document.querySelector('#books .btn-secondary');
            if (batchImportBtn) {
                batchImportBtn.onclick = function() {
                    console.log('批量导入按钮被点击');
                    // 打开批量导入模态框
                    document.getElementById('batch-import-modal').style.display = 'block';
                };
                console.log('批量导入按钮事件监听器绑定成功');
            }
            
            // 绑定批量导入模态框事件监听器
            // 关闭批量导入模态框按钮
            const closeBatchImportBtn = document.getElementById('close-batch-import-modal');
            if (closeBatchImportBtn) {
                closeBatchImportBtn.onclick = function() {
                    console.log('关闭批量导入模态框按钮被点击');
                    document.getElementById('batch-import-modal').style.display = 'none';
                };
                console.log('关闭批量导入模态框按钮事件监听器绑定成功');
            }
            
            // 取消批量导入按钮
            const cancelBatchImportBtn = document.getElementById('cancel-batch-import');
            if (cancelBatchImportBtn) {
                cancelBatchImportBtn.onclick = function() {
                    console.log('取消批量导入按钮被点击');
                    document.getElementById('batch-import-modal').style.display = 'none';
                };
                console.log('取消批量导入按钮事件监听器绑定成功');
            }
            
            // 确认批量导入按钮
            const confirmBatchImportBtn = document.getElementById('confirm-batch-import');
            if (confirmBatchImportBtn) {
                confirmBatchImportBtn.onclick = function() {
                    console.log('确认批量导入按钮被点击');
                    handleBatchImport();
                };
                console.log('确认批量导入按钮事件监听器绑定成功');
            }
            
            // 绑定导出报表按钮事件
            let exportBooksBtn = document.querySelector('#books .page-actions .btn-secondary');
            // 检查是否已经有导出报表按钮，如果没有则添加
            if (!exportBooksBtn || !exportBooksBtn.innerHTML.includes('导出报表')) {
                const booksPageHeader = document.querySelector('#books .page-header');
                if (booksPageHeader) {
                    const pageActions = booksPageHeader.querySelector('.page-actions');
                    if (pageActions) {
                        // 检查是否已经有导出报表按钮
                        const existingExportBtn = pageActions.querySelector('.btn-secondary:nth-last-child(1)');
                        if (!existingExportBtn || !existingExportBtn.innerHTML.includes('导出报表')) {
                            const newExportBtn = document.createElement('button');
                            newExportBtn.className = 'btn btn-secondary';
                            newExportBtn.innerHTML = '<i class="fas fa-download"></i> 导出报表';
                            newExportBtn.onclick = function() {
                                console.log('导出图书报表按钮被点击');
                                exportBooks();
                            };
                            pageActions.appendChild(newExportBtn);
                            exportBooksBtn = newExportBtn;
                            console.log('图书管理导出报表按钮创建并绑定成功');
                        }
                    }
                }
            } else {
                // 如果已经有导出报表按钮，重新绑定事件
                exportBooksBtn.onclick = null;
                exportBooksBtn.onclick = function() {
                    console.log('导出图书报表按钮被点击');
                    exportBooks();
                };
                console.log('导出图书报表按钮事件监听器绑定成功');
            }
            
            // 绑定添加图书模态框事件监听器
            console.log('绑定添加图书模态框事件监听器');
            
            // 关闭添加图书模态框按钮
            const closeAddModalBtn = document.getElementById('close-add-modal');
            if (closeAddModalBtn) {
                closeAddModalBtn.onclick = null;
                closeAddModalBtn.onclick = function() {
                    console.log('关闭添加图书模态框按钮被点击');
                    document.getElementById('add-book-modal').style.display = 'none';
                };
                console.log('关闭添加图书模态框按钮事件监听器绑定成功');
            }
            
            // 取消添加图书按钮
            const cancelAddBtn = document.getElementById('cancel-add-book');
            if (cancelAddBtn) {
                cancelAddBtn.onclick = null;
                cancelAddBtn.onclick = function() {
                    console.log('取消添加图书按钮被点击');
                    document.getElementById('add-book-modal').style.display = 'none';
                };
                console.log('取消添加图书按钮事件监听器绑定成功');
            }
            
            // 确认添加图书按钮
            const confirmAddBtn = document.getElementById('confirm-add-book');
            if (confirmAddBtn) {
                confirmAddBtn.onclick = null;
                confirmAddBtn.onclick = function() {
                    console.log('确认添加图书按钮被点击');
                    confirmAddBook();
                };
                console.log('确认添加图书按钮事件监听器绑定成功');
            }
            
            // 绑定编辑图书模态框事件监听器
            console.log('绑定编辑图书模态框事件监听器');
            
            // 关闭编辑图书模态框按钮
            const closeEditModalBtn = document.getElementById('close-edit-modal');
            if (closeEditModalBtn) {
                closeEditModalBtn.onclick = null;
                closeEditModalBtn.onclick = function() {
                    console.log('关闭编辑图书模态框按钮被点击');
                    document.getElementById('edit-book-modal').style.display = 'none';
                };
                console.log('关闭编辑图书模态框按钮事件监听器绑定成功');
            }
            
            // 取消编辑按钮
            const cancelEditBtn = document.getElementById('cancel-edit-book');
            if (cancelEditBtn) {
                cancelEditBtn.onclick = null;
                cancelEditBtn.onclick = function() {
                    console.log('取消编辑按钮被点击');
                    document.getElementById('edit-book-modal').style.display = 'none';
                };
                console.log('取消编辑按钮事件监听器绑定成功');
            }
            
            // 确认编辑按钮
            const confirmEditBtn = document.getElementById('confirm-edit-book');
            if (confirmEditBtn) {
                confirmEditBtn.onclick = null;
                confirmEditBtn.onclick = function() {
                    console.log('确认编辑按钮被点击');
                    confirmEditBook();
                };
                console.log('确认编辑按钮事件监听器绑定成功');
            }
            
            // 绑定搜索功能事件监听器
            console.log('绑定图书搜索功能事件监听器');
            const bookSearchInput = document.getElementById('book-search');
            const bookSearchBtn = document.querySelector('#books .btn-search');
            
            // 搜索图书的函数
            function searchBooks() {
                const searchTerm = bookSearchInput.value.toLowerCase().trim();
                console.log(`搜索图书: ${searchTerm}`);
                
                // 过滤图书列表
                const filteredBooks = searchTerm ? books.filter(book => 
                    book.title.toLowerCase().includes(searchTerm) || 
                    book.author.toLowerCase().includes(searchTerm) || 
                    book.isbn.toLowerCase().includes(searchTerm) ||
                    (book.number && book.number.toLowerCase().includes(searchTerm))
                ) : books;
                
                // 更新图书列表
                const bookList = document.getElementById('book-list');
                bookList.innerHTML = filteredBooks.map(book => `
                    <div class="book-management-item">
                        <div class="book-info">
                            <h4>${book.title}</h4>
                            ${book.number ? `<p>编号：${book.number}</p>` : ''}
                            <p>作者：${book.author}</p>
                            <p>ISBN：${book.isbn}</p>
                            <p>分类：${book.category}</p>
                            <p>出版社：${book.publisher}</p>
                        </div>
                        <div class="book-stats">
                            <p>状态：${book.status === 'in' ? '在馆' : '借出'}</p>
                            <p>可用：${book.available}</p>
                            <p>总数：${book.copies || book.available}</p>
                        </div>
                        <div class="book-actions">
                            <button class="btn btn-small btn-edit" data-book-id="${book.id}">编辑</button>
                            <button class="btn btn-small btn-delete" data-book-id="${book.id}">删除</button>
                        </div>
                    </div>
                `).join('');
                
                // 重新绑定事件委托处理编辑和删除按钮点击事件
                bookList.addEventListener('click', function(e) {
                    if (e.target.classList.contains('btn-edit')) {
                        const bookId = parseInt(e.target.getAttribute('data-book-id'));
                        editBook(bookId);
                    } else if (e.target.classList.contains('btn-delete')) {
                        const bookId = parseInt(e.target.getAttribute('data-book-id'));
                        deleteBook(bookId);
                    }
                });
            }
            
            // 绑定搜索按钮点击事件
            if (bookSearchBtn) {
                bookSearchBtn.onclick = searchBooks;
                console.log('图书搜索按钮事件监听器绑定成功');
            }
            
            // 绑定搜索输入框回车事件
            if (bookSearchInput) {
                bookSearchInput.onkeypress = function(e) {
                    if (e.key === 'Enter') {
                        searchBooks();
                    }
                };
                console.log('图书搜索输入框回车事件监听器绑定成功');
            }
        }, 100);
    }
    
    // 如果切换到读者管理页面，绑定导出报表按钮事件监听器
    if (pageId === 'readers') {
        console.log('切换到读者管理页面，绑定导出报表按钮事件监听器');
        setTimeout(() => {
            // 绑定导出报表按钮事件
            const exportReadersBtn = document.querySelector('#readers .btn-secondary');
            if (exportReadersBtn) {
                exportReadersBtn.onclick = function() {
                    console.log('导出读者报表按钮被点击');
                    exportReaders();
                };
                console.log('导出读者报表按钮事件监听器绑定成功');
            } else {
                // 如果没有导出报表按钮，添加一个
                const readersPageHeader = document.querySelector('#readers .page-header');
                if (readersPageHeader) {
                    const pageActions = readersPageHeader.querySelector('.page-actions');
                    if (!pageActions) {
                        // 创建page-actions容器
                        const newPageActions = document.createElement('div');
                        newPageActions.className = 'page-actions';
                        readersPageHeader.appendChild(newPageActions);
                        const newExportBtn = document.createElement('button');
                        newExportBtn.className = 'btn btn-secondary';
                        newExportBtn.innerHTML = '<i class="fas fa-download"></i> 导出报表';
                        newExportBtn.onclick = function() {
                            console.log('导出读者报表按钮被点击');
                            exportReaders();
                        };
                        newPageActions.appendChild(newExportBtn);
                        console.log('读者管理导出报表按钮创建并绑定成功');
                    }
                }
            }
        }, 100);
    }
}

// 学生登录
async function studentLogin() {
    const studentId = document.getElementById('student-id')?.value;
    const password = document.getElementById('password')?.value;
    
    if (studentId) {
        try {
            // 使用Supabase服务进行学生登录
            currentUser = await authService.studentLogin(studentId);
            showPage('student-home');
        } catch (error) {
            alert('登录失败: ' + error.message);
        }
    } else {
        alert('请输入学号');
    }
}

// 管理员登录
async function adminLogin() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    try {
        // 使用Supabase服务进行管理员登录
        const adminUser = await authService.adminLogin(username, password);
        currentUser = adminUser;
        isAdmin = true;
        showPage('admin-home');
        showAdminPage('dashboard');
        generateTextStats();
        initBookList();
        initReaderTree();
        initRecordsList();
        updateStats();
    } catch (error) {
        alert('登录失败: ' + error.message);
    }
}

// 退出登录
async function logout() {
    try {
        // 使用Supabase服务进行退出登录
        await authService.logout();
        currentUser = null;
        isAdmin = false;
        showPage('home');
        
        // 更新导航状态，确保首页导航项激活
        document.querySelectorAll('.nav-menu .nav-item').forEach(nav => {
            nav.classList.remove('active');
        });
        document.querySelector('.nav-menu .nav-item[data-page="home"]').classList.add('active');
    } catch (error) {
        console.error('退出登录失败:', error);
        // 即使Supabase退出登录失败，也重置本地状态
        currentUser = null;
        isAdmin = false;
        showPage('home');
        
        // 更新导航状态，确保首页导航项激活
        document.querySelectorAll('.nav-menu .nav-item').forEach(nav => {
            nav.classList.remove('active');
        });
        document.querySelector('.nav-menu .nav-item[data-page="home"]').classList.add('active');
    }
}

// 快速访问功能
function quickBorrow() {
    showPage('borrow-page');
}

function quickReturn() {
    showPage('return-page');
}

function searchBooks() {
    showPage('search-page');
}

// 学生书库功能
function showLibraryPage() {
    showPage('library-page');
    initLibrary();
}

function initLibrary() {
    // 初始化分类筛选器
    initCategoryFilter();
    // 显示所有图书
    displayBooks(books);
    // 添加事件监听
    document.getElementById('library-search-btn').addEventListener('click', performLibrarySearch);
    document.getElementById('library-search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performLibrarySearch();
        }
    });
    document.getElementById('category-filter').addEventListener('change', filterBooks);
    document.getElementById('availability-filter').addEventListener('change', filterBooks);
}

function initCategoryFilter() {
    const categoryFilter = document.getElementById('category-filter');
    // 获取所有唯一的分类
    const categories = [...new Set(books.map(book => book.category))];
    
    // 清空现有的选项（保留第一个"全部分类"）
    while (categoryFilter.children.length > 1) {
        categoryFilter.removeChild(categoryFilter.lastChild);
    }
    
    // 添加新的分类选项
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function performLibrarySearch() {
    filterBooks();
}

function filterBooks() {
    const searchTerm = document.getElementById('library-search-input').value.toLowerCase();
    const selectedCategory = document.getElementById('category-filter').value;
    const selectedAvailability = document.getElementById('availability-filter').value;
    
    let filteredBooks = books;
    
    // 搜索筛选
    if (searchTerm) {
        filteredBooks = filteredBooks.filter(book => 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.isbn.toLowerCase().includes(searchTerm) ||
            book.publisher.toLowerCase().includes(searchTerm)
        );
    }
    
    // 分类筛选
    if (selectedCategory !== 'all') {
        filteredBooks = filteredBooks.filter(book => book.category === selectedCategory);
    }
    
    // 可用性筛选
    if (selectedAvailability === 'available') {
        filteredBooks = filteredBooks.filter(book => book.available > 0);
    }
    
    // 显示筛选结果
    displayBooks(filteredBooks);
}

function displayBooks(booksToDisplay) {
    const booksList = document.getElementById('library-books-list');
    
    if (booksToDisplay.length === 0) {
        booksList.innerHTML = '<p style="text-align: center; color: #747d8c; margin-top: 50px; grid-column: 1 / -1;">未找到匹配的图书</p>';
        return;
    }
    
    booksList.innerHTML = booksToDisplay.map(book => `
        <div class="library-book-item">
            <h4>${book.title}</h4>
            <div class="book-info">
                ${book.number ? `<p><strong>编号：</strong>${book.number}</p>` : ''}
                <p><strong>作者：</strong>${book.author}</p>
                <p><strong>出版社：</strong>${book.publisher}</p>
                <p><strong>ISBN：</strong>${book.isbn}</p>
                <p><strong>分类：</strong>${book.category}</p>
                <p><strong>在馆数量：</strong>${book.available}/${book.copies}</p>
            </div>
            <span class="book-status ${book.available > 0 ? 'available' : 'unavailable'}">
                ${book.available > 0 ? '可借阅' : '已借完'}
            </span>
        </div>
    `).join('');
}

// 更新图书库显示（实时更新机制）
function updateLibraryDisplay() {
    if (document.getElementById('library-page').classList.contains('active')) {
        filterBooks();
    }
    // 同时更新分类筛选器
    initCategoryFilter();
}

// 图书搜索功能
function performBookSearch() {
    const searchTerm = document.getElementById('search-books-input').value.toLowerCase();
    const results = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.isbn.toLowerCase().includes(searchTerm)
    );
    
    const resultsContainer = document.getElementById('search-results');
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p style="text-align: center; color: #747d8c; margin-top: 50px;">未找到匹配的图书</p>';
        return;
    }
    
    resultsContainer.innerHTML = results.map(book => `
        <div class="book-item">
            <div class="book-info">
                <h4>${book.title}</h4>
                <p>作者：${book.author}</p>
                <p>ISBN：${book.isbn}</p>
                <p>分类：${book.category}</p>
            </div>
            <div class="book-status">
                <p>状态：${book.status === 'in' ? '在馆' : '借出'}</p>
                <p>可用数量：${book.available}</p>
                <p>总数量：${book.copies}</p>
            </div>
        </div>
    `).join('');
}

// 改进的借书功能
async function confirmBorrow() {
    const studentId = document.getElementById('borrow-student-id').value;
    const studentName = document.getElementById('borrow-student-name').value;
    const bookTitle = document.getElementById('borrow-book-title').value;
    const bookIsbn = document.getElementById('borrow-book-isbn').value;
    
    if (!studentId) {
        alert('请输入学号');
        return;
    }
    
    if (!studentName) {
        alert('请输入姓名');
        return;
    }
    
    if (!bookTitle && !bookIsbn) {
        alert('请输入书名或ISBN');
        return;
    }
    
    try {
        // 查找或创建学生
        let student = readers.find(r => r.id === studentId);
        if (!student) {
            // 创建新学生
            const newStudent = {
                id: studentId,
                name: studentName,
                borrow_count: 0,
                overdue_count: 0
            };
            
            // 保存到数据库
            await readerService.addReader(newStudent);
            
            // 添加到本地数据
            readers.push(newStudent);
            student = newStudent;
        }
        
        // 查找图书
        let book;
        if (bookIsbn) {
            book = books.find(b => b.isbn === bookIsbn && b.available > 0);
        } else {
            book = books.find(b => b.title.toLowerCase().includes(bookTitle.toLowerCase()) && b.available > 0);
        }
        
        if (!book) {
            alert('图书不存在或已借完');
            return;
        }
        
        // 检查借阅数量限制
        // 获取系统设置中的最大借阅数量
        const maxBorrowQuantity = parseInt(document.getElementById('max-borrow-quantity')?.value || 5);
        const currentBorrows = borrowRecords.filter(r => r.student_id === studentId && r.return_date === null);
        if (currentBorrows.length >= maxBorrowQuantity) {
            alert(`已达到最大借阅数量（${maxBorrowQuantity}本）`);
            return;
        }
        
        // 执行借阅
        book.available--;
        if (book.available === 0) {
            book.status = 'out';
        }
        
        const borrowDate = new Date().toISOString().split('T')[0];
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        
        // 使用Supabase服务保存数据
        // 1. 更新图书信息
        await bookService.updateBook(book.id, {
            available: book.available,
            status: book.status
        });
        
        // 2. 添加借阅记录
        const newRecord = {
            student_id: studentId,
            student_name: student.name,
            book_id: book.id,
            book_title: book.title,
            borrow_date: borrowDate,
            due_date: dueDate.toISOString().split('T')[0],
            return_date: null,
            status: 'borrowed'
        };
        await borrowRecordService.addBorrowRecord(newRecord);
        
        // 3. 更新读者借阅次数
        student.borrow_count++;
        await readerService.updateReader(studentId, {
            borrow_count: student.borrow_count
        });
        
        // 更新本地数据
        borrowRecords.push({
            ...newRecord,
            id: borrowRecords.length + 1
        });
        
        // 更新界面
        const bookPreview = document.getElementById('book-preview');
        bookPreview.innerHTML = `
            <div style="background: #e8f4f8; padding: 20px; border-radius: 10px; text-align: center;">
                <i class="fas fa-check-circle" style="font-size: 48px; color: #27ae60; margin-bottom: 15px;"></i>
                <h3>借阅成功！</h3>
                <p><strong>书名：</strong>${book.title}</p>
                <p><strong>作者：</strong>${book.author}</p>
                <p><strong>借阅人：</strong>${student.name}</p>
                <p><strong>学号：</strong>${student.id}</p>
                <p><strong>到期日期：</strong>${dueDate.toISOString().split('T')[0]}</p>
            </div>
        `;
        
        // 3秒后重置表单
        setTimeout(() => {
            bookPreview.innerHTML = '';
            document.getElementById('borrow-student-id').value = '';
            document.getElementById('borrow-student-name').value = '';
            document.getElementById('borrow-book-title').value = '';
            document.getElementById('borrow-book-isbn').value = '';
        }, 3000);
        
        // 刷新本地数据
        await initData();
        
        // 更新管理员界面数据
        if (isAdmin) {
            updateStats();
            generateTextStats();
            initBookList();
            initReaderTree();
            initRecordsList();
        }
        updateLibraryDisplay();
        
    } catch (error) {
        console.error('借阅失败:', error);
        alert('借阅失败，请稍后重试');
    }
}

// 改进的还书功能
async function confirmReturn() {
    const studentId = document.getElementById('return-student-id').value;
    const studentName = document.getElementById('return-student-name').value;
    const bookTitle = document.getElementById('return-book-title').value;
    const bookIsbn = document.getElementById('return-book-isbn').value;
    
    console.log('确认还书参数:', { studentId, studentName, bookTitle, bookIsbn });
    
    if (!studentId) {
        alert('请输入学号');
        return;
    }
    
    if (!studentName) {
        alert('请输入姓名');
        return;
    }
    
    if (!bookTitle && !bookIsbn) {
        alert('请输入书名或ISBN');
        return;
    }
    
    try {
        // 查找借阅记录
        console.log('当前借阅记录:', borrowRecords);
        
        // 先查找匹配的图书
        let matchingBooks = [];
        
        // 综合书名和ISBN进行匹配
        if (bookTitle && bookIsbn) {
            // 同时提供书名和ISBN，需要同时匹配
            matchingBooks = books.filter(book => 
                (book.title.toLowerCase().includes(bookTitle.toLowerCase()) || 
                 book.isbn === bookIsbn)
            );
        } else if (bookTitle) {
            // 只提供书名，模糊匹配
            matchingBooks = books.filter(book => 
                book.title.toLowerCase().includes(bookTitle.toLowerCase())
            );
        } else if (bookIsbn) {
            // 只提供ISBN，精确匹配
            matchingBooks = books.filter(book => 
                book.isbn === bookIsbn
            );
        }
        
        console.log('匹配的图书:', matchingBooks);
        
        // 提取匹配图书的ID
        const matchingBookIds = matchingBooks.map(book => book.id);
        
        // 查找借阅记录
        const record = borrowRecords.find(r => {
            const matchesStudentId = r.student_id === studentId;
            const matchesStudentName = r.student_name.toLowerCase().includes(studentName.toLowerCase());
            const matchesBookId = matchingBookIds.includes(r.book_id);
            const isBorrowed = r.return_date === null;
            
            console.log('检查借阅记录:', {
                record: r,
                matchesStudentId,
                matchesStudentName,
                matchesBookId,
                isBorrowed
            });
            
            return matchesStudentId && matchesStudentName && matchesBookId && isBorrowed;
        });
        
        console.log('找到的借阅记录:', record);
        
        if (!record) {
            alert('未找到该图书的借阅记录');
            return;
        }
        
        // 执行归还
        const book = books.find(b => b.id === record.book_id);
        if (book) {
            book.available++;
            if (book.status === 'out') {
                book.status = 'in';
            }
            
            const returnDate = new Date().toISOString().split('T')[0];
            
            // 使用Supabase服务保存数据
            // 1. 更新图书信息
            await bookService.updateBook(book.id, {
                available: book.available,
                status: book.status
            });
            
            // 2. 更新借阅记录
            await borrowRecordService.updateBorrowRecord(record.id, {
                return_date: returnDate,
                status: 'returned'
            });
            
            // 3. 更新读者借阅次数
            const student = readers.find(r => r.id === record.student_id);
            if (student) {
                student.borrow_count--;
                await readerService.updateReader(record.student_id, {
                    borrow_count: student.borrow_count
                });
            }
            
            // 更新本地数据
            record.return_date = returnDate;
            record.status = 'returned';
            
            // 检查是否逾期
            const dueDate = new Date(record.due_date);
            const isOverdue = new Date(returnDate) > dueDate;
            const overdueDays = isOverdue ? Math.floor((new Date(returnDate) - dueDate) / (1000 * 60 * 60 * 24)) : 0;
            
            // 更新界面显示
            const returnStatus = document.getElementById('return-status');
            returnStatus.innerHTML = `
                <div style="background: #e8f4f8; padding: 20px; border-radius: 10px; text-align: center;">
                    <i class="fas fa-check-circle" style="font-size: 48px; color: #27ae60; margin-bottom: 15px;"></i>
                    <h3>还书成功！</h3>
                    <p><strong>书名：</strong>${record.book_title}</p>
                    <p><strong>借阅人：</strong>${record.student_name}</p>
                    <p><strong>借阅日期：</strong>${record.borrow_date}</p>
                    <p><strong>到期日期：</strong>${record.due_date}</p>
                    <p><strong>归还日期：</strong>${record.return_date}</p>
                    ${isOverdue ? `<p style="color: #ff4757;">已逾期${overdueDays}天</p>` : ''}
                </div>
            `;
            
            // 3秒后重置表单
            setTimeout(() => {
                returnStatus.innerHTML = '';
                document.getElementById('return-student-id').value = '';
                document.getElementById('return-student-name').value = '';
                document.getElementById('return-book-title').value = '';
                document.getElementById('return-book-isbn').value = '';
            }, 3000);
            
            // 刷新本地数据
            await initData();
            
            // 更新管理员界面数据
            if (isAdmin) {
                updateStats();
                generateTextStats();
                initBookList();
                initReaderTree();
                initRecordsList();
            }
        } else {
            alert('未找到对应图书');
        }
    } catch (error) {
        console.error('还书失败:', error);
        alert('还书失败，请稍后重试');
    }
}



// 图书管理功能
function initBookList() {
    const bookList = document.getElementById('book-list');
    
    bookList.innerHTML = books.map(book => `
        <div class="book-management-item">
            <div class="book-info">
                <h4>${book.title}</h4>
                ${book.number ? `<p>编号：${book.number}</p>` : ''}
                <p>作者：${book.author}</p>
                <p>ISBN：${book.isbn}</p>
                <p>分类：${book.category}</p>
                <p>出版社：${book.publisher}</p>
            </div>
            <div class="book-stats">
                <p>状态：${book.status === 'in' ? '在馆' : '借出'}</p>
                <p>可用：${book.available}</p>
                <p>总数：${book.copies}</p>
            </div>
            <div class="book-actions">
                <button class="btn btn-small btn-edit" data-book-id="${book.id}">编辑</button>
                <button class="btn btn-small btn-delete" data-book-id="${book.id}">删除</button>
            </div>
        </div>
    `).join('');
    
    // 添加事件委托处理编辑和删除按钮点击事件
    bookList.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-edit')) {
            const bookId = parseInt(e.target.getAttribute('data-book-id'));
            editBook(bookId);
        } else if (e.target.classList.contains('btn-delete')) {
            const bookId = parseInt(e.target.getAttribute('data-book-id'));
            deleteBook(bookId);
        }
    });
}

function addBook() {
    // 打开添加图书模态框
    document.getElementById('add-book-modal').style.display = 'block';
}

async function confirmAddBook() {
    const number = parseInt(document.getElementById('add-book-number').value);
    const title = document.getElementById('add-book-title').value;
    const author = document.getElementById('add-book-author').value;
    const isbn = document.getElementById('add-book-isbn').value;
    const category = document.getElementById('add-book-category').value;
    const publisher = document.getElementById('add-book-publisher').value;
    const copies = parseInt(document.getElementById('add-book-copies').value);
    
    // 移除ISBN的必填验证，保留number的必填验证
    if (number && title && author && category && publisher && !isNaN(copies) && copies > 0 && !isNaN(number)) {
        try {
            // 使用Supabase服务添加图书
            const newBook = {
                number: number,
                title: title,
                author: author,
                isbn: isbn || '', // 允许空ISBN
                category: category,
                publisher: publisher,
                status: 'in',
                copies: copies,
                available: copies
            };
            
            const addedBook = await bookService.addBook(newBook);
            
            // 更新本地数据
            books.push(addedBook);
            
            // 刷新本地数据
            await initData();
            
            initBookList();
            updateStats();
            generateTextStats();
            updateLibraryDisplay();
            
            // 关闭模态框并重置表单
            document.getElementById('add-book-modal').style.display = 'none';
            document.getElementById('add-book-title').value = '';
            document.getElementById('add-book-author').value = '';
            document.getElementById('add-book-isbn').value = '';
            document.getElementById('add-book-category').value = '';
            document.getElementById('add-book-publisher').value = '';
            document.getElementById('add-book-copies').value = '';
            
            alert('图书添加成功');
        } catch (error) {
            console.error('添加图书失败:', error);
            alert('添加图书失败，请稍后重试');
        }
    } else {
        alert('请填写完整的图书信息！');
    }
}

function editBook(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;
    
    // 填充表单数据
    document.getElementById('edit-book-id').value = book.id;
    document.getElementById('edit-book-number').value = book.number || '';
    document.getElementById('edit-book-title').value = book.title;
    document.getElementById('edit-book-author').value = book.author;
    document.getElementById('edit-book-isbn').value = book.isbn;
    document.getElementById('edit-book-category').value = book.category;
    document.getElementById('edit-book-publisher').value = book.publisher;
    document.getElementById('edit-book-copies').value = book.copies;
    
    // 打开编辑图书模态框
    document.getElementById('edit-book-modal').style.display = 'block';
}

async function confirmEditBook() {
    const id = parseInt(document.getElementById('edit-book-id').value);
    const book = books.find(b => b.id === id);
    if (!book) return;
    
    const number = parseInt(document.getElementById('edit-book-number').value);
    const title = document.getElementById('edit-book-title').value;
    const author = document.getElementById('edit-book-author').value;
    const isbn = document.getElementById('edit-book-isbn').value;
    const category = document.getElementById('edit-book-category').value;
    const publisher = document.getElementById('edit-book-publisher').value;
    const copies = parseInt(document.getElementById('edit-book-copies').value);
    
    if (number && title && author && isbn && category && publisher && !isNaN(copies) && !isNaN(number)) {
        try {
            // 更新本地图书对象
            const updatedBook = {
                ...book,
                number: number,
                title: title,
                author: author,
                isbn: isbn,
                category: category,
                publisher: publisher,
                copies: copies,
                available: Math.min(book.available, copies)
            };
            
            // 使用Supabase服务更新图书信息
            await bookService.updateBook(id, updatedBook);
            
            // 更新本地数据
            Object.assign(book, updatedBook);
            
            initBookList();
            updateStats();
            updateLibraryDisplay();
            
            // 关闭模态框
            document.getElementById('edit-book-modal').style.display = 'none';
            
            alert('图书信息更新成功');
        } catch (error) {
            console.error('更新图书失败:', error);
            alert('更新图书失败，请稍后重试');
        }
    } else {
        alert('请填写完整的图书信息！');
    }
}

async function deleteBook(id) {
    if (confirm('确定要删除这本书吗？')) {
        try {
            // 使用Supabase服务删除图书
            await bookService.deleteBook(id);
            
            // 更新本地数据
            const index = books.findIndex(b => b.id === id);
            if (index !== -1) {
                books.splice(index, 1);
                // 删除相关借阅记录
                borrowRecords = borrowRecords.filter(r => r.bookId !== id);
                
                initBookList();
                initRecordsList();
                updateStats();
                updateLibraryDisplay();
                alert('图书删除成功');
            }
        } catch (error) {
            console.error('删除图书失败:', error);
            alert('删除图书失败，请稍后重试');
        }
    }
}

// 读者管理功能
function initReaderTree() {
    const readerTree = document.getElementById('reader-tree');
    const readerDetails = document.getElementById('reader-details');
    
    // 直接显示所有学生，按学号排序
    const sortedReaders = readers.sort((a, b) => a.id.localeCompare(b.id));
    
    readerTree.innerHTML = `
        <div class="student-list-container">
            <h3>所有学生</h3>
            <div class="student-list">
                ${sortedReaders.map(student => `
                    <div class="student-item" data-student-id="${student.id}">
                        ${student.name} (${student.id})
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // 默认显示第一个读者的详细信息
    if (readers.length > 0) {
        showReaderDetails(readers[0].id);
    }
    
    // 绑定事件监听器
    readerTree.querySelectorAll('.student-item').forEach(item => {
        item.addEventListener('click', () => {
            const studentId = item.getAttribute('data-student-id');
            showReaderDetails(studentId);
        });
    });
}

function showReaderDetails(studentId) {
    const student = readers.find(r => r.id === studentId);
    if (!student) return;
    
    const readerDetails = document.getElementById('reader-details');
    const studentBorrows = borrowRecords.filter(r => r.student_id === studentId);
    const currentBorrows = studentBorrows.filter(r => r.return_date === null);
    const historyBorrows = studentBorrows.filter(r => r.return_date !== null);
    
    readerDetails.innerHTML = `
        <div class="reader-info">
            <h3>${student.name}</h3>
            <p>学号：${student.id}</p>
            <p>当前借阅：${currentBorrows.length}本</p>
            <p>逾期次数：${student.overdue_count}次</p>
        </div>
        
        <div class="reader-borrows">
            <h4>当前借阅</h4>
            ${currentBorrows.length > 0 ? currentBorrows.map(record => `
                <div class="borrow-item">
                    <p>${record.book_title}</p>
                    <p>借阅日期：${record.borrow_date}</p>
                    <p>到期日期：${record.due_date}</p>
                </div>
            `).join('') : '<p>无当前借阅</p>'}
        </div>
        
        <div class="reader-borrows">
            <h4>历史借阅</h4>
            ${historyBorrows.length > 0 ? historyBorrows.slice(0, 5).map(record => `
                <div class="borrow-item">
                    <p>${record.book_title}</p>
                    <p>借阅日期：${record.borrow_date}</p>
                    <p>归还日期：${record.return_date}</p>
                </div>
            `).join('') : '<p>无历史借阅</p>'}
        </div>
    `;
}

// 导出借阅记录为CSV文件
function exportBorrowRecords() {
    // 确保borrowRecords是数组
    const records = Array.isArray(borrowRecords) ? borrowRecords : [];
    
    if (records.length === 0) {
        alert('没有可导出的借阅记录！');
        return;
    }
    
    // 生成CSV表头
    const headers = ['图书名称', '读者姓名', '学号', '借阅日期', '到期日期', '归还日期', '状态'];
    
    // 生成CSV数据行
    const rows = records.map(record => [
        record.book_title || '未知图书',
        record.student_name || '未知读者',
        record.student_id || '未知学号',
        record.borrow_date || '未知',
        record.due_date || '未知',
        record.return_date || '',
        record.status === 'borrowed' ? '借阅中' : record.status === 'returned' ? '已归还' : '逾期'
    ]);
    
    // 拼接CSV内容
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // 创建Blob对象并下载
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `借阅记录_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 导出图书数据为CSV文件
function exportBooks() {
    // 确保books是数组
    const bookList = Array.isArray(books) ? books : [];
    
    if (bookList.length === 0) {
        alert('没有可导出的图书数据！');
        return;
    }
    
    // 生成CSV表头
    const headers = ['书名', '作者', 'ISBN', '分类', '出版社', '状态', '可用数量', '总数量'];
    
    // 生成CSV数据行
    const rows = bookList.map(book => [
        book.title || '未知书名',
        book.author || '未知作者',
        book.isbn || '',
        book.category || '未分类',
        book.publisher || '未知出版社',
        book.status === 'in' ? '在馆' : '借出',
        book.available || 0,
        book.copies || 0
    ]);
    
    // 拼接CSV内容
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // 创建Blob对象并下载
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `图书数据_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 导出读者数据为CSV文件
function exportReaders() {
    // 确保readers是数组
    const readerList = Array.isArray(readers) ? readers : [];
    
    if (readerList.length === 0) {
        alert('没有可导出的读者数据！');
        return;
    }
    
    // 生成CSV表头
    const headers = ['学号', '姓名', '借阅次数', '逾期次数'];
    
    // 生成CSV数据行
    const rows = readerList.map(reader => [
        reader.id || '未知学号',
        reader.name || '未知姓名',
        reader.borrow_count || 0,
        reader.overdue_count || 0
    ]);
    
    // 拼接CSV内容
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // 创建Blob对象并下载
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `读者数据_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 借阅记录管理
function initRecordsList() {
    const recordsList = document.getElementById('records-list');
    
    // 确保borrowRecords是数组
    const records = Array.isArray(borrowRecords) ? borrowRecords : [];
    
    recordsList.innerHTML = records.map(record => `
        <div class="record-item">
            <div class="record-info">
                <p><strong>图书：</strong>${record.book_title || '未知图书'}</p>
                <p><strong>读者：</strong>${record.student_name || '未知读者'} (${record.student_id || '未知学号'})</p>
            </div>
            <div class="record-dates">
                <p><strong>借阅日期：</strong>${record.borrow_date || '未知'}</p>
                <p><strong>到期日期：</strong>${record.due_date || '未知'}</p>
                ${record.return_date ? `<p><strong>归还日期：</strong>${record.return_date}</p>` : ''}
            </div>
            <div class="record-status">
                <p class="status-${record.status}">${record.status === 'borrowed' ? '借阅中' : record.status === 'returned' ? '已归还' : '逾期'}</p>
            </div>
        </div>
    `).join('');
    
    // 添加导出报表按钮事件监听
    const exportButton = document.querySelector('#records .page-actions .btn-secondary');
    if (exportButton) {
        exportButton.addEventListener('click', exportBorrowRecords);
    }
}

// 批量导入功能

// 添加ISBN输入行
function addIsbnRow() {
    const container = document.getElementById('batch-import-items');
    const newRow = document.createElement('div');
    newRow.className = 'batch-import-item';
    newRow.innerHTML = `
        <input type="text" class="batch-isbn-input" placeholder="请输入ISBN号">
        <div class="batch-status">-</div>
        <button class="btn btn-small btn-search-isbn">搜索</button>
    `;
    container.appendChild(newRow);
    
    // 为新添加的搜索按钮添加事件监听
    const searchBtn = newRow.querySelector('.btn-search-isbn');
    searchBtn.addEventListener('click', function() {
        batchSearchISBN(this);
    });
}

// 批量搜索ISBN
async function batchSearchISBN(button) {
    const row = button.closest('.batch-import-item');
    const isbnInput = row.querySelector('.batch-isbn-input');
    const statusDiv = row.querySelector('.batch-status');
    const isbn = isbnInput.value.trim();
    
    if (!isbn) {
        statusDiv.textContent = '请输入ISBN';
        statusDiv.className = 'batch-status error';
        return;
    }
    
    // 防止重复点击
    button.disabled = true;
    statusDiv.textContent = '搜索中...';
    statusDiv.className = 'batch-status processing';
    
    try {
        // 调用智谱AI API查询图书信息
        const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 6cc5158bafbc44458e007a27825464be.NgsJybRTDD7KPMIA'
            },
            body: JSON.stringify({
                model: 'glm-4.5',
                messages: [
                    {
                        role: 'system',
                        content: `你是一个图书信息查询助手，请根据用户提供的ISBN号，返回该图书的详细信息。
                                请严格按照以下JSON格式返回，不要添加任何额外内容：
                                {
                                    "title": "图书标题",
                                    "author": "作者",
                                    "publisher": "出版社",
                                    "pubDate": "出版日期",
                                    "description": "图书描述",
                                    "price": "价格",
                                    "category": "分类"
                                }
                                如果无法查询到该ISBN对应的图书信息，请返回：{"error": "未找到该ISBN对应的图书信息"}`
                    },
                    {
                        role: 'user',
                        content: `请查询ISBN号为${isbn}的图书信息`
                    }
                ],
                temperature: 0.1,
                thinking: {
                    "type": "enabled"
                }
            })
        });
        
        const status = response.status;
        const data = await response.json();
        
        if (status === 200 && data.choices && data.choices.length > 0) {
            const aiResponse = data.choices[0].message.content;
            
            try {
                // 尝试解析JSON
                const bookInfo = JSON.parse(aiResponse);
                
                if (bookInfo.error) {
                    statusDiv.textContent = '查询失败';
                    statusDiv.className = 'batch-status error';
                } else {
                    // 将图书信息存储在data属性中
                    row.dataset.bookInfo = JSON.stringify(bookInfo);
                    statusDiv.textContent = '查询成功';
                    statusDiv.className = 'batch-status success';
                }
            } catch (e) {
                console.error('AI返回格式错误:', e, '原始响应:', aiResponse);
                statusDiv.textContent = '查询失败';
                statusDiv.className = 'batch-status error';
            }
        } else {
            statusDiv.textContent = '查询失败';
            statusDiv.className = 'batch-status error';
        }
    } catch (error) {
        console.error('搜索ISBN失败:', error);
        statusDiv.textContent = '查询失败';
        statusDiv.className = 'batch-status error';
    } finally {
        button.disabled = false;
        // 延迟1秒后才能再次点击
        setTimeout(() => {
            button.disabled = false;
        }, 1000);
    }
}

// 批量添加图书
async function batchAddBooks() {
    const rows = document.querySelectorAll('.batch-import-item');
    let successCount = 0;
    let errorCount = 0;
    
    for (const row of rows) {
        const isbnInput = row.querySelector('.batch-isbn-input');
        const statusDiv = row.querySelector('.batch-status');
        const isbn = isbnInput.value.trim();
        
        if (!isbn || statusDiv.textContent !== '查询成功') {
            continue;
        }
        
        // 获取存储在data属性中的图书信息
        const bookInfoStr = row.dataset.bookInfo;
        if (!bookInfoStr) {
            statusDiv.textContent = '缺少图书信息';
            statusDiv.className = 'batch-status error';
            errorCount++;
            continue;
        }
        
        try {
            const bookInfo = JSON.parse(bookInfoStr);
            
            // 准备添加图书的数据
            const newBook = {
                title: bookInfo.title || '未知书名',
                author: bookInfo.author || '未知作者',
                isbn: isbn,
                category: bookInfo.category || '未分类',
                publisher: bookInfo.publisher || '未知出版社',
                status: 'in',
                copies: 1, // 默认总数量为1
                available: 1 // 默认可用数量为1
            };
            
            // 使用Supabase服务添加图书
            const addedBook = await bookService.addBook(newBook);
            
            // 更新本地数据
            books.push(addedBook);
            
            // 刷新本地数据
            await initData();
            
            // 刷新图书列表
            initBookList();
            updateStats();
            generateTextStats();
            updateLibraryDisplay();
            
            statusDiv.textContent = '添加成功';
            statusDiv.className = 'batch-status success';
            successCount++;
        } catch (error) {
            console.error('添加图书失败:', error);
            statusDiv.textContent = '添加失败';
            statusDiv.className = 'batch-status error';
            errorCount++;
        }
        
        // 每个ISBN添加后延迟2秒
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    alert(`批量添加完成！成功：${successCount}本，失败：${errorCount}本`);
}

// 生成综合文字分析评估报告
function generateAnalysisReport() {
    const reportContent = document.getElementById('report-content');
    if (!reportContent) return;
    
    // 获取当前月份
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // 筛选当月借阅记录
    const currentMonthBorrows = borrowRecords.filter(r => {
        const borrowDate = new Date(r.borrow_date);
        return borrowDate.getMonth() === currentMonth && borrowDate.getFullYear() === currentYear;
    });
    
    // 统计各类型书籍借阅次数
    const categoryBorrowCount = {};
    const categoryBookCount = {};
    
    // 初始化分类计数
    books.forEach(book => {
        if (!categoryBookCount[book.category]) {
            categoryBookCount[book.category] = 0;
            categoryBorrowCount[book.category] = 0;
        }
        categoryBookCount[book.category] += book.copies;
    });
    
    // 统计当月各分类借阅次数
    currentMonthBorrows.forEach(record => {
        const book = books.find(b => b.id === record.book_id);
        if (book) {
            categoryBorrowCount[book.category] = (categoryBorrowCount[book.category] || 0) + 1;
        }
    });
    
    // 计算各分类借阅频率（借阅次数/图书总数）
    const categoryPopularity = {};
    for (const category in categoryBorrowCount) {
        if (categoryBookCount[category] > 0) {
            categoryPopularity[category] = categoryBorrowCount[category] / categoryBookCount[category];
        }
    }
    
    // 按借阅频率排序分类
    const sortedCategories = Object.entries(categoryPopularity)
        .sort(([,a], [,b]) => b - a);
    
    // 找出最受欢迎的书籍类型
    const topCategories = sortedCategories.slice(0, 3);
    const popularCategories = topCategories.map(([category, popularity]) => category);
    
    // 计算需要进购的书籍类型和数量
    const purchaseRecommendations = [];
    for (const [category, popularity] of sortedCategories) {
        const currentCount = categoryBookCount[category];
        const borrowCount = categoryBorrowCount[category];
        
        // 根据借阅频率和当前数量计算推荐进购数量
        // 公式：推荐数量 = 借阅次数 * 1.5 - 当前数量
        let recommendedCount = Math.round(borrowCount * 1.5 - currentCount);
        
        if (recommendedCount > 0) {
            purchaseRecommendations.push({
                category: category,
                recommended: recommendedCount,
                current: currentCount,
                borrows: borrowCount
            });
        }
    }
    
    // 生成报告HTML
    let reportHTML = `
        <div class="report-section">
            <h4>1. 当月借阅总体情况</h4>
            <p>本月（${currentYear}年${currentMonth + 1}月）共发生${currentMonthBorrows.length}次借阅行为。</p>
        </div>
        
        <div class="report-section">
            <h4>2. 学生喜欢的书籍类型</h4>
            ${topCategories.length > 0 ? `
                <p>本月最受欢迎的书籍类型依次为：</p>
                <ul>
                    ${topCategories.map(([category, popularity], index) => `
                        <li>${index + 1}. ${category}类图书（借阅频率：${(popularity * 100).toFixed(1)}%）</li>
                    `).join('')}
                </ul>
            ` : `
                <p>本月暂无足够借阅数据来分析学生喜欢的书籍类型。</p>
            `}
        </div>
    `;
    
    if (purchaseRecommendations.length > 0) {
        reportHTML += `
            <div class="report-section">
                <h4>3. 书籍进购建议</h4>
                <p>根据本月借阅情况分析，建议进购以下类型书籍：</p>
                <ul>
                    ${purchaseRecommendations.map(item => `
                        <li>${item.category}类图书：建议进购${item.recommended}本（当前${item.current}本，本月借阅${item.borrows}次）</li>
                    `).join('')}
                </ul>
            </div>
        `;
    } else {
        reportHTML += `
            <div class="report-section">
                <h4>3. 书籍进购建议</h4>
                <p>目前各类型书籍库存充足，暂时不需要大量进购。</p>
            </div>
        `;
    }
    
    // 计算整体借阅趋势
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const lastMonthBorrows = borrowRecords.filter(r => {
        const borrowDate = new Date(r.borrowDate);
        return borrowDate.getMonth() === lastMonth && borrowDate.getFullYear() === lastYear;
    });
    
    const monthOverMonthChange = lastMonthBorrows.length > 0 ? 
        ((currentMonthBorrows.length - lastMonthBorrows.length) / lastMonthBorrows.length) * 100 : 
        100;
    
    reportHTML += `
        <div class="report-section">
            <h4>4. 借阅趋势分析</h4>
            <p>与上月相比，本月借阅量${monthOverMonthChange > 0 ? '增加' : '减少'}了${Math.abs(monthOverMonthChange).toFixed(1)}%。</p>
            ${monthOverMonthChange > 0 ? 
                '<p>借阅量呈上升趋势，建议适当增加热门图书的库存。</p>' : 
                '<p>借阅量有所下降，建议关注学生阅读需求变化，调整图书采购策略。</p>'
            }
        </div>
    `;
    
    reportContent.innerHTML = reportHTML;
}

// 数据统计更新
function updateStats() {
    const booksInLibrary = books.reduce((sum, book) => sum + (book.available || book.copies || 1), 0);
    const today = new Date().toISOString().split('T')[0];
    const todayBorrows = borrowRecords.filter(r => r.borrow_date === today).length;
    const activeBorrows = borrowRecords.filter(r => r.return_date === null).length;
    const overdueBooks = borrowRecords.filter(r => 
        r.return_date === null && new Date(r.due_date) < new Date()
    ).length;
    
    document.getElementById('books-in-library').textContent = booksInLibrary;
    document.getElementById('today-borrows').textContent = todayBorrows;
    document.getElementById('active-borrows').textContent = activeBorrows;
    document.getElementById('overdue-books').textContent = overdueBooks;
    
    // 更新分析报告
    generateAnalysisReport();
    
    // 生成热门图书排行榜
    generatePopularBooksRanking();
}

// 文字统计生成函数
function generateTextStats() {
    // 近30天借阅趋势文字
    generateBorrowTrendText();
    // 热门书籍TOP10文字
    generatePopularBooksText();
    // 图书分类分布文字
    generateBookCategoryText();
}

// 生成近30天借阅趋势文字
function generateBorrowTrendText() {
    const container = document.getElementById('borrow-trend-text');
    if (!container) return;
    
    // 统计近30天借阅数据
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentBorrows = borrowRecords.filter(r => new Date(r.borrow_date) >= thirtyDaysAgo);
    const borrowsByDay = {};
    
    recentBorrows.forEach(record => {
        const date = record.borrow_date;
        borrowsByDay[date] = (borrowsByDay[date] || 0) + 1;
    });
    
    // 生成文字统计
    let text = `<h4>近30天借阅趋势</h4>`;
    text += `<p>近30天总借阅次数：${recentBorrows.length}次</p>`;
    
    if (recentBorrows.length > 0) {
        const dates = Object.keys(borrowsByDay).sort();
        const firstDate = dates[0];
        const lastDate = dates[dates.length - 1];
        
        text += `<p>统计周期：${firstDate} 至 ${lastDate}</p>`;
        
        // 找出借阅量最高和最低的日期
        let maxDate = firstDate;
        let minDate = firstDate;
        for (const date in borrowsByDay) {
            if (borrowsByDay[date] > borrowsByDay[maxDate]) {
                maxDate = date;
            }
            if (borrowsByDay[date] < borrowsByDay[minDate]) {
                minDate = date;
            }
        }
        
        text += `<p>借阅高峰日：${maxDate}（${borrowsByDay[maxDate]}次）</p>`;
        text += `<p>借阅低谷日：${minDate}（${borrowsByDay[minDate]}次）</p>`;
    } else {
        text += `<p>近30天无借阅记录</p>`;
    }
    
    container.innerHTML = text;
}

// 生成热门书籍TOP10文字
function generatePopularBooksText() {
    const container = document.getElementById('popular-books-text');
    if (!container) return;
    
    // 统计图书借阅次数
    const bookPopularity = {};
    borrowRecords.forEach(record => {
        bookPopularity[record.book_id] = (bookPopularity[record.book_id] || 0) + 1;
    });
    
    // 生成热门书籍列表
    const popularBooks = Object.entries(bookPopularity)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([bookId, count]) => {
            const book = books.find(b => b.id === parseInt(bookId));
            return {
                title: book ? book.title : '未知图书',
                count: count
            };
        });
    
    let text = `<h4>热门书籍TOP10</h4>`;
    
    if (popularBooks.length > 0) {
        text += `<ol>`;
        popularBooks.forEach((book, index) => {
            text += `<li>${book.title} - 借阅${book.count}次</li>`;
        });
        text += `</ol>`;
    } else {
        text += `<p>暂无借阅记录</p>`;
    }
    
    container.innerHTML = text;
}

// 生成图书分类分布文字
function generateBookCategoryText() {
    const container = document.getElementById('book-category-text');
    if (!container) return;
    
    // 统计图书分类
    const categoryStats = {};
    books.forEach(book => {
        categoryStats[book.category] = (categoryStats[book.category] || 0) + (book.available || book.copies || 1);
    });
    
    // 生成文字统计
    let text = `<h4>图书分类分布</h4>`;
    
    if (Object.keys(categoryStats).length > 0) {
        text += `<ul>`;
        Object.entries(categoryStats).forEach(([category, count]) => {
            const totalBooks = books.reduce((sum, book) => sum + (book.available || book.copies || 1), 0);
            const percentage = totalBooks > 0 ? ((count / totalBooks) * 100).toFixed(1) : 0;
            text += `<li>${category}：${count}本 (${percentage}%)</li>`;
        });
        text += `</ul>`;
    } else {
        text += `<p>暂无图书数据</p>`;
    }
    
    container.innerHTML = text;
}

// 生成热门图书排行榜
function generatePopularBooksRanking() {
    const container = document.getElementById('popular-books-list');
    if (!container) return;
    
    // 统计图书借阅次数
    const bookPopularity = {};
    borrowRecords.forEach(record => {
        bookPopularity[record.book_id] = (bookPopularity[record.book_id] || 0) + 1;
    });
    
    // 生成热门书籍列表
    const popularBooks = Object.entries(bookPopularity)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([bookId, count]) => {
            const book = books.find(b => b.id === parseInt(bookId));
            return {
                title: book ? book.title : '未知图书',
                author: book ? book.author : '未知作者',
                count: count
            };
        });
    
    // 生成HTML
    let html = '';
    
    if (popularBooks.length > 0) {
        html += `<div class="popular-books-ranking">`;
        popularBooks.forEach((book, index) => {
            // 添加不同的UI装饰，比如排名图标、借阅次数的火焰图标等
            const rankIcon = index === 0 ? '<i class="fas fa-crown gold"></i>' : 
                           index === 1 ? '<i class="fas fa-crown silver"></i>' : 
                           index === 2 ? '<i class="fas fa-crown bronze"></i>' : 
                           `<span class="rank-number">${index + 1}</span>`;
            
            html += `
                <div class="popular-book-item">
                    <div class="book-rank">${rankIcon}</div>
                    <div class="book-info">
                        <div class="book-title">${book.title}</div>
                        <div class="book-author">${book.author}</div>
                    </div>
                    <div class="book-stats">
                        <div class="borrow-count"><i class="fas fa-fire"></i> ${book.count}次</div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    } else {
        html += `<div class="no-data">
                    <i class="fas fa-book-open"></i>
                    <p>暂无借阅记录</p>
                </div>`;
    }
    
    container.innerHTML = html;
}

// 事件监听器 - 重命名为initLibraryEventListeners，避免与main.js冲突
async function initLibraryEventListeners() {
    try {
        console.log('初始化图书馆系统事件监听器...');
        
        // 图书馆入口页面功能 - 直接绑定，确保能正确响应
        const enterStudentLibraryBtn = document.getElementById('enter-student-library');
        const enterAdminLibraryBtn = document.getElementById('enter-admin-library');
        const backToMainBtn = document.getElementById('back-to-main-btn');
        
        if (enterStudentLibraryBtn) {
            enterStudentLibraryBtn.onclick = function() {
                console.log('点击了学生入口');
                if (typeof window.showPage === 'function') {
                    window.showPage('student-home');
                }
                // 延迟绑定学生功能按钮事件监听器
                setTimeout(bindStudentFunctionButtons, 100);
            };
            console.log('学生入口事件监听器绑定成功');
        } else {
            console.log('学生入口按钮未找到');
        }
        
        if (enterAdminLibraryBtn) {
            enterAdminLibraryBtn.onclick = function() {
                console.log('点击了管理员入口');
                if (typeof window.showPage === 'function') {
                    window.showPage('admin-login-page');
                }
            };
            console.log('管理员入口事件监听器绑定成功');
        } else {
            console.log('管理员入口按钮未找到');
        }
        
        if (backToMainBtn) {
            backToMainBtn.onclick = function() {
                console.log('点击了返回主系统');
                if (typeof window.showPage === 'function') {
                    window.showPage('home');
                    // 更新导航状态
                    document.querySelectorAll('.nav-menu .nav-item').forEach(nav => {
                        nav.classList.remove('active');
                    });
                    document.querySelector('.nav-menu .nav-item[data-page="home"]')?.classList.add('active');
                }
            };
            console.log('返回主系统事件监听器绑定成功');
        } else {
            console.log('返回主系统按钮未找到');
        }
        
        // 管理员登录页面返回首页
        const backToHomeBtn = document.getElementById('back-to-home-btn');
        if (backToHomeBtn) {
            backToHomeBtn.onclick = function() {
                console.log('点击了返回首页');
                if (typeof window.showPage === 'function') {
                    window.showPage('home');
                    // 更新导航状态
                    document.querySelectorAll('.nav-menu .nav-item').forEach(nav => {
                        nav.classList.remove('active');
                    });
                    document.querySelector('.nav-menu .nav-item[data-page="home"]')?.classList.add('active');
                }
            };
            console.log('返回首页事件监听器绑定成功');
        }
        
        // 管理员登录提交
        const adminLoginSubmitBtn = document.getElementById('admin-login-submit');
        if (adminLoginSubmitBtn) {
            adminLoginSubmitBtn.onclick = adminLogin;
            console.log('管理员登录提交事件监听器绑定成功');
        }
        
        // 登录功能
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.onclick = studentLogin;
            console.log('登录按钮事件监听器绑定成功');
        }
        
        // ISBN搜索功能
        const searchIsbnBtn = document.getElementById('search-isbn-btn');
        if (searchIsbnBtn) {
            searchIsbnBtn.onclick = searchISBN;
            console.log('ISBN搜索事件监听器绑定成功');
        }
        
        // 公告管理功能
        const publishAnnouncementBtn = document.getElementById('publish-announcement-btn');
        const closeAnnouncementBtn = document.getElementById('close-announcement');
        if (publishAnnouncementBtn) {
            publishAnnouncementBtn.onclick = publishAnnouncement;
            console.log('发布公告事件监听器绑定成功');
        }
        if (closeAnnouncementBtn) {
            closeAnnouncementBtn.onclick = closeAnnouncement;
            console.log('关闭公告事件监听器绑定成功');
        }
        
        // 管理员侧边栏导航事件 - 重点修复：确保能切换到所有管理员页面
        const adminNavItems = document.querySelectorAll('.sidebar-nav .nav-item');
        if (adminNavItems.length > 0) {
            adminNavItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const pageId = item.getAttribute('data-page');
                    console.log(`切换到管理员页面: ${pageId}`);
                    
                    // 使用showAdminPage函数切换页面
                    showAdminPage(pageId);
                    
                    // 更新导航状态
                    adminNavItems.forEach(nav => {
                        nav.classList.remove('active');
                    });
                    item.classList.add('active');
                });
            });
            console.log('管理员侧边栏导航事件监听器绑定成功');
        } else {
            console.log('管理员侧边栏导航项未找到，可能尚未加载到DOM中');
        }
        
        // 管理员页面返回按钮
        const adminLogoutBtn = document.getElementById('admin-logout');
        if (adminLogoutBtn) {
            adminLogoutBtn.onclick = function(e) {
                e.preventDefault();
                console.log('管理员退出登录');
                logout();
            };
            console.log('管理员退出登录事件监听器绑定成功');
        } else {
            console.log('管理员退出登录按钮未找到');
        }
        
        // 确保管理员页面功能正常
        console.log('管理员页面功能初始化完成');
        
        console.log('图书馆系统事件监听器绑定完成');
        
    } catch (error) {
        console.error('图书馆系统事件监听器初始化失败:', error);
        // 即使事件监听器初始化失败，也不抛出错误，确保页面可以访问
    }
}

// 发布公告
async function publishAnnouncement() {
    console.log('开始执行发布公告函数');
    try {
        // 获取公告表单元素
        const titleElement = document.getElementById('announcement-title');
        const contentElement = document.getElementById('publish-announcement-content');
        
        console.log('获取到的表单元素:', 'titleElement:', titleElement, 'contentElement:', contentElement);
        
        // 检查元素是否存在
        if (!titleElement || !contentElement) {
            console.error('公告表单元素未找到');
            alert('公告表单元素未找到，请检查页面结构');
            return;
        }
        
        // 获取表单值，并添加空值检查
        const title = (titleElement.value || '').trim();
        const content = (contentElement.value || '').trim();
        
        console.log('公告标题:', title, '长度:', title.length, '类型:', typeof title);
        console.log('公告内容:', content, '长度:', content.length, '类型:', typeof content);
        
        // 更严格的表单验证
        if (title.length > 0 && content.length > 0) {
            try {
                // 检查announcementService是否存在
                if (!announcementService) {
                    console.error('announcementService未初始化');
                    alert('公告服务未初始化，请刷新页面重试');
                    return;
                }
                
                // 检查addAnnouncement方法是否存在
                if (typeof announcementService.addAnnouncement !== 'function') {
                    console.error('addAnnouncement方法未定义');
                    alert('公告服务方法未定义，请刷新页面重试');
                    return;
                }
                
                const newAnnouncement = {
                    title: title,
                    content: content,
                    date: new Date().toISOString().split('T')[0]
                };
                
                console.log('准备发布公告:', newAnnouncement);
                
                // 使用Supabase服务添加公告
                const addedAnnouncement = await announcementService.addAnnouncement(newAnnouncement);
                
                console.log('公告发布成功，返回数据:', addedAnnouncement);
                
                // 更新本地数据
                if (Array.isArray(announcements)) {
                    announcements.push(addedAnnouncement);
                }
                
                // 清空表单
                if (titleElement && titleElement.value !== undefined) {
                    titleElement.value = '';
                }
                if (contentElement && contentElement.value !== undefined) {
                    contentElement.value = '';
                }
                
                alert('公告发布成功！');
            } catch (error) {
                console.error('发布公告失败:', error);
                alert('发布公告失败，请稍后重试\n\n错误详情: ' + (error.message || '未知错误'));
            }
        } else {
            console.error('表单验证失败:', 'title:', title, 'content:', content);
            alert('请填写公告标题和内容！');
        }
    } catch (error) {
        console.error('publishAnnouncement函数执行失败:', error);
        alert('发布公告失败，请稍后重试\n\n错误详情: ' + (error.message || '未知错误'));
    }
}



// 模拟ISBN搜索数据
const mockISBNData = {
    '9787506365437': {
        title: '活着',
        author: '余华',
        category: '文学',
        publisher: '作家出版社'
    },
    '9787020156736': {
        title: '红楼梦',
        author: '曹雪芹',
        category: '文学',
        publisher: '人民文学出版社'
    },
    '9787544270878': {
        title: '百年孤独',
        author: 'Gabriel García Márquez',
        category: '文学',
        publisher: '南海出版公司'
    },
    '9787115421880': {
        title: 'JavaScript高级程序设计',
        author: 'Nicholas C. Zakas',
        category: '计算机',
        publisher: '人民邮电出版社'
    },
    '9787115428028': {
        title: 'Python编程：从入门到实践',
        author: 'Eric Matthes',
        category: '计算机',
        publisher: '人民邮电出版社'
    },
    '9787111407010': {
        title: '算法导论',
        author: 'Thomas H. Cormen',
        category: '计算机',
        publisher: '机械工业出版社'
    }
};

// ISBN搜索功能
async function searchISBN() {
    const isbn = document.getElementById('add-book-isbn').value;
    
    if (!isbn) {
        alert('请输入ISBN号码！');
        return;
    }
    
    // 显示加载状态
    const searchButton = document.getElementById('search-isbn-btn');
    const originalButtonText = searchButton.innerHTML;
    searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 搜索中...';
    searchButton.disabled = true;
    
    try {
        // 调用智谱AI API查询图书信息
        const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 6cc5158bafbc44458e007a27825464be.NgsJybRTDD7KPMIA'
            },
            body: JSON.stringify({
                model: 'glm-4.5',
                messages: [
                    {
                        role: 'system',
                        content: `你是一个图书信息查询助手，请根据用户提供的ISBN号，返回该图书的详细信息。
                                请严格按照以下JSON格式返回，不要添加任何额外内容：
                                {
                                    "title": "图书标题",
                                    "author": "作者",
                                    "publisher": "出版社",
                                    "pubDate": "出版日期",
                                    "description": "图书描述",
                                    "price": "价格",
                                    "category": "分类"
                                }
                                如果无法查询到该ISBN对应的图书信息，请返回：{"error": "未找到该ISBN对应的图书信息"}`
                    },
                    {
                        role: 'user',
                        content: `请查询ISBN号为${isbn}的图书信息`
                    }
                ],
                temperature: 0.1,
                thinking: {
                    "type": "enabled"
                }
            })
        });
        
        const status = response.status;
        const data = await response.json();
        
        if (status === 200 && data.choices && data.choices.length > 0) {
            const aiResponse = data.choices[0].message.content;
            
            try {
                // 尝试解析JSON
                const bookInfo = JSON.parse(aiResponse);
                
                if (bookInfo.error) {
                    alert(`未找到该ISBN对应的图书信息：${bookInfo.error}`);
                } else {
                    // 填充表单数据
                    document.getElementById('add-book-title').value = bookInfo.title || '';
                    document.getElementById('add-book-author').value = bookInfo.author || '';
                    document.getElementById('add-book-publisher').value = bookInfo.publisher || '';
                    document.getElementById('add-book-category').value = bookInfo.category || '';
                    
                    // 提示用户搜索成功
                    alert('ISBN搜索成功！已自动填充图书信息');
                }
            } catch (e) {
                console.error('AI返回格式错误:', e, '原始响应:', aiResponse);
                alert('AI返回格式错误，请稍后重试或手动输入图书信息');
            }
        } else {
            // 显示详细的错误信息
            let errorMessage = `智谱AI返回错误，HTTP状态码: ${status}`;
            if (data.error) {
                errorMessage = `智谱AI返回错误: ${data.error.message} (状态码: ${status})`;
                if (data.error.code) {
                    errorMessage += ` (错误码: ${data.error.code})`;
                }
            } else if (data.msg) {
                errorMessage += ` (详细信息: ${data.msg})`;
            }
            alert(`ISBN搜索失败：${errorMessage}`);
        }
    } catch (error) {
        console.error('ISBN搜索失败:', error);
        alert(`ISBN搜索失败：${error.message}\n\n请检查网络连接或稍后重试`);
    } finally {
        // 恢复搜索按钮状态
        searchButton.innerHTML = originalButtonText;
        searchButton.disabled = false;
    }
}

// 页面加载完成后初始化事件监听器
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEventListeners);
} else {
    initEventListeners();
}

// 保存数据到Supabase
async function saveData() {
    try {
        // 在实际应用中，这里应该调用Supabase API来保存数据
        // 目前由于数据是通过API获取的，我们只需要确保本地数据与Supabase同步
        console.log('数据已同步到本地');
    } catch (error) {
        console.error('保存数据失败:', error);
    }
}

// 初始化
window.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('开始初始化应用...');
        await initEventListeners();
        console.log('应用初始化完成');
        
        // 添加导航栏滚动效果
        window.addEventListener('scroll', () => {
            const mainNav = document.querySelector('.main-nav');
            if (window.scrollY > 50) {
                mainNav.classList.add('scrolled');
            } else {
                mainNav.classList.remove('scrolled');
            }
        });
    } catch (error) {
        console.error('应用初始化失败:', error);
        alert('应用初始化失败，请刷新页面重试');
    }
});