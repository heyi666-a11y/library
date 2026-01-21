// Supabase配置文件
export const supabaseUrl = 'https://yzhnrtinfztdumfzuxvk.supabase.co';
export const supabaseKey = 'sb_publishable_yebBr2U45Y5yWMUzNcaBkw_NRaAwZEM';

// 初始化Supabase客户端 - 使用真实的Supabase SDK
// 从window.supabase对象中获取createClient函数
const { createClient } = window.supabase;
export const supabase = createClient(supabaseUrl, supabaseKey);