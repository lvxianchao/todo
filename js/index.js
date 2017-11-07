$(function(){

    // 配置常量
    const CONFIG = {
        "COLOR": ['', 'text-primary', 'text-info', 'text-success', 'text-waning', 'text-danger']
    };


    /**
     * 当键盘按下回车键, 判断是在添加新任务, 还是编辑旧的任务, 做相应数据更新
    */
    $(window).on('keydown', function(e){
        if( e.keyCode==13 ){
            if( $('#new-task').is(':focus') ){
                $('#submit').click();
            } else if( $('textarea').is(':focus') ){
                $('textarea').blur();
            }
        }
    });


    /* 读取已存储的数据，置入表格 */
    if( window.localStorage.data && JSON.parse(window.localStorage.data).tasks.length>0 ){
        $('#no-task').addClass('hidden');
        // 解析已存储的数据
        let data = JSON.parse(window.localStorage.data);
        data.tasks.forEach(function(value){
            // 克隆原始行节点
            let tr = $('#template').clone(true);
            // 状态处理
            value.status? tr.find('.status').addClass('glyphicon-check'): tr.find('.status').addClass('glyphicon-unchecked');
            // 填充内容，处理内容样式
            value.status? tr.children('.col-xs-9').text(value.content).wrapInner('<del></del>'): tr.children('.col-xs-9').text(value.content);
            tr.removeAttr('id').removeClass('hidden').addClass(CONFIG.COLOR[value.color]).appendTo($('.table'));
        });
    }

    /* 添加一个新项 */
    $('#submit').on('click', function(){
        // 检测值是否为空, 为空不响应
        let task = $('#new-task').val();
        if( !task ){ return; }
        // 克隆一个新的行
        let tr = $('.table .row').first().clone(true);
        // 更新克隆行的文本节点, 添加状态图标
        tr.removeClass('hidden').removeAttr('id').children('.col-xs-9').text(task).prev('.col-xs-1').children('span').addClass('glyphicon-unchecked');
        $('.table').append(tr);
        $('#new-task').val('').focus();
        // 存储
        let data = localStorage.data? JSON.parse(localStorage.data): {};
        let tasks = data.tasks? data.tasks: [];
        let date = time();
        let tmp = {
            "content": task,
            "status": 0,
            "color": 0,
            'date': date.string,
            'time': date.stamp
        };
        tasks.push(tmp);
        data.tasks = tasks
        localStorage.data = JSON.stringify(data);
        // 隐藏提示
        $('#no-task').addClass('hidden');
    });


    /* 完成状态切换 */
    $(document).on('click', '.status', function(e){
        let _this = e.target;
        let status = 0;
        if( $(_this).hasClass('glyphicon-unchecked') ){
            $(_this).removeClass('glyphicon-unchecked').addClass('glyphicon-check').parent('td').next('td').wrapInner('<del></del>')
            status = 1;
        } else {
            $(_this).removeClass('glyphicon-check').addClass('glyphicon-unchecked')
            // 原文本
            let text = $(_this).parent('td').next('td').find('del').text();
            $(_this).parent('td').next('td').text(text);
            status = 0;
        }
        // 将数据标记状态
        let index = $(_this).parents('.row').index()-2;
        let data = JSON.parse(localStorage.getItem('data'));
        data.tasks[index].status = status;
        localStorage.data = JSON.stringify(data);
    });


    /* 删除一条记录 */
    $(document).on('click', '.glyphicon-trash', function(e){
        let _this = e.target;
        // 将数据标记状态
        let index = $(_this).parents('.row').index()-2;
        let data = JSON.parse(localStorage.getItem('data'));
        data.tasks.splice(index, 1);
        localStorage.data = JSON.stringify(data);
        // 判断是否是最后一个, 如果是, 显示提示语
        if( $('.table').find('.row').length == 3 ){ $('#no-task').removeClass('hidden'); }
        $(_this).parents('.row').remove();
    });


    /**
     * 编辑
    */
    $(document).on('click', '.glyphicon-edit', function(e){
        let _this = e.target;
        // 添加文本域, 如果是未完成的任务, 则直接添加文本框; 否则, 在del标签里添加文本框
        if( $(_this).parents('td').siblings('td').first().children('span').hasClass('glyphicon-unchecked') ){
            $(_this).parents('tr').children('.col-xs-9').wrapInner('<textarea rows="1" class="form-control"></textarea>').children('textarea').focus();
        } else {
            $(_this).parents('tr').children('.col-xs-9').children('del').wrapInner('<textarea rows="1" class="form-control"></textarea>').children('textarea').focus();
        }
    });

    /**
     * 文本域失去焦点, 保存更改
     */
    $(document).on('blur', 'textarea', function(e){
        let _this = e.target;
        if( $(_this).val() ){
            // 行索引
            let index = $(_this).parents('tr').index()-2;
            // 更新数据
            let data = JSON.parse(localStorage.getItem('data'));
            data.tasks[index].content = $(_this).val();
            localStorage.data = JSON.stringify(data);
        }
        // 移除文本框
        if( $(_this).parents('tr').children().first().children('span').hasClass('glyphicon-unchecked') ){
            $(_this).parents('.col-xs-9').text($(_this).val());
        } else {
            $(_this).parents('.col-xs-9').text($(_this).val()).wrapInner('<del></del>');
        }
    });


    // 获取当前日期毫秒级时间戳
    function time () {
        let time = new Date();
        // 获取日期所有需要的数据
        let year = time.getFullYear();
        let month = time.getMonth()+1<10? '0' + time.getMonth()+1: time.getMonth()+1;  // 1. 月份从一计数。2. 补0
        let date = time.getDate()<10? '0' + time.getDate(): time.getDate();
        let hours = time.getHours()<10? '0' + time.getHours(): time.getHours();
        let minutes = time.getMinutes()<10? '0' + time.getMinutes(): time.getMinutes();
        let seconds = time.getSeconds()<10? '0' + time.getSeconds(): time.getSeconds();
        return {"string": year + '-' + month + '-' + date + ' ' + hours + ':' + minutes, "stamp": time.getTime()}
    }

});
