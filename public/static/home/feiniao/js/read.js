// ================== 核心模块初始化 ==================
const ApiService = CommonModule.doRest;
const LazyLoader = CommonModule.lazy;

// ================== 页面初始化 ==================
$(document).ready(() => {
  CommonModule.lazy.init();
  CommonModule.scroll('.headFix');
  CommonModule.content.init('#content');

  // 确保初始化顺序
  ReaderController.init();
  StyleManager.init();
});

// ================== 阅读器核心功能 ==================
class ReaderController {
  static init() {
    this.container = $("#content");
    this.bookId = this.container.data("bookid");
    this.chapterId = this.container.data("chapterid");
    this.initSettings();
    this.bindEvents();
    this.loadContent();
    this.catalogueState = false;
    this.handleDirectory = () => {
      if (this.catalogueState) {
        this.togglePanel(false, 'catalogue');
      } else {
        this.loadCatalogue();
      }
    };
  }

  static loadContent() {
    ChapterLoader.init();
  }

  static initSettings() {
    this.prevWidth = CommonModule.getCookie("screen_width") || "900";
    this.prevBgColor = CommonModule.getCookie("bg_color") || "brown";
    this.prevFontSize = CommonModule.getCookie("font_size") || "18";
    this.applySettings();
  }

  static applySettings() {
    this.container.removeClass().addClass(`w${this.prevWidth} ${this.prevBgColor}`); // 添加新类
    this.container.find('.content').css('font-size', `${this.prevFontSize}px`);
  }

  static bindEvents() {
    this.container
      .on('click', '.directory_btn', () => this.handleDirectory())
      .on('click', '.setUp_btn', () => this.handleSettings())
      .on('click', '.comments_btn', () => this.handleComments())
      .on('click', '.like', this.handleLike.bind(this))
      .on('click', '.bookcase_btn', this.handleAddToBookcase.bind(this))
      .on('click', '.db_type_close', this.handleClosePanel)
      .on('click', '.close', this.handleCloseComments)
      .on('click', '.setUp_close', this.handleClosePanel)
      .on('click', '.paging_directory', () => this.handleDirectory())
      .on('keydown', this.handleKeyboard);
  }

  // 关闭面板处理方法
  static handleClosePanel = () => {
    // 同时关闭目录和设置面板
    this.togglePanel(false, 'catalogue');
    this.togglePanel(false, 'settings');

    // 重置按钮状态
    $('.left_bar').removeClass('btn_on');
    $('.left_panel').addClass('hidden');
  }

  // 关闭评论面板
  static handleCloseComments = () => {
    $('.comments_box').toggleClass('hidden', true);
    this.commentsState = false;
  }

  static handleDirectory = () => {
    if (this.catalogueState) {
      this.togglePanel(false, 'catalogue');
    } else {
      this.loadCatalogue();
    }
  };

  static async loadCatalogue() {
    try {
      this.togglePanel(true, 'catalogue');
    } catch (error) {
      CommonModule.util.showError('error-container', '目录加载失败');
    } finally {
    }
  }

  static togglePanel(state, panelType) {
    const $catalogueBtn = $('.directory_btn');
    const $settingsBtn = $('.setUp_btn');
    if (panelType === 'catalogue') {
      this.catalogueState = state;
      $catalogueBtn.parent().toggleClass('btn_on', state);  // 新增目录按钮状态
      $settingsBtn.parent().removeClass('btn_on');         // 关闭设置按钮状态
    } else if (panelType === 'settings') {
      this.settingsState = state;
      $settingsBtn.parent().toggleClass('btn_on', state);  // 新增设置按钮状态
      $catalogueBtn.parent().removeClass('btn_on');        // 关闭目录按钮状态
    }
    const $panel = panelType === 'catalogue'
      ? $('#directory_box').parent()
      : $('.setUp_box');

    $panel.toggleClass('hidden', !state);

    if (panelType === 'catalogue' && state) {
      const $activeItem = $(".directory_list li.on");
      if ($activeItem.length) {
        const containerHeight = $("#directory_box").height();
        const itemPosition = $activeItem.offset().top - $("#directory_box").offset().top;
        const targetPosition = Math.max(0, Math.min(
          itemPosition - containerHeight / 2,
          $("#directory_box")[0].scrollHeight - containerHeight
        ));
        $("#directory_box").stop().animate({ scrollTop: targetPosition }, 300);
      }
    }
  }

  static handleSettings() {
    if (this.settingsState) {
      this.togglePanel(false, 'settings');
    } else {
      this.togglePanel(true, 'settings');
    }
  }

  static handleComments() {
    if (this.commentsState) {
      $('.comments_box').toggleClass('hidden', true);
      this.commentsState = false;
    } else {
      this.commentsState = true;
      $('.comments_box').toggleClass('hidden', false);
    }
  }

  static async handleLike(e) {
    const $target = $(e.currentTarget);
    const bookid = $target.data('bookid');
    const id = $target.data('id');
    const API = $target.data('api');
    try {
      const res = await ApiService.post(API, { book_id: bookid, chapter_id: id });
      if (res?.code !== 0) throw { code: res?.code, msg: res?.msg || '操作失败' };
      $('.like').toggleClass('on');
      dialog.toastSuccess(res.msg);
    } catch (err) {
      dialog.toastFail(err.msg);
      console.error('失败:', err);
    }
  }

