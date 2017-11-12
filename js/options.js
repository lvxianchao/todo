$(function(){

    // 读取manifest
    let mainfest = chrome.runtime.getManifest();

    // 填充版本号
    $('#version').text(mainfest.version);


    // 切换面板
    $('.nav a').on('click', function(){
        $(this).parent('li').addClass('active').siblings('li').removeClass('active');
        // 隐藏|显示面板
        let id = $(this).attr('data-id');
        $('#'+id).removeClass('hidden').siblings('.panel').addClass('hidden');
    });





});