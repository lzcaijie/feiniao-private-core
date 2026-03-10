// 初始化通用模块
const PageManager = (() => {

    const LAZY_LOAD_DELAY = 50;

    // 容器初始化
    const initContainers = () => {
        // 轮播组件
        ['#myroundabout1', '#myroundabout2', '#myroundabout3', '#myroundabout4'].forEach(id => {
            setTimeout(() => roundaboutBox(id), LAZY_LOAD_DELAY);
        });
    };

    // 事件绑定
    const bindEvents = () => {
        // 复用内容模块交互
        $('#content').on('click', '.change', async function (e) {
            try {
                const $target = $(this);
                const url = $target.data('url');
                const type = $target.data('type');
                let page = $target.data('page');

                if (!url || !type) throw new Error('缺少必要参数');

                const res = await CommonModule.doRest.post(url, {
                    pagesize: 2,
                    pid: type,
                    page: page
                });

                // 数据处理
                if (!res?.data) throw new Error('响应数据结构异常');
                page++;
                // 更新分页状态
                if (res?.data[0]?.isendpage) {
                    $target.data('page', 1); // 修正分页重置写法
                } else {
                    $target.data('page', page);
                }

                // 生成格式化HTML
                const limitedData = res.data.slice(0, 2); // 只取前两条
                const htmlContent = limitedData.map(item => `
                    <a href="${item.url}" class="bookLink spBL">
                        <div class="bookImg">
                            <img src="/static/home/feiniao/images/coverBg.jpg" data-src="${item.images}">
                        </div>
                        <div class="bookIntro">
                            <em>${item.author}</em>
                            <h2>${item.title}</h2>
                            <span>${item.introduction}</span>
                        </div>
                    </a>
                `).join('');

                // 更新DOM
                $target.parent().siblings(".bookLink").remove();
                const sanitizedContent = DOMPurify.sanitize(htmlContent);
                $target.parent().after(sanitizedContent);

                // 初始化懒加载
                CommonModule.lazy.init('img[data-src]');
            } catch (error) {
                console.error('内容加载失败:', error.message);
                dialog.toastFail(`操作失败: ${error.message}`);
            }
        });
    };

    return {
        init: () => {
            initContainers();
            bindEvents();
            CommonModule.lazy.init('img[data-src]');   
        }
    };
})();
if($(window).width() < 1200){
    imgWidth = 25;//3d轮转书封向外的距离
} else {
    imgWidth = 30;//3d轮转书封向外的距离
}
window.roundaboutBox = function(e) {
    var t;
    t = document.body.clientWidth < 1200 ? .5 : .7;
    var n = function(e) {
        var t = parseFloat($(e).find(".roundabout-in-focus").data("id"))
          , n = $(e).parent().next().find("div");
        n.addClass("hidden"),
        n.eq(t).removeClass("hidden")
    };
    $(e).roundabout({
        duration: 500,
        autoplay: !0,
        autoplayDuration: 2e3,
        minOpacity: .5,
        maxOpacity: 1,
        minScale: t,
        reflect: !1,
        autoplayPauseOnHover: !0,
        easing: "swing",
        startingChild: 0,
        clickToFocus: !0,
        clickToFocusCallback: function() {
            n(e)
        },
        autoplayCallback: function() {
            n(e)
        }
    })
}
// 文档加载
$(document).ready(() => {
    PageManager.init();    
});