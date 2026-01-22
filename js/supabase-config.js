// Supabase配置文件
// 注意：这个文件只在图书馆系统中使用，总系统不依赖它
// 图书馆系统将通过全局对象使用这个文件

// 将配置暴露到全局对象上
window.supabaseConfig = {
    url: 'https://yzhnrtinfztdumfzuxvk.supabase.co',
    key: 'sb_publishable_yebBr2U45Y5yWMUzNcaBkw_NRaAwZEM'
};

// 直接初始化Supabase客户端，避免后续复杂的初始化逻辑
if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
    console.log('直接在supabase-config.js中初始化Supabase客户端');
    const { createClient } = window.supabase;
    window.supabaseInstance = createClient(window.supabaseConfig.url, window.supabaseConfig.key);
}