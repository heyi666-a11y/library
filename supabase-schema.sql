-- Supabase数据表创建脚本
-- 在Supabase控制台的SQL编辑器中执行此脚本

-- 1. 创建图书表
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    publisher VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'in',
    copies INTEGER NOT NULL DEFAULT 1,
    available INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建读者表
CREATE TABLE IF NOT EXISTS readers (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    class VARCHAR(20) NOT NULL,
    borrow_count INTEGER NOT NULL DEFAULT 0,
    overdue_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建借阅记录表
CREATE TABLE IF NOT EXISTS borrow_records (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL REFERENCES readers(id),
    student_name VARCHAR(100) NOT NULL,
    book_id INTEGER NOT NULL REFERENCES books(id),
    book_title VARCHAR(255) NOT NULL,
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'borrowed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建公告表
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    date DATE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);

CREATE INDEX IF NOT EXISTS idx_borrow_records_student_id ON borrow_records(student_id);
CREATE INDEX IF NOT EXISTS idx_borrow_records_book_id ON borrow_records(book_id);
CREATE INDEX IF NOT EXISTS idx_borrow_records_status ON borrow_records(status);
CREATE INDEX IF NOT EXISTS idx_borrow_records_due_date ON borrow_records(due_date);

CREATE INDEX IF NOT EXISTS idx_announcements_date ON announcements(date);

-- 6. 插入示例数据
-- 插入示例图书
INSERT INTO books (title, author, isbn, category, publisher, copies, available) VALUES
('JavaScript高级程序设计', 'Nicholas C. Zakas', '9787115421880', '计算机', '人民邮电出版社', 5, 5),
('CSS权威指南', 'Eric A. Meyer', '9787115526247', '计算机', '人民邮电出版社', 3, 2),
('HTML5与CSS3权威指南', '陆凌牛', '9787115407304', '计算机', '人民邮电出版社', 4, 4),
('Python编程：从入门到实践', 'Eric Matthes', '9787115428028', '计算机', '人民邮电出版社', 6, 3),
('算法导论', 'Thomas H. Cormen', '9787111407010', '计算机', '机械工业出版社', 2, 1),
('活着', '余华', '9787506365437', '文学', '作家出版社', 10, 8),
('百年孤独', 'Gabriel García Márquez', '9787544270878', '文学', '南海出版公司', 5, 3),
('追风筝的人', 'Khaled Hosseini', '9787544248457', '文学', '南海出版公司', 8, 6),
('经济学原理', 'N. Gregory Mankiw', '9787301256909', '经济', '北京大学出版社', 4, 2),
('心理学与生活', 'Richard J. Gerrig', '9787115416316', '心理学', '人民邮电出版社', 3, 3)
ON CONFLICT (isbn) DO NOTHING;

-- 插入示例读者
INSERT INTO readers (id, name, grade, class, borrow_count, overdue_count) VALUES
('20210001', '张三', '高一', '1班', 2, 0),
('20210002', '李四', '高一', '1班', 1, 1),
('20210003', '王五', '高一', '2班', 3, 0),
('20220001', '赵六', '高二', '1班', 0, 0),
('20220002', '孙七', '高二', '2班', 2, 0),
('20230001', '周八', '高三', '1班', 1, 0)
ON CONFLICT (id) DO NOTHING;

-- 插入示例借阅记录
INSERT INTO borrow_records (student_id, student_name, book_id, book_title, borrow_date, due_date, status) VALUES
('20210001', '张三', 2, 'CSS权威指南', '2024-12-01', '2025-01-01', 'borrowed'),
('20210001', '张三', 4, 'Python编程：从入门到实践', '2024-12-10', '2025-01-10', 'borrowed'),
('20210002', '李四', 5, '算法导论', '2024-11-15', '2024-12-15', 'overdue'),
('20210003', '王五', 6, '活着', '2024-12-05', '2025-01-05', 'borrowed'),
('20210003', '王五', 7, '百年孤独', '2024-12-08', '2025-01-08', 'borrowed'),
('20210003', '王五', 8, '追风筝的人', '2024-12-12', '2025-01-12', 'borrowed'),
('20220002', '孙七', 9, '经济学原理', '2024-12-03', '2025-01-03', 'borrowed'),
('20220002', '孙七', 10, '心理学与生活', '2024-12-07', '2025-01-07', 'borrowed'),
('20230001', '周八', 1, 'JavaScript高级程序设计', '2024-12-15', '2025-01-15', 'borrowed')
ON CONFLICT DO NOTHING;

-- 插入示例公告
INSERT INTO announcements (title, content, date) VALUES
('图书馆开馆通知', '图书馆将于2024年12月20日正式开馆，欢迎广大师生前来借阅。', '2024-12-15'),
('新书推荐', '近期新增了一批计算机类图书，包括JavaScript高级程序设计等经典著作。', '2024-12-10')
ON CONFLICT DO NOTHING;

-- 7. 创建触发器以自动更新updated_at字段

-- 为books表创建更新触发器
CREATE OR REPLACE FUNCTION update_books_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_books_updated_at_trigger
BEFORE UPDATE ON books
FOR EACH ROW
EXECUTE FUNCTION update_books_updated_at();

-- 为readers表创建更新触发器
CREATE OR REPLACE FUNCTION update_readers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_readers_updated_at_trigger
BEFORE UPDATE ON readers
FOR EACH ROW
EXECUTE FUNCTION update_readers_updated_at();

-- 为borrow_records表创建更新触发器
CREATE OR REPLACE FUNCTION update_borrow_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_borrow_records_updated_at_trigger
BEFORE UPDATE ON borrow_records
FOR EACH ROW
EXECUTE FUNCTION update_borrow_records_updated_at();

-- 为announcements表创建更新触发器
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_announcements_updated_at_trigger
BEFORE UPDATE ON announcements
FOR EACH ROW
EXECUTE FUNCTION update_announcements_updated_at();

-- 8. 创建借阅记录状态更新触发器
-- 当归还日期被设置时，自动更新状态为returned
CREATE OR REPLACE FUNCTION update_borrow_record_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.return_date IS NOT NULL AND OLD.return_date IS NULL THEN
        NEW.status = 'returned';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_borrow_record_status_trigger
BEFORE UPDATE ON borrow_records
FOR EACH ROW
EXECUTE FUNCTION update_borrow_record_status();