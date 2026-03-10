!function() {
    // 内容交互控制器
    const ContentLoader = {
        container: $('#content'),
        
        init() {
            this.bindChangeEvent();
        },

        async loadContent(target) {
            try {
                const url = target.data('url');
                const type = target.data('type');
                let page = target.data('page');               

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
                    target.data('page', 1); // 修正分页重置写法
                } else {
                    target.data('page', page);
                }

                // 生成格式化HTML
                const limitedData = res.data.slice(0, 2); // 只取前两条
                if(limitedData.length <= 0) return false;
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
                target.parent().siblings(".bookLink").remove();
                const sanitizedContent = DOMPurify.sanitize(htmlContent);
                target.parent().after(sanitizedContent);

                // 初始化懒加载
                CommonModule.lazy.init('img[data-src]');
            } catch (error) {
                console.error('内容加载失败:', error.message);
                dialog.toastFail(`操作失败: ${error.message}`);
            }
        },
        
        // 绑定换源事件
        bindChangeEvent() {
            // 页面加载时自动执行
            this.loadContent(this.container.find('.change').first());
            // 点击事件绑定
            this.container.on('click', '.change', (e) => {
                this.loadContent($(e.currentTarget));
            });
        }
    };
    
    // 主初始化流程
    $(() => {
        ContentLoader.init();
        CommonModule.swiper('boxCenter');    
    });
}();