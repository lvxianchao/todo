$(function(){

    // 配置常量
    const CONFIG = {
        "COLOR": ['', 'text-primary', 'text-info', 'text-success', 'text-waning', 'text-danger']
    };

    // localStorage.removeItem('data');
    /* 读取已存储的数据，置入表格 */
    if( window.localStorage.data ){
        // 解析已存储的数据
        let data = JSON.parse(window.localStorage.data);
        data.tasks.forEach(function(value, index, array){
            // 克隆原始行节点
            let tr = $('#template').clone(true);
            // 状态处理
            value.status? tr.find('.status').addClass('glyphicon-check'): tr.find('.status').addClass('glyphicon-unchecked');
            // 填充内容，处理内容样式
            value.status? tr.children('.col-xs-9').text('').append($('<del><span>'+value.content+'</span></del>')): tr.children('.col-xs-9').text(value.content);
            tr.attr('data-index', index).removeAttr('id').addClass(CONFIG.COLOR[value.color]).appendTo($('.table'));
        });
    }

    /* 添加一个新项 */
    $('#submit').on('click', function(){
        let task = $('#new-task').val();
        if( !task ){ return; }
        let tr = $('.table .row').first().clone(true);
        tr.removeClass('hidden').children('.col-xs-9').text(task);
        $('.table').append(tr);
        $('#new-task').val('').focus();
        // 存储
        let data = localStorage.data? JSON.parse(localStorage.data): {};
        // return console.log(data);
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
    });


    /* 完成状态切换 */
    $(document).on('click', '.status', function(e){
        let _this = e.target;
        let status = 0;
        if( $(_this).hasClass('glyphicon-unchecked') ){
            $(_this).removeClass('glyphicon-unchecked').addClass('glyphicon-check').parent('td').next('td').wrapInner('<del><span></span></del>')
            status = 1;
        } else {
            $(_this).removeClass('glyphicon-check').addClass('glyphicon-unchecked').parent('td').next('td').find('span').unwrap()
            status = 0;
        }
        // 将数据标记状态
        let index = $(_this).parents('.row').attr('data-index');
        let data = JSON.parse(localStorage.getItem('data'));
        data.tasks[index].status = status;
        localStorage.data = JSON.stringify(data);
    });


    /* 删除一条记录 */
    $(document).on('click', '.glyphicon-trash', function(e){
        let _this = e.target;
        $(_this).parents('.row').remove();
        // 将数据标记状态
        let index = $(_this).parents('.row').attr('data-index');
        let data = JSON.parse(localStorage.getItem('data'));
        data.tasks.splice(index, 1);
        localStorage.data = JSON.stringify(data);
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
