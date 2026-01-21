// Supabase服务封装文件
// 封装所有与Supabase的交互逻辑

// 导入Supabase客户端
import { supabase } from './supabase-config.js';

// 数据服务层 - 图书管理
export const bookService = {
    // 获取所有图书
    async getAllBooks() {
        const { data, error } = await supabase
            .from('books')
            .select('*')
            .order('id', { ascending: true });
        if (error) throw error;
        return data;
    },

    // 根据ID获取图书
    async getBookById(id) {
        const { data, error } = await supabase
            .from('books')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    // 添加图书
    async addBook(book) {
        const { data, error } = await supabase
            .from('books')
            .insert([book])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // 更新图书
    async updateBook(id, book) {
        const { data, error } = await supabase
            .from('books')
            .update(book)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // 删除图书
    async deleteBook(id) {
        const { error } = await supabase
            .from('books')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    },

    // 搜索图书
    async searchBooks(searchTerm) {
        const { data, error } = await supabase
            .from('books')
            .select('*')
            .or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%,isbn.ilike.%${searchTerm}%,publisher.ilike.%${searchTerm}%`);
        if (error) throw error;
        return data;
    },

    // 根据分类获取图书
    async getBooksByCategory(category) {
        const { data, error } = await supabase
            .from('books')
            .select('*')
            .eq('category', category);
        if (error) throw error;
        return data;
    }
};

// 数据服务层 - 读者管理
export const readerService = {
    // 获取所有读者
    async getAllReaders() {
        const { data, error } = await supabase
            .from('readers')
            .select('*')
            .order('id', { ascending: true });
        if (error) throw error;
        return data;
    },

    // 根据ID获取读者
    async getReaderById(id) {
        const { data, error } = await supabase
            .from('readers')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    // 添加读者
    async addReader(reader) {
        const { data, error } = await supabase
            .from('readers')
            .insert([reader])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // 更新读者
    async updateReader(id, reader) {
        const { data, error } = await supabase
            .from('readers')
            .update(reader)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};

// 数据服务层 - 借阅记录管理
export const borrowRecordService = {
    // 获取所有借阅记录
    async getAllBorrowRecords() {
        const { data, error } = await supabase
            .from('borrow_records')
            .select('*')
            .order('id', { ascending: false });
        if (error) throw error;
        return data;
    },

    // 获取读者的借阅记录
    async getBorrowRecordsByStudentId(studentId) {
        const { data, error } = await supabase
            .from('borrow_records')
            .select('*')
            .eq('student_id', studentId)
            .order('id', { ascending: false });
        if (error) throw error;
        return data;
    },

    // 添加借阅记录
    async addBorrowRecord(record) {
        const { data, error } = await supabase
            .from('borrow_records')
            .insert([record])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // 更新借阅记录（归还图书）
    async updateBorrowRecord(id, updates) {
        const { data, error } = await supabase
            .from('borrow_records')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // 获取逾期记录
    async getOverdueRecords() {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('borrow_records')
            .select('*')
            .lt('due_date', today)
            .is('return_date', null)
            .order('due_date', { ascending: true });
        if (error) throw error;
        return data;
    }
};

// 数据服务层 - 公告管理
export const announcementService = {
    // 获取所有公告
    async getAllAnnouncements() {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('date', { ascending: false });
        if (error) throw error;
        return data;
    },

    // 获取最新公告
    async getLatestAnnouncements(limit = 3) {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('date', { ascending: false })
            .limit(limit);
        if (error) throw error;
        return data;
    },

    // 添加公告
    async addAnnouncement(announcement) {
        const { data, error } = await supabase
            .from('announcements')
            .insert([announcement])
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};

// 认证服务
export const authService = {
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
        const { data, error } = await supabase
            .auth
            .signInWithPassword({
                email,
                password
            });
        if (error) throw error;
        return data;
    },

    // 注册新用户
    async register(email, password) {
        const { data, error } = await supabase
            .auth
            .signUp({
                email,
                password
            });
        if (error) throw error;
        return data;
    },

    // 退出登录
    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return true;
    },

    // 获取当前用户
    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    }
};

// 统计服务
export const statsService = {
    // 获取图书统计
    async getBookStats() {
        const totalBooks = await supabase
            .from('books')
            .select('*', { count: 'exact' });
        
        const borrowedBooks = await supabase
            .from('borrow_records')
            .select('*', { count: 'exact' })
            .is('return_date', null);
        
        const todayBorrows = await supabase
            .from('borrow_records')
            .select('*', { count: 'exact' })
            .gte('borrow_date', new Date().toISOString().split('T')[0]);
        
        return {
            total: totalBooks.count || 0,
            borrowed: borrowedBooks.count || 0,
            todayBorrows: todayBorrows.count || 0
        };
    },

    // 获取逾期图书数量
    async getOverdueCount() {
        const today = new Date().toISOString().split('T')[0];
        const { count } = await supabase
            .from('borrow_records')
            .select('*', { count: 'exact' })
            .lt('due_date', today)
            .is('return_date', null);
        return count || 0;
    }
};