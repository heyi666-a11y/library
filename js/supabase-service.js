// Supabase服务封装文件
// 封装所有与Supabase的交互逻辑
// 该文件作为普通脚本加载，将服务对象暴露到全局作用域

// 直接使用 window.supabaseInstance，避免重复声明
// 检查supabase是否可用的辅助函数
function isSupabaseAvailable() {
    return typeof window !== 'undefined' && window.supabaseInstance !== null;
}

// 数据服务层 - 图书管理
window.bookService = {
    // 获取所有图书
    async getAllBooks() {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，返回空图书列表');
            return [];
        }
        
        try {
            const { data, error } = await window.supabaseInstance
                .from('books')
                .select('*')
                .order('id', { ascending: true });
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('获取图书失败:', error);
            return [];
        }
    },

    // 根据ID获取图书
    async getBookById(id) {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，无法获取图书');
            return null;
        }
        
        try {
            const { data, error } = await window.supabaseInstance
                .from('books')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error(`获取图书ID=${id}失败:`, error);
            return null;
        }
    },

    // 添加图书
    async addBook(book) {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，无法添加图书');
            return null;
        }
        
        try {
            const { data, error } = await window.supabaseInstance
                .from('books')
                .insert([book])
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('添加图书失败:', error);
            return null;
        }
    },

    // 更新图书
    async updateBook(id, book) {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，无法更新图书');
            return null;
        }
        
        try {
            const { data, error } = await window.supabaseInstance
                .from('books')
                .update(book)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error(`更新图书ID=${id}失败:`, error);
            return null;
        }
    },

    // 删除图书
    async deleteBook(id) {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，无法删除图书');
            return false;
        }
        
        try {
            const { error } = await window.supabaseInstance
                .from('books')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        } catch (error) {
            console.error(`删除图书ID=${id}失败:`, error);
            return false;
        }
    },

    // 搜索图书
    async searchBooks(searchTerm) {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，无法搜索图书');
            return [];
        }
        
        try {
            const { data, error } = await window.supabaseInstance
                .from('books')
                .select('*')
                .or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%,isbn.ilike.%${searchTerm}%,publisher.ilike.%${searchTerm}%`);
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('搜索图书失败:', error);
            return [];
        }
    },

    // 根据分类获取图书
    async getBooksByCategory(category) {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，无法获取分类图书');
            return [];
        }
        
        try {
            const { data, error } = await window.supabaseInstance
                .from('books')
                .select('*')
                .eq('category', category);
            if (error) throw error;
            return data;
        } catch (error) {
            console.error(`获取分类${category}图书失败:`, error);
            return [];
        }
    }
};

// 数据服务层 - 读者管理
window.readerService = {
    // 获取所有读者
    async getAllReaders() {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，返回空读者列表');
            return [];
        }
        
        try {
            const { data, error } = await window.supabaseInstance
                .from('readers')
                .select('*')
                .order('id', { ascending: true });
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('获取读者失败:', error);
            return [];
        }
    },

    // 根据ID获取读者
    async getReaderById(id) {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，无法获取读者');
            return null;
        }
        
        try {
            const { data, error } = await window.supabaseInstance
                .from('readers')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error(`获取读者ID=${id}失败:`, error);
            return null;
        }
    },

    // 添加读者
    async addReader(reader) {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，无法添加读者');
            return null;
        }
        
        try {
            const { data, error } = await window.supabaseInstance
                .from('readers')
                .insert([reader])
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('添加读者失败:', error);
            return null;
        }
    },

    // 更新读者
    async updateReader(id, reader) {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，无法更新读者');
            return null;
        }
        
        try {
            const { data, error } = await window.supabaseInstance
                .from('readers')
                .update(reader)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error(`更新读者ID=${id}失败:`, error);
            return null;
        }
    }
};

// 数据服务层 - 借阅记录管理
window.borrowRecordService = {
    // 获取所有借阅记录
    async getAllBorrowRecords() {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，返回空借阅记录列表');
            return [];
        }
        
        try {
            const { data, error } = await window.supabaseInstance
                .from('borrow_records')
                .select('*')
                .order('id', { ascending: false });
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('获取借阅记录失败:', error);
            return [];
        }
    },

    // 获取读者的借阅记录
    async getBorrowRecordsByStudentId(studentId) {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，无法获取读者借阅记录');
            return [];
        }
        
        try {
            const { data, error } = await window.supabaseInstance
                .from('borrow_records')
                .select('*')
                .eq('student_id', studentId)
                .order('id', { ascending: false });
            if (error) throw error;
            return data;
        } catch (error) {
            console.error(`获取读者ID=${studentId}借阅记录失败:`, error);
            return [];
        }
    },

    // 添加借阅记录
    async addBorrowRecord(record) {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，无法添加借阅记录');
            return null;
        }
        
        try {
            const { data, error } = await window.supabaseInstance
                .from('borrow_records')
                .insert([record])
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('添加借阅记录失败:', error);
            return null;
        }
    },

    // 更新借阅记录（归还图书）
    async updateBorrowRecord(id, updates) {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，无法更新借阅记录');
            return null;
        }
        
        try {
            const { data, error } = await window.supabaseInstance
                .from('borrow_records')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error(`更新借阅记录ID=${id}失败:`, error);
            return null;
        }
    },

    // 获取逾期记录
    async getOverdueRecords() {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，无法获取逾期记录');
            return [];
        }
        
        try {
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await window.supabaseInstance
                .from('borrow_records')
                .select('*')
                .lt('due_date', today)
                .is('return_date', null)
                .order('due_date', { ascending: true });
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('获取逾期记录失败:', error);
            return [];
        }
    }
};

// 数据服务层 - 公告管理
window.announcementService = {
    // 获取所有公告
    async getAllAnnouncements() {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，返回空公告列表');
            return [];
        }
        
        try {
            const { data, error } = await window.supabaseInstance
                .from('announcements')
                .select('*')
                .order('date', { ascending: false });
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('获取公告失败:', error);
            return [];
        }
    },

    // 获取最新公告
    async getLatestAnnouncements(limit = 3) {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，返回空公告列表');
            return [];
        }
        
        try {
            const { data, error } = await window.supabaseInstance
                .from('announcements')
                .select('*')
                .order('date', { ascending: false })
                .limit(limit);
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('获取最新公告失败:', error);
            return [];
        }
    },

    // 添加公告
    async addAnnouncement(announcement) {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，无法添加公告');
            return null;
        }
        
        try {
            const { data, error } = await window.supabaseInstance
                .from('announcements')
                .insert([announcement])
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('添加公告失败:', error);
            return null;
        }
    }
};

// 认证服务
window.authService = {
    // 学生登录（使用学号）
    async studentLogin(studentId) {
        // 在实际应用中，应该使用Supabase的认证系统
        // 这里先模拟实现
        const reader = await readerService.getReaderById(studentId);
        if (!reader) {
            throw new Error('学生不存在');
        }
        return {
            id: reader.id,
            name: reader.name,
            type: 'student'
        };
    },

    // 管理员登录
    async adminLogin(username, password) {
        // 在实际应用中，应该使用Supabase的认证系统
        // 这里先使用硬编码的方式，后续会替换
        if (username === 'admin' && password === 'admin123') {
            return {
                id: 'admin',
                name: '管理员',
                type: 'admin'
            };
        }
        throw new Error('用户名或密码错误');
    },

    // 使用Supabase认证系统登录（邮箱/密码）
    async login(email, password) {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，无法登录');
            return null;
        }
        
        try {
            const { data, error } = await window.supabaseInstance
                .auth
                .signInWithPassword({
                    email,
                    password
                });
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('登录失败:', error);
            return null;
        }
    },

    // 注册新用户
    async register(email, password) {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，无法注册');
            return null;
        }
        
        try {
            const { data, error } = await window.supabaseInstance
                .auth
                .signUp({
                    email,
                    password
                });
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('注册失败:', error);
            return null;
        }
    },

    // 退出登录
    async logout() {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，无法退出登录');
            return true;
        }
        
        try {
            const { error } = await window.supabaseInstance.auth.signOut();
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('退出登录失败:', error);
            return true; // 即使退出登录失败，也返回成功，确保用户状态被重置
        }
    },

    // 获取当前用户
    async getCurrentUser() {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，无法获取当前用户');
            return null;
        }
        
        try {
            const { data: { user } } = await window.supabaseInstance.auth.getUser();
            return user;
        } catch (error) {
            console.error('获取当前用户失败:', error);
            return null;
        }
    }
};

// 统计服务
window.statsService = {
    // 获取图书统计
    async getBookStats() {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，返回默认统计数据');
            return {
                total: 0,
                borrowed: 0,
                todayBorrows: 0
            };
        }
        
        try {
            const totalBooks = await window.supabaseInstance
                .from('books')
                .select('*', { count: 'exact' });
            
            const borrowedBooks = await window.supabaseInstance
                .from('borrow_records')
                .select('*', { count: 'exact' })
                .is('return_date', null);
            
            const todayBorrows = await window.supabaseInstance
                .from('borrow_records')
                .select('*', { count: 'exact' })
                .gte('borrow_date', new Date().toISOString().split('T')[0]);
            
            return {
                total: totalBooks.count || 0,
                borrowed: borrowedBooks.count || 0,
                todayBorrows: todayBorrows.count || 0
            };
        } catch (error) {
            console.error('获取图书统计失败:', error);
            return {
                total: 0,
                borrowed: 0,
                todayBorrows: 0
            };
        }
    },

    // 获取逾期图书数量
    async getOverdueCount() {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase客户端未初始化，返回默认逾期数量');
            return 0;
        }
        
        try {
            const today = new Date().toISOString().split('T')[0];
            const { count } = await window.supabaseInstance
                .from('borrow_records')
                .select('*', { count: 'exact' })
                .lt('due_date', today)
                .is('return_date', null);
            return count || 0;
        } catch (error) {
            console.error('获取逾期图书数量失败:', error);
            return 0;
        }
    }
};