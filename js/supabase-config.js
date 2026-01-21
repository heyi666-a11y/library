// Supabase配置文件
export const supabaseUrl = 'YOUR_SUPABASE_URL';
export const supabaseKey = 'YOUR_SUPABASE_PUBLISHABLE_KEY';

// 初始化Supabase客户端 - 使用真实的Supabase SDK
// 从window.supabase对象中获取createClient函数
const { createClient } = window.supabase;
export const supabase = createClient(supabaseUrl, supabaseKey);