

// 新增：Token 管理工具函数
const TokenManager = {
    // 存储 Token 到 sessionStorage
    saveTokens: function(tokens) {
        const tokenData = {
            accessToken: tokens.access_token,                   //访问
            refreshToken: tokens.refresh_token,                 //刷新
            expireTime: new Date().getTime() + (30 * 60 * 1000) // 30有效期时间戳
        };
        sessionStorage.setItem('tokens', JSON.stringify(tokenData));        //JSON
    },


    getAccessToken: function() {
        const tokens = JSON.parse(sessionStorage.getItem('tokens') || '{}');
        // 检查 Token 是否过期
        if (tokens.accessToken && tokens.expireTime > new Date().getTime()) {
            return tokens.accessToken;
        }
        return null;
    },


    getRefreshToken: function() {

        try{
            const tokens = JSON.parse(sessionStorage.getItem('tokens') || '{}');
            return tokens.refreshToken || null;
        }
        catch(error){
            console.error('解析 refreshToken 失败:',error);
            this.clearTokens();
            return null;
        }


        const tokens = JSON.parse(sessionStorage.getItem('tokens') || '{}');
        return tokens.refreshToken || null;
    },

    // 清除所有 Token
    clearTokens: function() {
        sessionStorage.removeItem('tokens');
    },


    clearAllAuthData: function() {
    sessionStorage.removeItem('tokens');
    sessionStorage.removeItem('user');
}


};

// 新增：配置 axios 请求拦截器（添加 Token 到请求头）
//用于在请求发送前或响应返回后，对请求 / 响应进行全局处理。
// 这里使用的是响应拦截器（response.use），专门处理后端返回的响应（包括成功和失败的响应）
axios.interceptors.request.use(
    response => response,         // 成功
    error => {                    // 处理后端HTTP 401 状态码通常表示 “未授权”（如令牌过期、无效或未携带令牌）
        if(error.response && error.response.status === 401) {
            TokenManager.clearAllAuthData();        // 彻底清除登录状态
            window.location.href="/login1.html";
        }
        return Promise.reject(error);
    }
);

// 新增：配置 axios 响应拦截器（处理 Token 过期）
let isRefreshing = false;                            //标记是否在刷新token防止重复刷新
let requestQueue = [];                                  //存储等待Token刷新的请求队列

