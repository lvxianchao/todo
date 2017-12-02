// 获取数据
chrome.storage.sync.get(['options', 'tasks'], function (items) {
    let data = isObjEmpty(items) ? {"options": {"sync": true},"tasks": []} : {"options": items.options, "tasks": items.tasks};
    window.localStorage.setItem('todo', JSON.stringify(data));
});

// 在扩展图标上，显示未完成的待办事项数据量
let counter = 0;
if( window.localStorage.getItem('todo') ){
    let tasks = window.localStorage.getItem('todo').tasks;
    if( tasks.length>0 ){
        for (let i = 0; i < tasks.length; i++) {
            if( tasks[i].status === false ){
                counter += 1;
            }
        }
    }
}


if( counter>0 ){
    chrome.browserAction.setBadgeText({"text": counter.toString()});
    chrome.browserAction.setBadgeBackgroundColor({"color":"red"});
}


/**
 * 判断对象是否为空对象
 *
 * @param {obj} object
 * @returns {boolean} true | false
 */
function isObjEmpty(object) {
    for (const key in object) {
        if (object.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}