  static async handleAddToBookcase(e) {
    const $target = $(e.currentTarget);
    const bookid = $target.data('bookid');
    const API = $target.data('api');
    try {
      const res = await ApiService.post(API, { bookid: bookid });
      if (res?.code !== 0) throw { code: res?.code, msg: res?.msg || '操作失败' };
      $('.bookcase_btn').toggleClass('on');
      dialog.toastSuccess(res.msg);
    } catch (err) {
      dialog.toastFail(err.msg);
      console.error('失败:', err);
    }
  }

  static handleKeyboard(e) {
    switch (e.key) {
      case 'ArrowLeft':
        this.prevPage();
        break;
      case 'ArrowRight':
        this.nextPage();
        break;
    }
  }
}

// ================== 阅读器样式管理 ==================
class StyleManager {
  static init() {
    this.fontSizeMap = { 16: 'A', 18: 'B', 20: 'C', 22: 'D', 24: 'E', 26: 'F', 28: 'G' };
    this.pageWidthMap = { 800: 'A', 900: 'B', 1280: 'C' };
    this.initStyleSelection(); // 新增初始化选中状态
    this.bindStyleEvents();
  }

  static bindStyleEvents() {
    $('.setUp_box')
      .on('click', '.color_list a', this.changeColor)
      .on('click', '.font_box span', this.changeFontSize)
      .on('click', '.pageWidthBox span', this.changeWidth);
  }

  static initStyleSelection() {
    // 初始化颜色选择
    const currentColor = CommonModule.getCookie("bg_color") || "brown";
    $(`.color_list a[data-color="${currentColor}"] i`).addClass('color_on');

    // 初始化字体大小
    const currentFontSize = CommonModule.getCookie("font_size") || "18";
    $(`.font_box span[data-fontsize="${currentFontSize}"]`).addClass('fontSize');

    // 初始化页面宽度
    const currentWidth = CommonModule.getCookie("screen_width") || "900";
    $(`.pageWidthBox span[data-pagewidth="${currentWidth}"]`).addClass('pageWidthAc');
  }

  static changeColor(e) {
    const color = $(e.currentTarget).data('color');
    $(e.currentTarget).siblings().removeClass('color_on').find('i').removeClass('color_on');
    $(e.currentTarget).addClass('color_on').find('i').addClass('color_on');
    CommonModule.setCookie('bg_color', color);
    $('#content').removeClass().addClass(`w${CommonModule.getCookie("screen_width")} ${color}`);
  }

  static changeFontSize(e) {
    const size = $(e.currentTarget).data('fontsize');
    $(e.currentTarget).siblings().removeClass('fontSize');
    $(e.currentTarget).addClass('fontSize');
    CommonModule.setCookie('font_size', size);
    $('.content').css('font-size', `${size}px`);
  }

  static changeWidth(e) {
    const width = $(e.currentTarget).data('pagewidth');
    $(e.currentTarget).siblings().removeClass('pageWidthAc');
    $(e.currentTarget).addClass('pageWidthAc');
    CommonModule.setCookie('screen_width', width);
    $('#content')
      .removeClass()
      .addClass(`w${width}`)
      .addClass(CommonModule.getCookie("bg_color"));
  }
}

// ================== 章节内容加载 ==================
class ChapterLoader {
  static init() {
    this.loadTextContent();
  }

  static async loadTextContent() {
    try {
      const chapterId = $('#Jcontent').data('id');
      const API = $('#Jcontent').data('chapterinfoapi');
      const chapter_pages_content_open = $('#Jcontent').data('chapter_pages_content_open');
      const res = await ApiService.post(API, { id: chapterId });
      if (res?.code !== 0) throw { code: res?.code, msg: res?.msg || '操作失败' };
      if (res?.data?.data[0].length <= 0) throw { code: res?.code, msg: res?.msg || '作品不存在' };
      const info = res.data.data[0];
      if (info.fav) $('.bookcase_btn').addClass('on');
      if (info.like) $('.like').addClass('on');
      if(parseInt(chapter_pages_content_open) != 1) {
        if (info.content.includes('<br>')) {
          $('.content').html(`<p>${info.content.split("<br>").join("</p><p>")}</p>`);
        } else {
          $('.content').html(`<p>${info.content}</p>`);
        }
        if(info.front_url) {
          $('#paging_left').attr('href', info.front_url).removeClass('disable_btn');
        } else {
          $('#paging_left').attr('href', 'javascript:void(0);').addClass('disable_btn');
        }
        if(info.after_url) {
          $('#paging_right').attr('href', info.after_url).removeClass('disable_btn');
        } else {
          $('#paging_right').attr('href', 'javascript:void(0);').addClass('disable_btn');
        }
      }
    } catch (err) {
      dialog.toastFail(err.msg);
      console.error('失败:', err);
    }
  }
}