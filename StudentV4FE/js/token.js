import {jwtDecode} from '../../node_modules/jwt-decode/build/esm/index.js'; //未使用打包工具（如 Webpack、Vite）处理模块路径，注意

window.onload = function() {                                    //当整个页面（包括所有资源如图片、脚本）加载完成后，触发此回调函数

    const decode = TokenManager.getAccessToken();
    console.log('前端收到的token：',decode);
    const k = jwtDecode(decode);                        //使用 jwt-decode 库解析存储在本地的 JWT 令牌。
    console.log("token返回的用户名为: ",k.username);     // header.payload.signature
    const displayName = k.display_name || k.displayName || k.username;


    // const userStr = sessionStorage.getItem('user'); // 从 user 中获取
    const userWelcomeElement = document.getElementById('userWelcome');
        // const decode = TokenManager.getAccessToken();
        // const k = jwtDecode(decode);
        // const username = k.username;

        if (displayName) {
            userWelcomeElement.textContent = `亲爱的 ${displayName} ，欢迎您！`;
        } else {
            console.error('用户信息中不包含 username');
            userWelcomeElement.textContent = '请先登录';
        }

};