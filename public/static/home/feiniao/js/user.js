const ContentController = (() => {
    const DOM = {
        content: '#content',
        modalBg: '.box_shadow_bg',
        delModal: '.delbook',
    };

    // 复选框状态管理
    const toggleCheckState = (target) => {
        const isBatch = target.classList.contains('select_allbtn');
        const checkboxes = Array.from(document.querySelectorAll('.check_btn'));
        console.log('select_allbtn');
        if (isBatch) {
            const isAllSelected = !target.classList.toggle('on_btn');
            checkboxes.forEach(checkbox => checkbox.classList.toggle('on_btn', isAllSelected));
        } else {
            target.classList.toggle('on_btn');
        }

        const anySelected = checkboxes.some(c => c.classList.contains('on_btn'));
        document.querySelector('.delBtn').classList.toggle('del_btn', anySelected);
    };

    // 删除操作
    const handleDelete = async () => {
        const selectedItems = Array.from(document.querySelectorAll('.on_btn'))
            .map(btn => btn.dataset.bookid)
            .filter(Boolean);

        if (selectedItems.length === 0) {
            return CommonModule.util.showError('delError', '请选择要删除的项目');
        }
        try {
            dialog.confirm({
                title: '操作提示',
                message: '确定要删除吗？',
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                confirmCallback: async () => {
                    const result = await CommonModule.doRest.post(dlt, { ids: selectedItems });
                    if (result.status === 200) {
                        window.location.href = reloadUrl;
                    }
                },
                cancelCallback: () => { }
            })
            
        } catch (error) {
            toggleModal('error', true);
            console.error('删除失败:', error);
        }
    };

    // 全选/反选功能
    const handleSelectAll = (target) => {
        // 获取所有可操作的复选框
        const checkboxes = Array.from(document.querySelectorAll('.td_con .check_btn:not(.select_allbtn)'));
        const isSelectAll = !target.classList.contains('on_btn');

        // 批量设置选择状态
        checkboxes.forEach(checkbox => {
            checkbox.classList.toggle('on_btn', isSelectAll);
        });

        // 更新全选按钮状态
        target.classList.toggle('on_btn', isSelectAll);

        // 更新删除按钮状态
        const anySelected = checkboxes.some(c => c.classList.contains('on_btn'));
        document.querySelector('.delBtn').classList.toggle('del_btn', anySelected);
    };

    // 事件委托处理
    const handleDelegateEvent = (event) => {
        const target = event.target;
        const handlers = {
            // 单个复选框点击
            check_btn: () => {
                if (!target.classList.contains('select_allbtn')) {
                    toggleCheckState(target);
                }
            },
            // 全选按钮点击
            select_allbtn: () => handleSelectAll(target.closest('.select_allbtn')),
            // 删除操作
            del_btn: () => handleDelete(),
        };
        Object.entries(handlers).forEach(([className, handler]) => {
            const element = target.closest(`.${className}`);
            if (element) {
                event.preventDefault();
                handler(element);
            }
        });
    };

    // 模态框控制
    const toggleModal = (type, show) => {
        // 安全获取元素
        const getSafeElement = (selector) => {
            const el = document.querySelector(selector);
            if (!el) {
                console.error(`元素未找到: ${selector}`);
                return null;
            }
            return el;
        };
    
        const modal = getSafeElement(type === 'buy' ? DOM.buyModal : DOM.delModal);
        const bg = getSafeElement(DOM.modalBg);
    
        // 防御性操作
        [modal, bg].forEach(el => {
            if (el) el.classList.toggle('hidden', !show);
        });
    
        // 动态创建兜底元素
        if (!modal) {
            console.warn('弹窗元素不存在，自动创建');
            const fallbackModal = document.createElement('div');
            fallbackModal.className = type === 'buy' ? 'buyed' : 'delbook';
            document.body.appendChild(fallbackModal);
            fallbackModal.classList.toggle('hidden', !show);
        }
    };

    // 初始化
    const init = () => {
        // 事件监听
        const container = document.querySelector(DOM.content);
        container.addEventListener('click', handleDelegateEvent);
    };

    return { init };
})();

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    ContentController.init();
});