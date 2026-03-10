const CommonModule = (() => {

    // 轮播
    class SwiperController {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            if (!this.container) {
                console.warn(`Swiper容器 #${containerId} 未找到`);
                return;
            }

            // 初始化流程
            this.initElements();
            this.validateStructure(); 
            this.setupCloneSlides();
            this.initPagination();
            this.bindEvents();
            this.startAutoplay();
            this.handleVisibilityChange();
            this.handleResize();

            // 初始化懒加载
            setTimeout(() => CommonModule.lazy.init('a img'), 100);
        }

        initElements() {
            const links = this.container.querySelectorAll('.slide-track a');
            if (!links) {
                console.warn('轮播轨道元素未找到，请检查HTML结构');
                return false;
            }
            this.pagination = this.container.querySelector('.slidepage');
            this.track = this.container.querySelector('div');
            this.prevBtn = this.container.querySelector('#to_Left');
            this.nextBtn = this.container.querySelector('#to_Right');
            this.slides = Array.from(this.track.children);
            this.currentIndex = 1;
            this.autoplayInterval = null;
            this.isAnimating = false;
            this.slideWidth = this.track.offsetWidth;
        }

        validateStructure() {
            if (this.slides.length < 2) {
                console.warn('轮播需要至少2个幻灯片元素');
                return false;
            }
        }

        setupCloneSlides() {
            if (this.slides.length < 2) {
                console.warn('轮播需要至少2个幻灯片元素');
                return false;
            }
            // 深度克隆并保留数据属性
            const cloneFirst = this.slides[1].cloneNode(true);
            const cloneLast = this.slides[this.slides.length - 2].cloneNode(true);

            // 添加克隆标记
            cloneFirst.dataset.cloned = true;
            cloneLast.dataset.cloned = true;

            this.track.appendChild(cloneFirst);
            this.track.insertBefore(cloneLast, this.slides[0]);

            // 更新slides集合
            this.slides = Array.from(this.track.children);

            // 设置初始位置
            this.track.style.width = `${this.slideWidth * this.slides.length}px`;
            this.track.style.transform = `translateX(-${this.slideWidth * this.currentIndex}px)`;
        }

        initPagination() {
            this.pagination.innerHTML = '';
            const realSlidesCount = this.slides.length - 2;

            Array.from({ length: realSlidesCount }).forEach((_, index) => {
                const dot = document.createElement('li');
                dot.addEventListener('click', () => {
                    if (!this.isAnimating) this.goToSlide(index + 1);
                });
                this.pagination.appendChild(dot);
            });
            this.updatePagination();
        }

        bindEvents() {
            // 鼠标交互
            this.container.addEventListener('mouseenter', () => {
                this.pauseAutoplay();
                this.prevBtn.style.display = this.nextBtn.style.display = 'block';
            });

            this.container.addEventListener('mouseleave', () => {
                this.startAutoplay();
                this.prevBtn.style.display = this.nextBtn.style.display = 'none';
            });

            // 按钮控制
            this.prevBtn.addEventListener('click', () => this.prevSlide());
            this.nextBtn.addEventListener('click', () => this.nextSlide());

            // 键盘导航
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') this.prevSlide();
                if (e.key === 'ArrowRight') this.nextSlide();
            });
        }

        animateTrack(targetIndex) {
            return new Promise(resolve => {
                if (this.isAnimating) return;
                this.isAnimating = true;

                const start = performance.now();
                const startX = -this.currentIndex * this.slideWidth;
                const targetX = -targetIndex * this.slideWidth;
                const duration = 500;

                const animate = (now) => {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const easing = 1 - Math.pow(1 - progress, 3);

                    this.track.style.transform =
                        `translateX(${startX + (targetX - startX) * easing}px)`;

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        this.isAnimating = false;
                        this.handleSlideEnd(targetIndex);
                        resolve();
                    }
                };

                requestAnimationFrame(animate);
            });
        }

        updatePagination() {
            const realIndex = (this.currentIndex - 1 + (this.slides.length - 2)) % (this.slides.length - 2);
            Array.from(this.pagination.children).forEach((dot, index) => {
                dot.classList.toggle('swiper-active-switch', index === realIndex);
            });
        }

        handleSlideEnd(targetIndex) {
            const total = this.slides.length;

            // 无缝循环处理
            if (targetIndex >= total - 1) {
                this.currentIndex = 1;
                this.track.style.transition = 'none';
                this.track.style.transform = `translateX(-${this.currentIndex * this.slideWidth}px)`;
                setTimeout(() => this.track.style.transition = '', 10);
            } else if (targetIndex <= 0) {
                this.currentIndex = total - 2;
                this.track.style.transition = 'none';
                this.track.style.transform = `translateX(-${this.currentIndex * this.slideWidth}px)`;
                setTimeout(() => this.track.style.transition = '', 10);
            } else {
                this.currentIndex = targetIndex;
            }

            this.updatePagination();
        }

        async nextSlide() {
            await this.animateTrack(this.currentIndex + 1);
        }

        async prevSlide() {
            await this.animateTrack(this.currentIndex - 1);
        }

        async goToSlide(index) {
            const target = index + 1; // 补偿克隆元素
            await this.animateTrack(target);
        }

        startAutoplay() {
            this.autoplayInterval = setInterval(() => this.nextSlide(), 4000);
        }

        pauseAutoplay() {
            clearInterval(this.autoplayInterval);
        }

        handleVisibilityChange() {
            document.addEventListener('visibilitychange', () => {
                document.hidden ? this.pauseAutoplay() : this.startAutoplay();
            });
        }

        handleResize() {
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    this.slideWidth = this.container.offsetWidth;
                    this.track.style.width = `${this.slideWidth * this.slides.length}px`;
                    this.track.style.transform =
                        `translateX(-${this.currentIndex * this.slideWidth}px)`;
                }, 250);
            });
        }
    }

    // Cookie工具
    const CookieUtil = {
        set(name, value) {
            const expires = new Date(Date.now() + 864e5).toUTCString();
            document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/`;
        },
        get(name) {
            const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
            return match ? decodeURIComponent(match[2]) : null;
        }
    };

    // Token 管理
    const TokenManager = {
        getToken(iscookie = false) {
            if (iscookie) {
                return CookieUtil.get(sessionname ? sessionname : 'authToken');                
            } else {
                return localStorage.getItem(sessionname ? sessionname : 'authToken')
            }
        },
        setToken(token, iscookie = false) {
            if (iscookie) {
                CookieUtil.set(sessionname ? sessionname : 'authToken', token);                
            } else {
                localStorage.setItem(sessionname ? sessionname : 'authToken', token);
            }
        },
        clearToken() {
            localStorage.removeItem(sessionname ? sessionname : 'authToken');
            CookieUtil.set(sessionname ? sessionname : 'authToken', '', -1);
        }
    };

    // REST请求
    const ApiService = (() => {

        // 刷新令牌相关
        let isRefreshing = false;
        let refreshSubscribers = [];

        // 核心请求方法
        const request = async (config) => {
            // 合并配置
            const mergedConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    'Token': `${TokenManager.getToken(true)}`
                },
                ...config
            };
            try {
                const response = await $.ajax({
                    url: config.url,
                    method: config.method,
                    data: JSON.stringify(config.data),
                    headers: mergedConfig.headers,
                    dataType: 'json',
                    timeout: 30000
                });

                return handleResponse(response, mergedConfig);
            } catch (error) {
                return handleError(error);
            }
        };

        // 响应处理
        const handleResponse = (response, mergedConfig) => {
            if (response.code >= 400) {
                return handleTokenExpired(mergedConfig);
            }
            return response;
        };

        // 错误处理
        // 错误处理
        const handleError = async (error) => {
            // 网络错误处理
            if (!error.status) {
                console.error('网络错误:', error);
                return Promise.reject(error);
            }

            // 提取响应数据
            const response = error.responseJSON || {};

            // 其他错误
            console.error(`请求错误 [${error.status}]:`, error);
            return Promise.reject({
                code: response.code || error.status,
                message: response.message || error.statusText
            });
        };

        // 刷新 Token 方法（修正URL）
        const refreshToken = async () => {

            const response = await $.ajax({
                url: tokenurl,
                method: 'POST',
                data: {},
                dataType: 'json'
            });

            if (!response.data.token) {
                throw new Error('刷新令牌失败');
            }

            return response.data.token;
        };

        // Token 过期处理
        const handleTokenExpired = async (originalConfig) => {
            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    // 调用刷新 Token 接口
                    const newToken = await refreshToken();
                    TokenManager.setToken(newToken, true);

                    // 重试原始请求
                    originalConfig._retry = true;
                    originalConfig.headers.Token = newToken;
                    const retryResponse = await request(originalConfig);

                    // 处理等待中的请求
                    refreshSubscribers.forEach(subscriber => subscriber(newToken));
                    refreshSubscribers = [];

                    return retryResponse;
                } catch (refreshError) {
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }
            // 将请求加入等待队列
            return new Promise((resolve) => {
                refreshSubscribers.push((newToken) => {
                    originalConfig.headers.Token = newToken;
                    resolve(request(originalConfig));
                });
            });
        };

        // 公开方法
        return {
            get(url, config = {}) {
                return request({ ...config, url, method: 'GET' });
            },
            post(url, data, config = {}) {
                return request({ ...config, url, data, method: 'POST' });
            },
            put(url, data, config = {}) {
                return request({ ...config, url, data, method: 'PUT' });
            },
            delete(url, config = {}) {
                return request({ ...config, url, method: 'DELETE' });
            },
            request(config) {
                return request(config);
            }
        };
    })();

    // 滚动
    class ScrollController {
        static SCROLL_THRESHOLD = 800;
        static DEBOUNCE_DELAY = 100;

        constructor(containerId, options = {}) {
            this.headerElement = document.querySelector(containerId);
            this.lastScroll = 0;
            this.ticking = false;
            this.scrollCallback = options.scrollCallback;
            this.throttle = options.throttle || 100;
            this.init();
        }

        init() {
            let last = 0;
            const handler = () => {
                const now = Date.now();
                if (now - last >= this.throttle) {
                    this.handleScroll();
                    last = now;
                }
            };
            window.addEventListener('scroll', handler);
        }

        handleScroll() {
            this.lastScroll = window.pageYOffset || document.documentElement.scrollTop;

            if (!this.ticking) {
                window.requestAnimationFrame(() => {
                    this.updateHeaderState();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        }

        updateHeaderState() {
            const shouldShow = this.lastScroll >= ScrollController.SCROLL_THRESHOLD;
            if(this.headerElement) this.headerElement.classList.toggle('show', shouldShow);
        }
    }

    class LazyLoader {
        static RETINA_SUFFIX = '_276_200.jpg';

        static loadImage(imgElement) {
            const src = imgElement.dataset.srcRetina || imgElement.dataset.src;
            if (!src) return Promise.resolve();

            const processedSrc = src.replace(/_a(\.\w+)$/, `${this.RETINA_SUFFIX}$1`);

            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = processedSrc;
                img.onload = () => {
                    imgElement.src = processedSrc;
                    resolve();
                };
                img.onerror = reject;
            });
        }

        static init(selector = 'img[data-src]') {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img)
                            .catch(() => console.error('图片加载失败:', img.dataset.src))
                            .finally(() => observer.unobserve(img));
                    }
                });
            });

            $(selector).each((_, img) => observer.observe(img));
        }
    }

    class ContentInteraction {
        static init(containerSelector = '#content') {
            const container = $(containerSelector);

            container.on("mouseover", ".downLoad", function () {
                $(this).siblings(".dlCon").removeClass("hidden");
            }).on("mouseleave", ".downLoad", function () {
                $(this).siblings(".dlCon").addClass("hidden");
            }).on("mouseover", ".isLogged", function () {
                $(this).siblings(".suspend").removeClass("hidden");
            }).on("mouseleave", ".suspend", function () {
                $(this).addClass("hidden");
            });
            // 新增退出按钮监听
            container.on("click", ".exit", function (e) {
                e.preventDefault();
                dialog.confirm({
                    title: '退出提示',
                    message: '确定要退出当前账号吗？',
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    confirmCallback: () => {
                        UserService.logout();
                    },
                    cancelCallback: () => { }
                })
            });
        }
    }

    // 字符串处理工具
    const StringUtil = {
        truncate(text, maxLength, suffix = '') {
            return text && maxLength >= 1
                ? text.length > maxLength
                    ? text.slice(0, maxLength) + suffix
                    : text
                : '';
        }
    };

    // 日期格式化工具
    const DateUtil = {
        format(date, format) {
            const pad = n => n.toString().padStart(2, '0');
            const maps = {
                'M+': date.getMonth() + 1,
                'd+': date.getDate(),
                'H+': date.getHours(),
                'm+': date.getMinutes(),
                's+': date.getSeconds(),
                'q+': Math.floor((date.getMonth() + 3) / 3),
                'S': date.getMilliseconds()
            };

            if (/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, date.getFullYear().toString().slice(-RegExp.$1.length));
            }

            Object.entries(maps).forEach(([k, v]) => {
                if (new RegExp(`(${k})`).test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? v : pad(v));
                }
            });

            return format;
        }
    };

    // 错误提示函数
    const showError = function (elementId, message) {
        if (typeof elementId !== 'string' || !elementId) {
            console.error('必须提供有效的元素ID');
            return;
        }

        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`错误提示元素 #${elementId} 不存在`);
            return;
        }

        element.textContent = message || '发生未知错误';
        element.style.display = 'block';

        // 自动隐藏逻辑
        const timerId = setTimeout(() => {
            element.style.display = 'none';
            element.textContent = ''; // 清空内容
        }, 3000);

        // 返回取消方法
        return () => {
            clearTimeout(timerId);
            element.style.display = 'none';
        };
    };

    /**
     * 判断输入类型
     * @param {string} input 输入内容
     * @returns {object} 包含类型和验证结果的对象
     */
    const checkInputType = function checkInputType(input) {
        const value = input.trim();
        // 空值检查
        if (!value) return { valid: false, type: 'empty', message: '输入内容不能为空' };
        // 手机号正则 (中国大陆)
        const phoneRegex = /^1[3-9]\d{9}$/;
        // 邮箱正则 (基础验证)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        // 用户名正则 (4-20位字母数字下划线)
        const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
        // 检查优先级：手机号 > 邮箱 > 用户名
        if (phoneRegex.test(value)) {
            return {
                valid: true,
                type: 'phone',
                message: '手机号格式正确'
            };
        }
        if (emailRegex.test(value)) {
            return {
                valid: true,
                type: 'email',
                message: '邮箱格式正确'
            };
        }
        if (usernameRegex.test(value)) {
            return {
                valid: true,
                type: 'username',
                message: '用户名格式正确'
            };
        }
        // 未知类型
        return {
            valid: false,
            type: 'unknown',
            message: '无法识别的输入格式'
        };
    }

    class UserService {

        static init() {
            this.bindUserInfo();
        }

        static async bindUserInfo() {
            try {
                const res = await this.getUserInfo();
                if (res.code == 99) this.showLogin();
                if (res.code == 0) this.updateUI(res.data);
            } catch (error) {
                console.error('用户信息获取失败:', error);
                this.showLogin();
            }
        }

        static async getUserInfo() {
            return CommonModule.doRest.post(mineurl);
        }

        static updateUI(data) {
            const { userinfo } = data;
            if (!userinfo) return this.showLogin();
            this.updateAvatar(userinfo);
            this.updateNickname(userinfo);
            this.updateBalance(userinfo);
            this.showIsLogged();
            CommonModule.lazy.init('img[data-src]');
        }

        static updateAvatar(user) {
            const avatarUrl = `${user.headimgurl}`;
            $('.isLogged img').attr('data-src', avatarUrl);
        }

        static updateNickname(user) {
            const name = user.nickname || user.username;
            const truncated = StringUtil.truncate(name, 13, '...');
            $('.isLogged a').html(DOMPurify.sanitize(truncated));
        }

        static updateBalance(userinfo) {
            const html = `<em>${userinfo.coin}</em>金币`;
            $('.suspend span').html(DOMPurify.sanitize(html));
        }    

        static showLogin() {
            $('.isLogged').addClass('hidden');
            $('.login').removeClass('hidden');
        }

        static showIsLogged() {
            $('.isLogged').removeClass('hidden');
            $('.login').addClass('hidden');
        }

        static logout() {
            try {
                CommonModule.auth.clearToken();
                this.showLogin();
                dialog.toastSuccess('退出功能');
            } catch (error) {
                dialog.toastFail('退出失败，请重试');
            }
        }
    }

    return {
        swiper: (containerId) => new SwiperController(containerId),
        setCookie: CookieUtil.set,
        getCookie: CookieUtil.get,
        doRest: ApiService,
        scroll: (containerId) => new ScrollController(containerId),
        lazy: {
            init: (selector) => LazyLoader.init(selector)
        },
        content: {
            init: (selector) => ContentInteraction.init(selector)
        },
        auth: {
            setToken: (token, iscookie) => TokenManager.setToken(token, iscookie),
            getToken: (iscookie) => TokenManager.getToken(iscookie),
            clearToken: () => TokenManager.clearToken()
        },
        user: UserService,
        util: {
            string: StringUtil,
            date: DateUtil,
            showError: showError,
            checkInputType: checkInputType
        }
    };

})();

$(document).ready(() => {
    CommonModule.lazy.init();
    CommonModule.scroll('.headFix');
    CommonModule.content.init('#content');
});