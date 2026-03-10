const { 
    auth, 
    doRest, 
    lazy, 
    user, 
    content
} = CommonModule;

// 初始化通用模块
$(function() {
    // 初始化通用内容交互
    content.init('#content');
    // 初始化用户状态
    user.init();
    // 初始化懒加载
    lazy.init('img[data-src]');
    if (auth.getToken(true)) {
        bookinfo();
    }
});

// 验证作者关注状态
async function bookinfo() {
    try {
        const $container = $('.tabTopBox');
        const authorId = $container.data('author-id');
        const bookId = $container.data('book-id');
        const API = $container.data('bookinfo-api');
        if (!bookId || !authorId || !API) return;
        const res = await doRest.post(API, {id: bookId});
        if (res?.code === 0) {
            if (res?.data?.follow) {
                $('.follow-btn').addClass('followed').text('已关注');
            }
            if (res?.data?.fav) {
                $('.bookshelf').addClass('bookshelfed').text('已加入书架');
            }
            if (res?.data?.continueread) {
                $('.read').attr('href', res.data.chapter_url).text('继续阅读');
            }
        }
    } catch (err) {
        dialog.toastFail(JSON.stringify(err));
        console.error('失败:', err);
    }
}
// --------------------- 事件处理统一管理 ---------------------
const BookInteraction = {
    init(container) {
        this.container = $(container);
        this.bindEvents();
    },

    bindEvents() {
        this.container
            // 二维码展示
            .on('mouseenter', '.code a', this.handleCodeHover)
            .on('mouseleave', '.code a', this.handleCodeLeave)
            // 书架操作
            .on('click', '.bookshelf', this.handleAddToShelf.bind(this))
            // Tab切换
            .on('click', '.tabList span', this.handleTabSwitch)
            // 下载
            .on('click', '.txtdownload', this.handleDownload.bind(this))
            // 关注|取关
            .on('click', '.follow-btn', this.handleFollow.bind(this));
    },

    // 二维码展示/隐藏
    handleCodeHover(e) {
        $(e.currentTarget).siblings('.codeBox').removeClass('hidden');
    },
    
    handleCodeLeave(e) {
        $(e.currentTarget).siblings('.codeBox').addClass('hidden');
    },

    // 加入书架
    async handleAddToShelf(e) {
        const $btn = $(e.currentTarget);
        const API = $btn.data('api');
        const bookid = $btn.data('bookid');  
        try {           
            const res = await doRest.post(API, {bookid: bookid});
            if(res?.code !== 0) throw { code: res?.code, msg: res?.msg || '操作失败' };
            const $collectCount = $('.authorList div:last-child em');
            const currentCollect = parseInt($collectCount.text()) || 0;
            if ($btn.hasClass('bookshelfed')){
                $btn.removeClass('bookshelfed').text('加入书架');
                $collectCount.text(Math.max(currentCollect - 1, 0));
                dialog.toastSuccess('取消成功');
            } else {
                $btn.addClass('bookshelfed').text('已加入书架');
                $collectCount.text(currentCollect + 1);
                dialog.toastSuccess('加入成功');
            }       
        } catch (err) {
            dialog.toastFail(err.msg);
        }
    },

    // Tab切换
    handleTabSwitch(e) {
        const $tab = $(e.currentTarget);
        $('.tabList span').removeClass('current');
        $tab.addClass('current');

        const showDirectory = $tab.hasClass('directory');
        $('.lfO').toggleClass('hidden', showDirectory);
        $('.lfT').toggleClass('hidden', !showDirectory);

        if ($tab.hasClass('commentsSection')) {
            $('html, body').animate({
                scrollTop: $('#comments').offset().top
            }, 500);
        }
    },

    // 关注/取消关注处理
    async handleFollow(e) {
        const $btn = $(e.currentTarget);
        const API = $btn.data('api');
        const authorid = $btn.data('authorid'); 
        try {
            const res = await doRest.post(API, {"from_id": authorid, "type": 1});
            if(res?.code !== 0) throw { code: res?.code, msg: res?.msg || '操作失败' };
             // 更新粉丝数
             const $fansCount = $('.authorList .m em');
             const currentFans = parseInt($fansCount.text()) || 0;
            if ($btn.hasClass('followed')){
                $btn.removeClass('followed').text('关注');
                $fansCount.text(Math.max(currentFans - 1, 0)); // 防止负数
                dialog.toastSuccess('取关成功');
            } else {
                $btn.addClass('followed').text('已关注');
                $('.authorList div').eq(1).find('em');
                $fansCount.text(currentFans + 1);
                dialog.toastSuccess('关注成功');
            }            
        } catch (err) {
            dialog.toastFail(err.msg);
        }
    },

    // 统一处理下载操作
    async handleDownload(e) {
        e.preventDefault();
        const $target = $(e.currentTarget);
        const downloadType = $target.data('type'); // txt/epub 等类型
        const txt_download_open = $target.data('txt_download_open'); //权限
        const bookid = $target.data('bookid');
        const API = $target.data('api');        
        try {
            if(!txt_download_open) throw { code: 403, msg: '禁止下载' };            
            const res = await doRest.post(API, {
                bookid,
                type: downloadType
            });
            if(res?.code !== 0) throw { code: res?.code, msg: res?.msg || '下载失败' };
            if(!res?.data?.url) throw { code: 403, msg: res?.msg || '无下载链接' };
            this.startDownload(res.data.url);
        } catch (err) {
            dialog.toastFail(err.msg);
        }
    },
    startDownload(url) {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);
        setTimeout(() => iframe.remove(), 5000);
    },
};

// 初始化书籍交互
BookInteraction.init('#content');

$('#qrcode').qrcode({
    render: "canvas",
    width: 115,
    height: 115,
    text: $('#qrcode').data('code')
});