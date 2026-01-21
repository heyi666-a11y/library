// 简单的DeepSeek API测试脚本
const https = require('https');

const options = {
    hostname: 'api.deepseek.com',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-01742e9948a74acd8661fef50b247dbc'
    }
};

const req = https.request(options, (res) => {
    console.log(`状态码: ${res.statusCode}`);
    console.log(`响应头: ${JSON.stringify(res.headers)}`);
    
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (e) => {
    console.error(`请求错误: ${e.message}`);
});

// 写入请求体
req.write(JSON.stringify({
    model: 'deepseek-chat',
    messages: [{
        role: 'user',
        content: '请查询ISBN号为9787506365437的图书信息'
    }],
    temperature: 0.1
}));
req.end();
