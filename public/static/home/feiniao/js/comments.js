$(window).on('load', function () {

    const paginationConfig = {
        currentPage: 1,
        pageSize: 20,
        total: 0,
        visiblePages: 5 // 显示5个页码
    };

    // 全局数据存储
    let comments = [];

    // 递归渲染回复  
    window.renderReplies = function(childReplies, parentId = null, level = 0) {
        return childReplies.map(reply => {
            return `
            <div class="${level > 0 ? 'nested-reply' : 'reply-item'}" data-id="${reply.id}">
                <div class="comment-header">
                    <div class="comment-author">${reply.user.nickname}</div>
                    ${reply.parent_id ? `<div class="reply-to">回复于</div>` : ''}
                    <div class="comment-time">${reply.create_time}</div>
                </div>
                <div class="comment-content">${reply.content}</div>
                <div class="comment-actions">
                    <button class="comment-btn like-btn" 
                            onclick="likeComment(${reply.id}, this, 2)">
                        <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01z"/>
    </svg>
                        <span class="like-count">${reply.like_count}</span>
                    </button>
                    <button class="comment-btn reply-btn" 
                            onclick="showReply(
                                ${reply.id}, 
                                '${reply.user.nickname}', 
                                2, 
                                ${reply.comment_id}, 
                                ${reply.id}
                            )"><svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
    </svg>回复</button>
                </div>
                ${reply.childReplies?.length ? `
                <div class="reply-children">
                    ${renderReplies(reply.childReplies, reply.id, level + 1)}
                </div>
                ` : ''}
            </div>`;
        }).join('');
    }

    window.insertTextAtCursor = function(textareaId, text) {
        const textarea = document.getElementById(textareaId);
        if (!textarea) {
            console.error('目标文本框不存在:', textareaId);
            return;
        }        
        // 现代浏览器兼容写法
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        const content = textarea.value;        
        textarea.value = content.substring(0, startPos) 
                    + text 
                    + content.substring(endPos);        
        // 移动光标位置
        textarea.selectionStart = textarea.selectionEnd = startPos + text.length;
        textarea.focus();
    }

    window.loadComments = function() {
        CommonModule.doRest.post(commentlistApi, {
            target_type: targetType,
            target_id: target_id,
            page: paginationConfig.currentPage,
            limit: paginationConfig.pageSize,
        }).then(res => {
            if(res.code == 0) {
                renderComments(res.data.data);
                renderPagination(res.data.total);
                if(targetType ==1) $('#comments i').text('（'+res.data.total+'条）');
            } else {
                dialog.toastFail(res.msg || '加载评论失败');
            }
        }).catch(err => {
            dialog.toastFail(err.message || '加载评论失败');
        });       
    }

    // 全局渲染函数
    window.renderComments = function(data) {
        let html = '';
        data.forEach(comment => {
            html += `
            <div class="comment-item" data-id="${comment.id}">
                <div class="comment-header">
                    <div class="comment-author">${comment.user.nickname}</div>
                    <div class="comment-time">${comment.create_time}</div>
                </div>
                <div class="comment-content">${comment.content}</div>  
                <div class="comment-actions">
                    <button class="comment-btn like-btn" 
                            onclick="likeComment(${comment.id}, this, 1)">
                        <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01z"/>
    </svg>
                        <span class="like-count">${comment.like_count}</span>
                    </button>
                    <button class="comment-btn reply-btn reply" 
                            onclick="showReply(
                                ${comment.id}, 
                                '${comment.user.nickname}', 
                                1, 
                                ${comment.id}, 
                                null
                            )"><svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
    </svg>回复</button>
                </div>
                ${comment.replies?.length ? `
                <div class="reply-list">
                    ${renderReplies(comment.replies)}
                </div>
                ` : ''}
            </div>`;
        });
        $('#commentList').html(html);
        renderPagination();
    }

    window.renderPagination = function() {
        const totalPages = Math.ceil(paginationConfig.total / paginationConfig.pageSize);
        // 页码按钮
        const startPage = Math.max(1, paginationConfig.currentPage - Math.floor(paginationConfig.visiblePages/2));
        const endPage = Math.min(totalPages, startPage + paginationConfig.visiblePages - 1);
        let html = '';
        
        html += `<button ${paginationConfig.currentPage === 1 ? 'disabled' : ''} 
        onclick="changePage(${paginationConfig.currentPage - 1})" class="pagination-btn pagination-prev">上一页</button>`;

        for(let i = startPage; i <= endPage; i++) {
            html += `<button class="pagination-btn ${i === paginationConfig.currentPage ? 'pagination-active' : ''}" 
                    onclick="changePage(${i})">${i}</button>`;
        }

        html += `<button ${paginationConfig.currentPage === totalPages ? 'disabled' : ''} 
                onclick="changePage(${paginationConfig.currentPage + 1})" class="pagination-btn pagination-next">下一页</button>`;

        if(totalPages > 1) $('#pagination').html(html);
    }

    window.changePage = function(page) {
        if(page < 1 || page > Math.ceil(paginationConfig.total / paginationConfig.pageSize)) return;
        paginationConfig.currentPage = page;
        loadComments();
        window.scrollTo(0, 0);
    }

    // 点赞功能
    window.likeComment = function(id, obj, target_type) {
        const $btn = $(obj).prop('disabled', true); 
        CommonModule.doRest.post(commentlikeApi, {
            target_id: id,
            target_type: target_type,
        }).then(res => {
            $btn.prop('disabled', false);
            if(res.code == 0) {
                loadComments();            
            } else {
                dialog.toastFail(res.msg || '操作失败');
            }
        }).catch(err => {
            $btn.prop('disabled', false);
            dialog.toastFail(err.message || '操作失败');
        });
    }

    // 在全局保存当前回复弹窗实例
    let currentReplyDialog = null;
    
    window.showReply = function(targetId, targetUser, replyType, commentId, parentId = null) {
        const dynamicId = `replyContent_${Date.now()}`;        
        // 1. 创建回复表单的HTML字符串
        const replyFormHtml = `
        <div class="reply-form-container">
            <input type="hidden" class="targetUser" value="${targetUser}">
            <input type="hidden" id="replyType" value="${replyType}">
            <input type="hidden" id="parentId" value="${parentId || 0}">
            <input type="hidden" id="commentId" value="${commentId}">
            <textarea id="${dynamicId}" 
                    class="reply-textarea" 
                    rows="3" 
                    placeholder="@${targetUser.replace(/"/g, '&quot;')}"></textarea>
            <div class="reply-actions">
                <button class="emoji-btn" type="button">😀 表情</button>
                <button class="submit-btn" type="button">提交</button>
            </div>
        </div>`;
        
        // 2. 显示弹窗
        currentReplyDialog = dialog.alert({
            title: `回复 ${targetUser}`,
            message: replyFormHtml,  // 传入HTML字符串
            width: '500px',
            maskClosable: false
        });
        
        // 3. 延迟绑定事件（确保DOM已渲染）
        setTimeout(() => {
            // 绑定表情按钮点击
            $('.emoji-btn').on('click', function() {
                showEmojiPanel(dynamicId);
            });
            
            // 绑定提交按钮点击
            $('.submit-btn').on('click', function() {
                submitReply(dynamicId);
            });
            
            // 自动聚焦到文本框
            $(`#${dynamicId}`)
                .val(parentId ? `@${targetUser} ` : `@${targetUser} `)
                .focus();
        }, 50);
    };

     window.showEmojiPanel = function(targetId) {
        // 1. 获取表情面板的HTML字符串
        const emojiHtml = $('#emojiPanel').clone().removeAttr('id').css('display', 'grid')[0].outerHTML;
        
        // 2. 创建弹窗内容容器
        const dialogContent = `
        <div class="emoji-dialog-container" style="padding: 15px; width: 600px;">
            ${emojiHtml}
        </div>`;
        
        // 3. 显示弹窗
        const d = dialog.alert({
            title: '选择表情',
            message: dialogContent,  // 确保传入的是字符串
            maskClosable: true,
            customClass: 'emoji-dialog'
        });
        
        // 4. 延迟绑定事件（确保DOM已渲染）
        setTimeout(() => {
            $('.emoji-dialog-container').on('click', '.emoji-item', function() {
                insertTextAtCursor(targetId, $(this).text());
            });
        }, 50);
    };

    window.submitReply = function(textareaId) {
        const $textarea = $(`#${textareaId}`);
        // 检查元素是否存在
        if (!$textarea.length) {
            console.error('找不到文本框:', textareaId);
            dialog.toastFail('回复提交失败');
            return;
        }
         // 获取整个表单容器
        const $replyForm = $textarea.closest('.reply-form-container');
        // 获取表单数据
        const targetUser = $replyForm.find('.targetUser').val();
        let content = $textarea.val() || '';  // 确保有默认值
        content = content.trim();
        if (targetUser) {
            content = content.replace(new RegExp(`^@${targetUser}\\s*`), '');
        }
        // 验证内容
        if (!content) {
            dialog.toastFail('回复内容不能为空');
            return;
        }
        // 获取其他表单数据
        const params = {
            content: content,
            reply_type: parseInt($replyForm.find('#replyType').val()),
            parent_id: parseInt($replyForm.find('#parentId').val()) || 0,
            comment_id: parseInt($replyForm.find('#commentId').val())
        };

        CommonModule.doRest.post(commentreplyApi, params)
        .then(res => {            
            if (!res || typeof res.code === 'undefined') {
                throw new Error('无效的响应格式');
            }
            if (res.code === 0) {
                // 关闭回复弹窗
                if (currentReplyDialog && currentReplyDialog.close) {
                    currentReplyDialog.close();
                    currentReplyDialog = null;
                }
                dialog.toastSuccess(res.msg || '回复成功');
                loadComments();
            } else {
                throw new Error(res.msg || '服务器返回错误');
            }
        })
        .catch(err => {        
            console.error('提交失败:', err);
            dialog.toastFail(err.message || '提交失败');
        });
    };

    // 递归查找评论
    window.findComment = function(id, list = comments) {
        for(const item of list) {
            if(item.id === id) return item;
            if(item.replies?.length) {
                const found = findComment(id, item.replies);
                if(found) return found;
            }
        }
        console.warn('未找到对应评论:', id);
        return null;
    }

    // 初始化
    $(function() {
        // 初始化表情面板
        $('#btnEmoji').click(function(){
            showEmojiPanel('commentContent');
        });

        // 提交主评论
        $('#btnSubmit').click(function(){
            const content = $('#commentContent').val().trim();
            if(!content) {
                dialog.toastFail('评论内容不能为空');
                return;
            }            
            CommonModule.doRest.post(commentcreateApi, {
                target_type: targetType,
                target_id: target_id,
                content: content,
            }).then(res => {   
                if(res.code == 0) {
                    dialog.toastSuccess(res.msg || '评论成功');
                    $('#commentContent').val('');
                    paginationConfig.currentPage = 1;
                    loadComments();
                } else {
                    if(res.code == 99) {
                        dialog.confirm({
                            title: '登录提示',
                            message: '未登录，是否现在前往登录？',
                            confirmButtonText: '登录',
                            cancelButtonText: '关闭',
                            maskClosable: true, // 允许点击遮罩关闭
                            confirmCallback: () => {
                                window.location.href = loginurl;
                            },
                            cancelCallback: () => {
                                console.log('取消删除');
                            }
                        });
                    } else {
                        dialog.toastFail(res.msg || '评论失败');
                    }                    
                }
            }).catch(err => {
                dialog.toastFail(err.message || '评论失败');
            });
        });

        loadComments();
    });

});