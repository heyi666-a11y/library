-- 创建借阅参数设置表
CREATE TABLE IF NOT EXISTS library_settings (
    id SERIAL PRIMARY KEY,
    setting_name VARCHAR(50) NOT NULL UNIQUE,
    setting_value VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_library_settings_updated_at
BEFORE UPDATE ON library_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 插入默认借阅参数
INSERT INTO library_settings (setting_name, setting_value, description) VALUES
('borrow_limit', '5', '学生最大借阅数量'),
('borrow_duration', '30', '借阅天数限制'),
('overdue_fine', '1', '每日逾期罚款（元）'),
('renew_limit', '2', '最大续借次数'),
('renew_duration', '15', '每次续借天数')
ON CONFLICT (setting_name) DO NOTHING;

-- 授予权限
GRANT ALL ON library_settings TO authenticated;
GRANT ALL ON library_settings_id_seq TO authenticated;