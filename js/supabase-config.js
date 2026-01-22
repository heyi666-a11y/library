// Supabase配置文件
export const supabaseUrl = 'YOUR_SUPABASE_URL';
export const supabaseKey = 'YOUR_SUPABASE_PUBLISHABLE_KEY';

// 初始化Supabase客户端 - 安全处理，确保网站基本功能正常工作
export let supabase = null;

try {
    // 检查是否通过CDN加载了Supabase SDK
    if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
        const { createClient } = window.supabase;
        supabase = createClient(supabaseUrl, supabaseKey);
    } else if (typeof supabase !== 'undefined') {
        // 处理其他可能的Supabase SDK加载方式
        supabase = supabase.createClient(supabaseUrl, supabaseKey);
    } else {
        // 降级处理：如果没有Supabase SDK，提供一个空对象，确保网站基本功能（如页面切换）仍然可用
        supabase = {
            from: () => ({
                select: () => Promise.resolve([]),
                insert: () => Promise.resolve({ data: [], error: null }),
                update: () => Promise.resolve({ data: [], error: null }),
                delete: () => Promise.resolve({ data: [], error: null })
            }),
            auth: {
                signInWithPassword: () => Promise.resolve({ data: null, error: null }),
                signOut: () => Promise.resolve({ error: null })
            }
        };
        console.warn('Supabase SDK未加载，已启用降级模式，网站基本功能仍可使用');
    }
} catch (error) {
    // 捕获所有错误，确保网站基本功能正常工作
    supabase = {
        from: () => ({
            select: () => Promise.resolve([]),
            insert: () => Promise.resolve({ data: [], error: null }),
            update: () => Promise.resolve({ data: [], error: null }),
            delete: () => Promise.resolve({ data: [], error: null })
        }),
        auth: {
            signInWithPassword: () => Promise.resolve({ data: null, error: null }),
            signOut: () => Promise.resolve({ error: null })
        }
    };
    console.warn('Supabase初始化失败，已启用降级模式，网站基本功能仍可使用:', error);
}