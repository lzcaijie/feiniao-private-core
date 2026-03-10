class Dialog {
    static defaultConfig = {
        maskOpacity: 0.6,
        animationDuration: 300,
        toastDuration: 1500,
        styles: {
            mask: 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1000;',
            modal: 'position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 1001;',
            toast: 'min-width: 300px; padding: 26px; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);'
        },
        classes: {
            mask: 'dialog-mask',
            modal: 'dialog-modal',
            closeBtn: 'dialog-close',
            toast: 'dialog-toast',
            toastIcon: 'dialog-toast-icon'
        }
    };

    constructor(options = {}) {
        this.options = { ...Dialog.defaultConfig, ...options };
        this.modal = null;
        this.mask = null;
        this.init();
    }

    init() {
        this.createElements();
        this.bindEvents();
        this.autoRemoveToast();
    }

    createElements() {
        // 创建遮罩层

        this.mask = this.createMask();
        document.body.appendChild(this.mask);

        // 创建模态框
        this.modal = this.createModal();

        // 创建内容
        const content = this.createContent();
        this.modal.appendChild(content);
        document.body.appendChild(this.modal);
    }

    createMask() {
        const mask = document.createElement('div');
        mask.className = this.options.classes.mask;
        mask.style.cssText = `
            ${this.options.styles.mask}
            background: rgba(0, 0, 0, ${this.options.maskOpacity});
            opacity: 0;
            transition: opacity ${this.options.animationDuration}ms;
        `;
        return mask;
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = this.options.classes.modal;
        modal.style.cssText = `
            ${this.options.styles.modal}
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
            transition: all ${this.options.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1);
        `;
        return modal;
    }

    createContent() {
        const fragment = document.createDocumentFragment();

        // 关闭按钮
        this.closeBtn = document.createElement('a');
        this.closeBtn.className = this.options.classes.closeBtn;
        this.closeBtn.innerHTML = '&times;';
        fragment.appendChild(this.closeBtn);

        // 标题
        if (this.options.title) {
            const title = document.createElement('div');
            title.style.cssText = 'text-align: center; font-size: 20px;';
            title.textContent = this.options.title;
            fragment.appendChild(title);
        }

        // 内容
        const message = document.createElement('p');
        message.style.cssText = 'font-size: 16px; text-align: center;';
        message.innerHTML = this.options.message || '这里是内容区域';
        fragment.appendChild(message);

        // 按钮组
        if (this.options.type === 2) {
            const buttons = this.createButtons();
            fragment.appendChild(buttons);
        }

        return fragment;
    }

    createButtons() {
        const container = document.createElement('div');
        container.style.cssText = 'text-align: center; margin-top: 20px;';

        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = this.options.confirmButtonText || '确认';
        confirmBtn.onclick = () => this.handleConfirm();

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = this.options.cancelButtonText || '取消';
        cancelBtn.onclick = () => this.handleCancel();

        container.appendChild(confirmBtn);
        container.appendChild(cancelBtn);

        return container;
    }

    bindEvents() {
        // 绑定关闭按钮事件
        this.closeBtn.addEventListener('click', () => this.close());

        // 遮罩点击事件
        if (this.options.maskClosable) {
            this.mask.addEventListener('click', () => this.close());
        }

        // 显示动画
        setTimeout(() => {
            this.mask.style.opacity = '1';
            this.modal.style.opacity = '1';
            this.modal.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 50);
    }

    handleConfirm() {
        this.options.confirmCallback?.();
        this.close();
    }

    handleCancel() {
        this.options.cancelCallback?.();
        this.close();
    }

    close() {
        // 关闭动画
        this.mask.style.opacity = '0';
        this.modal.style.opacity = '0';
        this.modal.style.transform = 'translate(-50%, -50%) scale(0.8)';

        // 动画完成后移除元素
        setTimeout(() => {
            this.mask.remove();
            this.modal.remove();
        }, this.options.animationDuration);
    }

    autoRemoveToast() {
        if (this.options.toast) {
            setTimeout(() => this.close(), this.options.duration || this.options.toastDuration);
        }
    }

    /* 静态方法 */
    static alert(options) {
        return new Dialog({ ...options, type: 1 });
    }

    static confirm(options) {
        return new Dialog({ ...options, type: 2 });
    }

    static toast(options) {
        const instance = new Dialog({
            ...options,
            toast: true,
            mask: false,       // 禁用遮罩层
            maskClosable: false,
            type: 3            // 新增 toast 类型
        });

        // 创建内容容器
        const contentWrapper = document.createElement('div');
        contentWrapper.style.display = 'flex';
        contentWrapper.style.alignItems = 'center';
        contentWrapper.style.gap = '12px';

        // 创建图标
        const icon = document.createElement('span');
        icon.className = this.defaultConfig.classes.toastIcon;
        icon.style.cssText = `
            flex-shrink: 0;
            font-size: 24px;
            color: ${options.type === 1 ? '#4CAF50' : '#F44336'};
        `;
        icon.textContent = options.type === 1 ? '✓' : '✕';

        // 创建文字内容
        const text = document.createElement('div');
        text.textContent = options.message;
        text.style.cssText = `
            color: ${options.type === 1 ? '#4CAF50' : '#F44336'};
            font-size: 14px;
            line-height: 1.5;
        `;

        // 组装结构
        contentWrapper.appendChild(icon);
        contentWrapper.appendChild(text);

        // 清空原有内容并插入新结构
        instance.modal.innerHTML = '';
        instance.modal.appendChild(contentWrapper);

        // 特殊样式处理
        instance.modal.style.cssText += `
            min-width: auto;
            padding: 12px 20px;
            background: ${options.type === 1 ?
                'rgba(255, 255, 255, 1)' :
                'rgba(255, 255, 255, 1)'};
            border-radius: 8px;
            backdrop-filter: blur(4px);
        `;

        return instance;
    }

    static toastSuccess(message) {
        return this.toast({ type: 1, message });
    }

    static toastFail(message) {
        return this.toast({ type: 2, message });
    }
}

// 暴露接口
window.dialog = {
    alert: (options) => Dialog.alert(options),
    confirm: (options) => Dialog.confirm(options),
    toast: (options) => Dialog.toast(options),
    toastSuccess: (message) => Dialog.toastSuccess(message),
    toastFail: (message) => Dialog.toastFail(message)
};