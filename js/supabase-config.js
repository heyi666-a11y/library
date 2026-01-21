// Supabase配置文件
export const supabaseUrl = 'https://yzhnrtinfztdumfzuxvk.supabase.co';
export const supabaseKey = 'sb_publishable_yebBr2U45Y5yWMUzNcaBkw_NRaAwZEM';

// 初始化Supabase客户端
export const supabase = supabase.createClient(supabaseUrl, supabaseKey);