axios.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // 处理 401 未授权错误（Token 过期）
        if (error.response?.status === 401 && !originalRequest._retry) {        //且当前请求未重试过（_retry标记避免无限循环）
            // 如果正在刷新 Token，将请求加入队列
            if (isRefreshing) {
                return new Promise(resolve => {                        //用 Promise 包裹队列，确保请求按顺序等待，避免丢失。
                    requestQueue.push(() => resolve(axios(originalRequest)));
                });
            }

            originalRequest._retry = true;                      //标记已进入刷新流程
            isRefreshing = true;                                //刷新

            try {
                // 尝试使用刷新 Token 获取新 Token
                const refreshToken = TokenManager.getRefreshToken();
                if (!refreshToken) {
                    throw new Error('无刷新 Token');
                }

                const response = await axios.post('http://127.0.0.1:8000/refresh/', {
                    refresh_token: refreshToken
                });

                if (response.data.code === 200) {
                    // 保存新 Token
                    TokenManager.saveTokens({
                        access_token: response.data.access_token,
                        refresh_token: TokenManager.getRefreshToken() // 保持刷新 Token 不变
                    });

                    // 重新设置请求头，所有后续请求自动携带新Token
                    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;

                    // 执行队列中的请求
                    requestQueue.forEach(cb => cb());
                    requestQueue = [];

                    // 重试原始请求，失败
                    return axios(originalRequest);
                } else {
                    throw new Error('刷新 Token 失败');
                }
            } catch (refreshError) {
                // 刷新 Token 失败，需要重新登录
                TokenManager.clearTokens();
                sessionStorage.removeItem('user');
                alert('登录已过期，请重新登录');
                window.location.href = 'login1.html'; // login1.html
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);


let authMode = 'login'; // login | register

function login(role) {
    const name = document.getElementById("name").value;
    const pass = document.getElementById("password").value;

    // 1. 简单校验
    if (name === "" || pass === "") {
        document.getElementById("demo").innerHTML = "请输入合法的账号/密码";
        return false;
    }

    // 显示加载状态
    document.getElementById("demo").innerHTML = "正在登录...";

    // 2. 调用后端登录接口
    // 登录接口已迁移到 Django，使用相同的路径
    axios.post('http://127.0.0.1:8000/login/', {
        username: name,
        password: pass,
        role: role
    })
    .then(response => {

        console.log("登陆响应完整数据：",response.data);
        if (response.data.code === 200) {
            const userEntity = {
                username: name,
                token: response.data.access_token, // 改为存储 access_token
                refreshToken: response.data.refresh_token,
                loginTime: new Date().getTime()
            };
             //sessionStorage.setItem('user', JSON.stringify(userEntity)); 存入 sessions Storage

            // 保存 Token 到 TokenManager
            TokenManager.saveTokens({
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token
            });

            console.log('登录成功，存储的用户信息：', userEntity);
            console.log('存储的 Token 信息：', TokenManager.getAccessToken());

            // 页面跳转,500ms后跳转
            setTimeout(() => {
                window.location.href = "index.html?timestamp=" + new Date().getTime();
            }, 500);
        } else {
            document.getElementById("demo").innerHTML = response.data.msg || "登录失败";
        }
    })
    .catch(error => {
        console.error('请求出错：', error);
        const msg = error?.response?.data?.msg || "账号或密码错误请重试！";
        document.getElementById("demo").innerHTML = msg;
    });

    return false;
}

function register(role) {
    const name = document.getElementById("name").value;
    const pass = document.getElementById("password").value;
    const teacherNo = document.getElementById("teacherNo")?.value;
    const teacherName = document.getElementById("teacherName")?.value;
    const studentName = document.getElementById("studentName")?.value;
    const studentGender = document.getElementById("studentGender")?.value;
    const studentBirthday = document.getElementById("studentBirthday")?.value;
    const studentMobile = document.getElementById("studentMobile")?.value;
    const studentEmail = document.getElementById("studentEmail")?.value;
    const studentAddress = document.getElementById("studentAddress")?.value;

    // 1. 简单校验
    if (name === "" || pass === "") {
        document.getElementById("demo").innerHTML = "请输入合法的账号/密码";
        return;
    }

    // 学生注册：账号必须为学号（数字），并补齐学生档案信息（写入 Student 表）
    if (role === 'student') {
        if (!/^\d+$/.test(name.trim())) {
            document.getElementById("demo").innerHTML = "学生注册账号请填写学号（数字）";
            return;
        }
        if (!studentName || !studentName.trim()) {
            document.getElementById("demo").innerHTML = "学生注册请填写姓名";
            return;
        }
        if (studentGender !== '男' && studentGender !== '女') {
            document.getElementById("demo").innerHTML = "学生注册请选择性别";
            return;
        }
        if (!studentBirthday) {
            document.getElementById("demo").innerHTML = "学生注册请选择生日";
            return;
        }
    }

    // 显示加载状态
    document.getElementById("demo").innerHTML = "正在注册...";

    // 2. 调用后端注册接口
    // 注册接口已迁移到 Django，使用相同的路径
    axios.post('http://127.0.0.1:8000/register/', {
        username: name,
        password: pass,
        role: role,
        // 学生档案信息
        student_name: role === 'student' ? (studentName || '').trim() : undefined,
        gender: role === 'student' ? studentGender : undefined,
        birthday: role === 'student' ? studentBirthday : undefined,
        mobile: role === 'student' ? (studentMobile || '').trim() : undefined,
        email: role === 'student' ? (studentEmail || '').trim() : undefined,
        address: role === 'student' ? (studentAddress || '').trim() : undefined,
        // 教师信息（可选）
        teacher_no: role === 'teacher' ? ((teacherNo && teacherNo.trim()) ? teacherNo.trim() : name.trim()) : undefined,
        teacher_name: role === 'teacher' ? ((teacherName && teacherName.trim()) ? teacherName.trim() : name.trim()) : undefined,
    })
    .then(response => {
        if (response.data.code === 200) {
            // 注册成功后保存 Token（要求需要后端返回）
            if (response.data.access_token && response.data.refresh_token) {
                TokenManager.saveTokens({
                    access_token: response.data.access_token,
                    refresh_token: response.data.refresh_token
                });
            }
            document.getElementById("demo").innerHTML = response.data.msg || "注册成功，请登录";
        } else {
            document.getElementById("demo").innerHTML = response.data.msg || "注册失败";
        }
    })
    .catch(error => {
        console.error('注册请求出错：', error);
        const msg = error?.response?.data?.msg || "注册失败或用户已存在，请重试！";
        document.getElementById("demo").innerHTML = msg;
    });
}

function setAuthMode(mode) {
    authMode = mode;
    const regArea = document.getElementById('registerArea');
    if (regArea) regArea.style.display = mode === 'register' ? 'block' : 'none';

    // 清空提示
    const demo = document.getElementById('demo');
    if (demo) demo.innerHTML = '';
}

function setRegisterRole(role) {
    const student = document.getElementById('studentRegFields');
    const teacher = document.getElementById('teacherRegFields');
    if (!student || !teacher) return;
    if (role === 'teacher') {
        student.style.display = 'none';
        teacher.style.display = 'block';
    } else {
        student.style.display = 'block';
        teacher.style.display = 'none';
    }
}

function getSelectedRegisterRole() {
    const selected = document.querySelector('input[name="registerRole"]:checked');
    return selected?.value === 'teacher' ? 'teacher' : 'student';
}

// 登录按钮：登录模式提交登录；注册模式切回登录
window.loginAction = function () {
    if (authMode === 'login') {
        // 登录不强制选角色：后端会按账号的真实 role 下发 token
        return login(undefined);
    }
    setAuthMode('login');
};

// 注册按钮：登录模式展开注册；注册模式提交注册（按学生/教师选项）
window.registerAction = function () {
    if (authMode === 'login') {
        setAuthMode('register');
        // 默认展示学生注册字段
        setRegisterRole(getSelectedRegisterRole());
        return;
    }
    const role = getSelectedRegisterRole();
    setRegisterRole(role);
    return register(role);
};

window.addEventListener('load', () => {
    // 这个脚本也会被 index.html 引入；如果不在登录页，直接跳过 UI 绑定
    const nameEl = document.getElementById('name');
    const passEl = document.getElementById('password');
    const regArea = document.getElementById('registerArea');
    if (!nameEl || !passEl || !regArea) return;

    const radios = document.querySelectorAll('input[name="registerRole"]');
    radios.forEach((r) => {
        r.addEventListener('change', () => setRegisterRole(getSelectedRegisterRole()));
    });

    setAuthMode('login');
    setRegisterRole('student');
});

// 主动登出
window.logout = function () {
        TokenManager.clearTokens();
        sessionStorage.removeItem('token');
        window.location.href = 'login1.html';
}
