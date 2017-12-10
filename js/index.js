class Todo {

    constructor() {

        // 颜色映射
        this.color = ['', 'text-primary', 'text-info', 'text-success', 'text-waning', 'text-danger'],

        // 表格模板
        this.template = `<tr class="row">
                                <td class="col-xs-1"><span class="glyphicon status"></span></td>
                                <td class="col-xs-8"></td>
                                <td>
                                    <div class="col-xs-1"><span class="glyphicon glyphicon-file"></span></div>
                                    <div class="col-xs-1"><span class="glyphicon glyphicon-edit"></span></div>
                                    <div class="col-xs-1"><span class="glyphicon glyphicon-trash"></span></div>
                                </td>
                            </tr>`;

        // 读取数据
        this.data = JSON.parse(window.localStorage.getItem('todo'));

        // 表格初始化
        this.init();

        // 未完成数量
        this.badge();
    }


    /**
     * 表格的初始化
     *
     * @memberof Todo
     */
    init() {
        if (this.data.tasks.length > 0) {
            $('#no-task').addClass('hidden');
            // 解析已存储的数据
            let _this = this;
            this.data.tasks.forEach(function (value) {
                // 克隆原始行节点
                let tr = $(_this.template);
                // 状态处理
                value.status ? tr.find('.status').addClass('glyphicon-check') : tr.find('.status').addClass('glyphicon-unchecked');
                // 填充内容，处理内容样式
                tr.children('.col-xs-8').text(value.content);
                if (value.status) {
                    tr.addClass('completed')
                }
                tr.addClass(value.color).appendTo($('.table'));
            });
        }
    }

    /**
     * 更新数据
     *
     * @memberof Todo
     */
    update() {
        window.localStorage.setItem('todo', JSON.stringify(this.data));
        chrome.storage.sync.set(this.data);
        this.badge();
    }


    /**
     * 添加数据
     *
     * @param {string} content
     * @memberof Todo
     */
    add(content) {
        // 存储数据
        let newtask = {
            "content": content,
            "status": false,
            "color": '',
            'date': this.time().string,
            'time': this.time().stamp
        };
        this.data.tasks.push(newtask);
        this.update();
    }


    edit(index, content) {
        this.data.tasks[index].content = content;
        this.update();
    }


    /**
     * 删除一条待办事项
     *
     * @param {int} index 要删除的数据的索引
     * @memberof Todo
     */
    delete(index) {
        this.data.tasks.splice(index, 1);
        this.update();
    }


    /**
     * 完成一条待办事项
     *
     * @param {int} 待办事项的索引
     * @memberof Todo
     */
    complete(index) {
        this.data.tasks[index].status = !this.data.tasks[index].status;
        this.update();
    }


    /**
     * 统计未完成的待办事项数量，显示在工具栏的图标上
     *
     * @memberof Todo
     */
    badge() {
        let counter = 0;
        if (this.data.tasks.length > 0) {
            for (let i = 0; i < this.data.tasks.length; i++) {
                if (this.data.tasks[i].status === false) {
                    counter += 1;
                }
            }
        }

        if( counter>0 ){
            chrome.browserAction.setBadgeText({
                "text": counter.toString()
            });
            chrome.browserAction.setBadgeBackgroundColor({"color":"red"});
        } else {
            chrome.browserAction.setBadgeText({'text': ''});
        }
    }


    /**
     * 获取时间相关信息
     *
     * @returns {object} object.string: 时间戳的日期化字符串, object.stamp: 时间戳
     * @memberof Todo
     */
    time() {
        let time = new Date();
        // 获取日期所有需要的数据
        let year = time.getFullYear();
        let month = time.getMonth() + 1 < 10 ? '0' + time.getMonth() + 1 : time.getMonth() + 1; // 1. 月份从一计数。2. 补0
        let date = time.getDate() < 10 ? '0' + time.getDate() : time.getDate();
        let hours = time.getHours() < 10 ? '0' + time.getHours() : time.getHours();
        let minutes = time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes();
        let seconds = time.getSeconds() < 10 ? '0' + time.getSeconds() : time.getSeconds();
        return {
            "string": year + '-' + month + '-' + date + ' ' + hours + ':' + minutes,
            "stamp": time.getTime()
        }
    }

}


$(function () {

    let todo = new Todo;

    // 添加一个新的待办事项
    $('#submit').on('click', function () {
        let content = $('#new-task').val();
        if (content) {
            let template = $(todo.template);
            // 添加图标并将待办内容置入模板
            template.children('td').eq(0).children('span').addClass('glyphicon-unchecked')
            template.children('td').eq(1).text(content);
            // 向表格插入元素
            $('.table').append(template);
            // 隐藏提示
            $('#no-task').hide();
            // 清空输入,获取焦点
            $('#new-task').val('').focus();
            // 数据添加
            todo.add(content);
        }
    });


    // 删除
    $(document).on('click', '.glyphicon-trash', function (e) {
        // 数据删除
        todo.delete(getIndex(e));
        // 删除行
        $(e.target).parents('.row').remove();
        // 判断是否是最后一个, 如果是, 显示提示语
        if ($('.table').find('.row').length == 1) {
            $('#no-task').removeClass('hidden');
        }
    });


    // 完成|未完成
    $(document).on('click', '.status', function (e) {
        let _this = e.target;
        $(_this).hasClass('glyphicon-unchecked') ? $(_this).removeClass('glyphicon-unchecked').addClass('glyphicon-check').parents('.row').addClass('completed') : $(_this).removeClass('glyphicon-check').addClass('glyphicon-unchecked').parents('.row').removeClass('completed');
        todo.complete(getIndex(e));
    });


    // 编辑
    $(document).on('click', '.glyphicon-edit', function (e) {
        // 添加文本框
        $(e.target).parents('.row').children('.col-xs-8').wrapInner('<textarea rows="1" class="form-control"></textarea>').children('textarea').focus();
    });


    // 文本域失去焦点, 保存更改
    $(document).on('blur', 'textarea', function (e) {
        let _this = e.target;
        if ($(_this).val()) {
            // 更新数据
            todo.edit(getIndex(e), $(_this).val());
        }
        $(_this).parents('.col-xs-8').text($(_this).val());
        $(_this).remove();
    });


    // 当键盘按下回车键, 判断是在添加新任务, 还是编辑旧的任务, 做相应数据更新
    $(window).on('keydown', function (e) {
        if (e.keyCode == 13) {
            if ($('#new-task').is(':focus')) {
                $('#submit').click();
            } else if ($('textarea').is(':focus')) {
                $('textarea').blur();
            }
        }
    });


    // 复制内容到剪贴板
    var clipboard = new Clipboard('.glyphicon-file', {
        target: function (trigger) {
            return $(trigger).parents('td').prev().get(0);
        }
    });


    /**
     * 获取当前操作的数据索引
     *
     * @param {obj} 事件所在对象
     * @returns {int} 索引
     */
    function getIndex(e) {
        return $(e.target).parents('.row').index() - 1;
    }

});