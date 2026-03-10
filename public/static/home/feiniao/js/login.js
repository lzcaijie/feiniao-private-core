// Tab切换功能
document.querySelectorAll('.tab-item').forEach(item => {
    item.addEventListener('click', function () {
        // 切换Tab样式
        document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        // 切换表单显示
        const tabType = this.dataset.tab;
        document.querySelectorAll('.login-form').forEach(form => {
            form.style.display = form.id === `${tabType}Form` ? 'block' : 'none';
        });
    });
});

// 发送验证码功能
let countdown = 60;
let timer = null;
const sendBtn = document.getElementById('sendCode');

sendBtn.addEventListener('click', async () => {
    const phone = document.getElementById('phone').value;
    const apiUrl = sendBtn.dataset.url; // 获取data-url属性
    // 手机号验证
    if (!/^1[3-9]\d{9}$/.test(phone)) {
        CommonModule.util.showError('phoneError', '请输入有效的手机号码');
        return;
    }
    try {
        // 调用发送验证码接口
        sendBtn.disabled = true;
        sendBtn.classList.add('disabled');
        // 模拟发送验证码
        const res = await CommonModule.doRest.post(apiUrl, { mobile: phone });        
        if (res.code == 0) {
            dialog.toastSuccess('验证码已发送');
            // 开始倒计时
            timer = setInterval(() => {
                sendBtn.textContent = `${countdown}秒后重发`;
                if (countdown-- <= 0) {
                    clearInterval(timer);
                    sendBtn.disabled = false;
                    sendBtn.classList.remove('disabled');
                    sendBtn.textContent = '获取验证码';
                    countdown = 60;
                }
            }, 1000);
        } else {
            throw new Error(res?.msg);
        }
    } catch (error) {
        dialog.toastFail(error);
        sendBtn.disabled = false;
        sendBtn.classList.remove('disabled');
    }
});

// 账号登录提交
document.getElementById('accountForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const account = document.getElementById('account').value;
    const password = document.getElementById('password').value;
    const apiUrl = e.target.dataset.url;
    const refererUrl = e.target.dataset.refererurl;

    // 表单验证
    if (!account) return CommonModule.util.showError('accountError', '请输入账号');
    if (!password) return CommonModule.util.showError('passwordError', '请输入密码');
    const result = CommonModule.util.checkInputType(account);  
    if (!result.valid) {
        CommonModule.util.showError(result.message);
        return;
    }
    let data;
    switch(result.type) {
        case 'phone':
            data = {
                mobile: account,
                password: password
            };
        break;
        case 'email':
            data = {
                email: account,
                password: password
            };
        break;
        case 'username':
            data = {
                username: account,
                password: password
            };
        break;
    }
    try {
        const res = await CommonModule.doRest.post(apiUrl, data);
        if (res.code == 0) {
            CommonModule.auth.setToken(res?.data?.token, true);
            dialog.toastSuccess('登录成功');
            setTimeout(() => window.location.href = refererUrl ? refererUrl : '/', 1500);
        } else {
            throw new Error(res?.msg);
        }
    } catch (error) {
        dialog.toastFail(error);
    }
});

// 短信登录提交
document.getElementById('smsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('phone').value;
    const code = document.getElementById('code').value;
    const apiUrl = e.target.dataset.url;
    const refererUrl = e.target.dataset.refererUrl;
    // 表单验证
    if (!/^1[3-9]\d{9}$/.test(phone)) return CommonModule.util.showError('phoneError', '手机号格式错误');
    if (!/^\d{6}$/.test(code)) return CommonModule.util.showError('codeError', '未获取验证码或验证码格式错误');
    try {
        const res = await CommonModule.doRest.post(apiUrl, {mobile: phone, code: code});
        if (res.code == 0) {
            CommonModule.auth.setToken(res?.data?.token, true);
            dialog.toastSuccess('登录成功');
            setTimeout(() => window.location.href = refererUrl ? refererUrl : '/', 1500);
        } else {
            throw new Error(res?.msg);
        }
    } catch (error) {
        dialog.toastFail(error);
    }
});