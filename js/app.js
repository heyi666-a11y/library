// 导入Supabase服务
import { bookService, readerService, borrowRecordService, announcementService, authService, statsService } from './supabase-service.js';

// 全局变量
let currentUser = null;
let isAdmin = false;
let currentPage = 'home';
let currentAdminPage = 'dashboard';

// 数据存储 - 从Supabase获取
let announcements = [];
let books = [];
let readers = [];
let borrowRecords = [];

// DOM元素
const pages = document.querySelectorAll('.page');
const adminPages = document.querySelectorAll('.admin-page');

// 初始化数据
async function initData() {
    try {
        // 从Supabase获取数据
        announcements = await announcementService.getAllAnnouncements();
        books = await bookService.getAllBooks();
        readers = await readerService.getAllReaders();
        borrowRecords = await borrowRecordService.getAllBorrowRecords();
    } catch (error) {
        console.error('初始化数据失败:', error);
        // 如果获取失败，使用默认数据
        console.log('使用默认数据');
        announcements = [
            { id: 1, title: '图书馆开馆通知', content: '图书馆将于2024年12月20日正式开馆，欢迎广大师生前来借阅。', date: '2024-12-15' },
            { id: 2, title: '新书推荐', content: '近期新增了一批计算机类图书，包括JavaScript高级程序设计等经典著作。', date: '2024-12-10' }
        ];
        
        books = [
            { id: 1, title: 'JavaScript高级程序设计', author: 'Nicholas C. Zakas', isbn: '9787115421880', category: '计算机', publisher: '人民邮电出版社', status: 'in', copies: 5, available: 5 },
            { id: 2, title: 'CSS权威指南', author: 'Eric A. Meyer', isbn: '9787115526247', category: '计算机', publisher: '人民邮电出版社', status: 'in', copies: 3, available: 2 },
            { id: 3, title: 'HTML5与CSS3权威指南', author: '陆凌牛', isbn: '9787115407304', category: '计算机', publisher: '人民邮电出版社', status: 'in', copies: 4, available: 4 }
        ];
        
        readers = [
            { id: '20210001', name: '张三', grade: '高一', class: '1班', borrowCount: 2, overdueCount: 0 },
            { id: '20210002', name: '李四', grade: '高一', class: '1班', borrowCount: 1, overdueCount: 1 }
        ];
        
        borrowRecords = [
            { id: 1, studentId: '20210001', studentName: '张三', bookId: 2, bookTitle: 'CSS权威指南', borrowDate: '2024-12-01', dueDate: '2025-01-01', returnDate: null, status: 'borrowed' }
        ];
    }
}

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
        currentPage = pageId;
    }
    
    // 如果是学生主页面或欢迎页面，显示公告
    if (pageId === 'student-home' || pageId === 'welcome') {
        showLatestAnnouncements();
    }
    
    // 如果是图书馆系统页面，隐藏主导航栏
    const mainNav = document.querySelector('.main-nav');
    if (pageId === 'student-home' || pageId === 'borrow-page' || pageId === 'return-page' || 
        pageId === 'library-page' || pageId === 'search-page' || pageId === 'admin-home' || 
        pageId === 'admin-login-page' || pageId === 'library-entry') {
        mainNav.style.position = 'relative';
    } else {
        mainNav.style.position = 'sticky';
    }
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
    adminPages.forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    currentAdminPage = pageId;
    
    // 更新导航状态
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
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
        initCharts();
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
    const bookTitle = document.getElementById('borrow-book-title').value;
    const bookIsbn = document.getElementById('borrow-book-isbn').value;
    
    if (!studentId) {
        alert('请输入学号/校卡');
        return;
    }
    
    if (!bookTitle && !bookIsbn) {
        alert('请输入书名或ISBN');
        return;
    }
    
    try {
        // 查找学生
        const student = readers.find(r => r.id === studentId);
        if (!student) {
            alert('学生不存在');
            return;
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
        const currentBorrows = borrowRecords.filter(r => r.studentId === studentId && r.returnDate === null);
        if (currentBorrows.length >= 5) {
            alert('已达到最大借阅数量（5本）');
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
        student.borrowCount++;
        await readerService.updateReader(studentId, {
            borrow_count: student.borrowCount
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
                <p><strong>到期日期：</strong>${dueDate.toISOString().split('T')[0]}</p>
            </div>
        `;
        
        // 3秒后重置表单
        setTimeout(() => {
            bookPreview.innerHTML = '';
            document.getElementById('borrow-student-id').value = '';
            document.getElementById('borrow-book-title').value = '';
            document.getElementById('borrow-book-isbn').value = '';
        }, 3000);
        
        // 更新管理员界面数据
        if (isAdmin) {
            updateStats();
            initBookList();
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
    const bookTitle = document.getElementById('return-book-title').value;
    const bookIsbn = document.getElementById('return-book-isbn').value;
    
    if (!bookTitle && !bookIsbn) {
        alert('请输入书名或ISBN');
        return;
    }
    
    try {
        // 查找借阅记录
        const record = borrowRecords.find(r => {
            const matchesTitle = bookTitle && r.bookTitle.toLowerCase().includes(bookTitle.toLowerCase());
            const matchesIsbn = bookIsbn && r.bookId.toString() === bookIsbn;
            return (matchesTitle || matchesIsbn) && r.returnDate === null;
        });
        
        if (!record) {
            alert('未找到该图书的借阅记录');
            return;
        }
        
        // 执行归还
        const book = books.find(b => b.id === record.bookId);
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
        const student = readers.find(r => r.id === record.studentId);
        student.borrowCount--;
        await readerService.updateReader(record.studentId, {
            borrow_count: student.borrowCount
        });
        
        // 更新本地数据
        record.returnDate = returnDate;
        record.status = 'returned';
        
        // 检查是否逾期
        const dueDate = new Date(record.dueDate);
        const isOverdue = returnDate > dueDate;
        
        // 更新界面显示
        const returnStatus = document.getElementById('return-status');
        returnStatus.innerHTML = `
            <div style="background: #e8f4f8; padding: 20px; border-radius: 10px; text-align: center;">
                <i class="fas fa-check-circle" style="font-size: 48px; color: #27ae60; margin-bottom: 15px;"></i>
                <h3>还书成功！</h3>
                <p><strong>书名：</strong>${record.bookTitle}</p>
                <p><strong>借阅人：</strong>${record.studentName}</p>
                <p><strong>借阅日期：</strong>${record.borrowDate}</p>
                <p><strong>到期日期：</strong>${record.dueDate}</p>
                <p><strong>归还日期：</strong>${record.returnDate}</p>
                ${isOverdue ? `<p style="color: #ff4757;">已逾期${Math.floor((returnDate - dueDate) / (1000 * 60 * 60 * 24))}天</p>` : ''}
            </div>
        `;
        
        // 3秒后重置表单
        setTimeout(() => {
            returnStatus.innerHTML = '';
            document.getElementById('return-book-title').value = '';
            document.getElementById('return-book-isbn').value = '';
        }, 3000);
        
        // 更新管理员界面数据
        if (isAdmin) {
            updateStats();
            initBookList();
            initRecordsList();
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
                <button class="btn btn-small btn-edit" onclick="editBook(${book.id})">编辑</button>
                <button class="btn btn-small btn-delete" onclick="deleteBook(${book.id})">删除</button>
            </div>
        </div>
    `).join('');
}

function addBook() {
    // 打开添加图书模态框
    document.getElementById('add-book-modal').style.display = 'block';
}

async function confirmAddBook() {
    const title = document.getElementById('add-book-title').value;
    const author = document.getElementById('add-book-author').value;
    const isbn = document.getElementById('add-book-isbn').value;
    const category = document.getElementById('add-book-category').value;
    const publisher = document.getElementById('add-book-publisher').value;
    const copies = parseInt(document.getElementById('add-book-copies').value);
    
    if (title && author && isbn && category && publisher && !isNaN(copies) && copies > 0) {
        try {
            // 使用Supabase服务添加图书
            const newBook = {
                title: title,
                author: author,
                isbn: isbn,
                category: category,
                publisher: publisher,
                status: 'in',
                copies: copies,
                available: copies
            };
            
            const addedBook = await bookService.addBook(newBook);
            
            // 更新本地数据
            books.push(addedBook);
            
            initBookList();
            updateStats();
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
    
    const title = document.getElementById('edit-book-title').value;
    const author = document.getElementById('edit-book-author').value;
    const isbn = document.getElementById('edit-book-isbn').value;
    const category = document.getElementById('edit-book-category').value;
    const publisher = document.getElementById('edit-book-publisher').value;
    const copies = parseInt(document.getElementById('edit-book-copies').value);
    
    if (title && author && isbn && category && publisher && !isNaN(copies)) {
        try {
            // 更新本地图书对象
            const updatedBook = {
                ...book,
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
    
    // 按年级分组
    const gradeGroups = {};
    readers.forEach(reader => {
        if (!gradeGroups[reader.grade]) {
            gradeGroups[reader.grade] = {};
        }
        if (!gradeGroups[reader.grade][reader.class]) {
            gradeGroups[reader.grade][reader.class] = [];
        }
        gradeGroups[reader.grade][reader.class].push(reader);
    });
    
    readerTree.innerHTML = Object.keys(gradeGroups).map(grade => `
        <div class="grade-group">
            <div class="grade-header">${grade}</div>
            ${Object.keys(gradeGroups[grade]).map(className => `
                <div class="class-group">
                    <div class="class-header">${className}</div>
                    <div class="student-list">
                        ${gradeGroups[grade][className].map(student => `
                            <div class="student-item" onclick="showReaderDetails('${student.id}')">
                                ${student.name} (${student.id})
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');
    
    // 默认显示第一个读者的详细信息
    if (readers.length > 0) {
        showReaderDetails(readers[0].id);
    }
}

function showReaderDetails(studentId) {
    const student = readers.find(r => r.id === studentId);
    if (!student) return;
    
    const readerDetails = document.getElementById('reader-details');
    const studentBorrows = borrowRecords.filter(r => r.studentId === studentId);
    const currentBorrows = studentBorrows.filter(r => r.returnDate === null);
    const historyBorrows = studentBorrows.filter(r => r.returnDate !== null);
    
    readerDetails.innerHTML = `
        <div class="reader-info">
            <h3>${student.name}</h3>
            <p>学号：${student.id}</p>
            <p>年级：${student.grade}</p>
            <p>班级：${student.class}</p>
            <p>当前借阅：${currentBorrows.length}本</p>
            <p>逾期次数：${student.overdueCount}次</p>
        </div>
        
        <div class="reader-borrows">
            <h4>当前借阅</h4>
            ${currentBorrows.length > 0 ? currentBorrows.map(record => `
                <div class="borrow-item">
                    <p>${record.bookTitle}</p>
                    <p>到期日期：${record.dueDate}</p>
                </div>
            `).join('') : '<p>无当前借阅</p>'}
        </div>
        
        <div class="reader-borrows">
            <h4>历史借阅</h4>
            ${historyBorrows.length > 0 ? historyBorrows.slice(0, 5).map(record => `
                <div class="borrow-item">
                    <p>${record.bookTitle}</p>
                    <p>借阅日期：${record.borrowDate}</p>
                    <p>归还日期：${record.returnDate}</p>
                </div>
            `).join('') : '<p>无历史借阅</p>'}
        </div>
    `;
}

// 借阅记录管理
function initRecordsList() {
    const recordsList = document.getElementById('records-list');
    
    recordsList.innerHTML = borrowRecords.map(record => `
        <div class="record-item">
            <div class="record-info">
                <p><strong>图书：</strong>${record.bookTitle}</p>
                <p><strong>读者：</strong>${record.studentName} (${record.studentId})</p>
            </div>
            <div class="record-dates">
                <p><strong>借阅日期：</strong>${record.borrowDate}</p>
                <p><strong>到期日期：</strong>${record.dueDate}</p>
                ${record.returnDate ? `<p><strong>归还日期：</strong>${record.returnDate}</p>` : ''}
            </div>
            <div class="record-status">
                <p class="status-${record.status}">${record.status === 'borrowed' ? '借阅中' : record.status === 'returned' ? '已归还' : '逾期'}</p>
            </div>
        </div>
    `).join('');
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
        const borrowDate = new Date(r.borrowDate);
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
        const book = books.find(b => b.id === record.bookId);
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
    const booksInLibrary = books.reduce((sum, book) => sum + book.copies, 0);
    const todayBorrows = borrowRecords.filter(r => r.borrowDate === new Date().toISOString().split('T')[0]).length;
    const activeBorrows = borrowRecords.filter(r => r.returnDate === null).length;
    const overdueBooks = borrowRecords.filter(r => 
        r.returnDate === null && new Date(r.dueDate) < new Date()
    ).length;
    
    document.getElementById('books-in-library').textContent = booksInLibrary;
    document.getElementById('today-borrows').textContent = todayBorrows;
    document.getElementById('active-borrows').textContent = activeBorrows;
    document.getElementById('overdue-books').textContent = overdueBooks;
    
    // 更新分析报告
    generateAnalysisReport();
}

// 图表初始化
function initCharts() {
    // 近30天借阅趋势图（模拟数据）
    const borrowTrendCtx = document.getElementById('borrow-trend-chart').getContext('2d');
    new Chart(borrowTrendCtx, {
        type: 'line',
        data: {
            labels: Array.from({length: 30}, (_, i) => `${i+1}日`),
            datasets: [{
                label: '借阅量',
                data: Array.from({length: 30}, () => Math.floor(Math.random() * 30) + 5),
                borderColor: '#6c5ce7',
                backgroundColor: 'rgba(108, 92, 231, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
    
    // 图书分类分布
    const categoryStats = {};
    books.forEach(book => {
        categoryStats[book.category] = (categoryStats[book.category] || 0) + book.copies;
    });
    
    const bookCategoryCtx = document.getElementById('book-category-chart').getContext('2d');
    new Chart(bookCategoryCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryStats),
            datasets: [{
                data: Object.values(categoryStats),
                backgroundColor: [
                    '#6c5ce7', '#00b894', '#0984e3', '#e17055', '#fdcb6e', '#a29bfe'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // 热门图书TOP10
    const bookPopularity = {};
    borrowRecords.forEach(record => {
        bookPopularity[record.bookId] = (bookPopularity[record.bookId] || 0) + 1;
    });
    
    const popularBooks = Object.entries(bookPopularity)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([bookId]) => {
            const book = books.find(b => b.id.toString() === bookId);
            return {
                title: book ? book.title : '未知图书',
                count: bookPopularity[bookId]
            };
        });
    
    const popularBooksCtx = document.getElementById('popular-books-chart').getContext('2d');
    new Chart(popularBooksCtx, {
        type: 'bar',
        data: {
            labels: popularBooks.map(b => b.title),
            datasets: [{
                label: '借阅次数',
                data: popularBooks.map(b => b.count),
                backgroundColor: '#00b894'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// 事件监听器
async function initEventListeners() {
    try {
        console.log('初始化数据...');
        await initData();
        console.log('数据初始化完成');
        
        console.log('初始化导航事件监听器...');
        // 主导航栏事件
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
        console.log('初始化登录功能...');
        // 登录功能
        document.getElementById('login-btn')?.addEventListener('click', studentLogin);
    document.getElementById('admin-login-btn')?.addEventListener('click', () => showPage('admin-login-page'));
    document.getElementById('admin-login-submit')?.addEventListener('click', adminLogin);
    document.getElementById('back-to-student-login')?.addEventListener('click', () => showPage('login-page'));
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    document.getElementById('admin-logout')?.addEventListener('click', logout);
    
    // 管理员入口
    document.getElementById('admin-access-link')?.addEventListener('click', () => showPage('admin-login-page'));
    
    // 图书馆入口
    document.getElementById('enter-library-btn')?.addEventListener('click', () => {
        showPage('library-entry');
    });
    
    // 图书馆入口页面功能
    document.getElementById('enter-student-library')?.addEventListener('click', () => showPage('student-home'));
    document.getElementById('enter-admin-library')?.addEventListener('click', () => showPage('admin-login-page'));
    document.getElementById('back-to-main-btn')?.addEventListener('click', () => {
        showPage('home');
        // 更新导航状态
        document.querySelectorAll('.nav-menu .nav-item').forEach(nav => {
            nav.classList.remove('active');
        });
        document.querySelector('.nav-menu .nav-item[data-page="home"]').classList.add('active');
    });
    
    // 学生功能
    document.getElementById('borrow-btn')?.addEventListener('click', () => showPage('borrow-page'));
    document.getElementById('return-btn')?.addEventListener('click', () => showPage('return-page'));
    document.getElementById('library-btn')?.addEventListener('click', showLibraryPage);
    
    // 学生书库页面返回
    document.getElementById('back-to-student-home')?.addEventListener('click', () => showPage('student-home'));
    
    // 页面返回按钮
    document.getElementById('back-to-home')?.addEventListener('click', () => showPage('student-home'));
    document.getElementById('return-back')?.addEventListener('click', () => showPage('student-home'));
    document.getElementById('search-back')?.addEventListener('click', () => showPage('student-home'));
    
    // 图书搜索
    document.getElementById('search-books-action')?.addEventListener('click', performBookSearch);
    document.getElementById('search-books-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performBookSearch();
        }
    });
    
    // 改进的借书功能
    document.getElementById('confirm-borrow-btn')?.addEventListener('click', confirmBorrow);
    
    // 改进的还书功能
    document.getElementById('confirm-return-btn')?.addEventListener('click', confirmReturn);
    
    // 管理员导航
    document.querySelectorAll('.sidebar-nav .nav-item[data-page]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            showAdminPage(item.dataset.page);
        });
    });
    
    // 图书管理
    document.querySelector('.page-actions .btn-primary')?.addEventListener('click', addBook);
    
    // 模态框事件
    // 添加图书模态框
    document.getElementById('close-add-modal')?.addEventListener('click', () => {
        document.getElementById('add-book-modal').style.display = 'none';
    });
    document.getElementById('cancel-add-book')?.addEventListener('click', () => {
        document.getElementById('add-book-modal').style.display = 'none';
    });
    document.getElementById('confirm-add-book')?.addEventListener('click', confirmAddBook);
    
    // 编辑图书模态框
    document.getElementById('close-edit-modal')?.addEventListener('click', () => {
        document.getElementById('edit-book-modal').style.display = 'none';
    });
    document.getElementById('cancel-edit-book')?.addEventListener('click', () => {
        document.getElementById('edit-book-modal').style.display = 'none';
    });
    document.getElementById('confirm-edit-book')?.addEventListener('click', confirmEditBook);
    
    // 点击模态框外部关闭模态框
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('add-book-modal')) {
            document.getElementById('add-book-modal').style.display = 'none';
        } else if (e.target === document.getElementById('edit-book-modal')) {
            document.getElementById('edit-book-modal').style.display = 'none';
        } else if (e.target === document.getElementById('announcement-modal')) {
            document.getElementById('announcement-modal').style.display = 'none';
        }
    });
    
    // 公告管理功能
    document.getElementById('publish-announcement-btn')?.addEventListener('click', publishAnnouncement);
    document.getElementById('close-announcement')?.addEventListener('click', closeAnnouncement);
    
    // 管理员登录页面返回首页
    document.getElementById('back-to-home-btn')?.addEventListener('click', () => {
        showPage('home');
        // 更新导航状态
        document.querySelectorAll('.nav-menu .nav-item').forEach(nav => {
            nav.classList.remove('active');
        });
        document.querySelector('.nav-menu .nav-item[data-page="home"]').classList.add('active');
    });
    
        console.log('初始化ISBN搜索功能...');
        // ISBN搜索功能
        document.getElementById('search-isbn-btn')?.addEventListener('click', searchISBN);
        
        console.log('初始化荣誉公示标签切换...');
        // 荣誉公示标签切换
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
    } catch (error) {
        console.error('事件监听器初始化失败:', error);
        throw error;
    }
}

// 发布公告
async function publishAnnouncement() {
    const title = document.getElementById('announcement-title').value;
    const content = document.getElementById('announcement-content').value;
    
    if (title && content) {
        try {
            const newAnnouncement = {
                title: title,
                content: content,
                date: new Date().toISOString().split('T')[0]
            };
            
            // 使用Supabase服务添加公告
            const addedAnnouncement = await announcementService.addAnnouncement(newAnnouncement);
            
            // 更新本地数据
            announcements.push(addedAnnouncement);
            
            // 清空表单
            document.getElementById('announcement-title').value = '';
            document.getElementById('announcement-content').value = '';
            
            alert('公告发布成功！');
        } catch (error) {
            console.error('发布公告失败:', error);
            alert('发布公告失败，请稍后重试');
        }
    } else {
        alert('请填写公告标题和内容！');
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
function searchISBN() {
    const isbn = document.getElementById('add-book-isbn').value;
    
    if (!isbn) {
        alert('请输入ISBN号码！');
        return;
    }
    
    try {
        // 使用模拟数据搜索图书
        if (mockISBNData[isbn]) {
            const bookInfo = mockISBNData[isbn];
            
            // 填充表单数据
            document.getElementById('add-book-title').value = bookInfo.title || '';
            document.getElementById('add-book-author').value = bookInfo.author || '';
            document.getElementById('add-book-category').value = bookInfo.category || '';
            document.getElementById('add-book-publisher').value = bookInfo.publisher || '';
            
            // 提示用户搜索成功
            alert('ISBN搜索成功！已自动填充图书信息');
        } else {
            alert('未找到该ISBN对应的图书信息\n\n可尝试以下ISBN示例：\n9787506365437 (活着)\n9787020156736 (红楼梦)\n9787544270878 (百年孤独)\n9787115421880 (JavaScript高级程序设计)\n9787115428028 (Python编程：从入门到实践)\n9787111407010 (算法导论)');
        }
    } catch (error) {
        console.error('ISBN搜索失败:', error);
        alert('ISBN搜索失败，请检查ISBN号码是否正确');
    }
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