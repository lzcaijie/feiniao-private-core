
// 协议弹窗
function showUserProtocol() {
    dialog.alert({
        title: '用户协议',
        message: protocolContent.userProtocol,
        maskClosable: true,
        styles: {
            modal: 'min-width: 600px;'
        }
    });
}

function showPrivacyPolicy() {
    dialog.alert({
        title: '隐私政策',
        message: protocolContent.privacyPolicy,
        maskClosable: true,
        styles: {
            modal: 'min-width: 600px;'
        }
    });
}

// 表单验证
const registerForm = document.getElementById('registerForm');
const agreeCheckbox = document.getElementById('agreeProtocol');
const submitBtn = document.querySelector('#registerForm .submit-btn');

// 协议勾选状态变化
agreeCheckbox.addEventListener('change', () => {
    if (!agreeCheckbox.checked) {
        CommonModule.util.showError('protocolError', '请阅读并同意用户协议');
    } else {
        document.getElementById('protocolError').style.display = 'none';
    }
});

// 表单提交
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
        const apiUrl = e.target.dataset.url;
        const loginUrl = e.target.dataset.loginurl;
        const formData = {
            username: document.getElementById('account').value.trim(),
            nickname: document.getElementById('nickname').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            invite_code: CommonModule.getCookie(sessioninvitename),
            isapp: 1
        };
        const res = await CommonModule.doRest.post(apiUrl, formData);
        if (res.code === 0) {
            dialog.toastSuccess('注册成功，请登录！');
            setTimeout(() => {
                window.location.href = loginUrl;
            }, 1500);
        } else {
            throw new Error(res.msg || '注册失败');
        }
    } catch (error) {
        dialog.toastFail(error);
    }
});

// 验证逻辑
function validateForm() {
    let isValid = true;
    const account = document.getElementById('account').value.trim();
    const nickname = document.getElementById('nickname').value.trim();
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;

    // 账号验证
    const accountType = CommonModule.util.checkInputType(account);
    if (!accountType.valid) {
        CommonModule.util.showError('accountError', '请输入有效的手机号/邮箱/用户名');
        isValid = false;
    } else {
        clearError('accountError');
    }

    // 昵称验证
    if (nickname.length < 2 || nickname.length > 10) {
        CommonModule.util.showError('nicknameError', '昵称长度为2-10个字符');
        isValid = false;
    } else {
        clearError('nicknameError');
    }

    // 密码验证
    if (password.length < 6 || password.length > 16) {
        CommonModule.util.showError('passwordError', '密码长度为6-16位');
        isValid = false;
    } else {
        clearError('passwordError');
    }

    // 确认密码
    if (password !== confirm) {
        CommonModule.util.showError('confirmError', '两次输入的密码不一致');
        isValid = false;
    } else {
        clearError('confirmError');
    }

    // 协议勾选
    if (!agreeCheckbox.checked) {
        CommonModule.util.showError('protocolError', '请阅读并同意用户协议');
        isValid = false;
    } else {
        clearError('protocolError');
    }

    return isValid;
}

function clearError(id) {
    document.getElementById(id).style.display = 'none';
}