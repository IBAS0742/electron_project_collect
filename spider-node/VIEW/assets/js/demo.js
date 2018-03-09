type = ['','info','success','warning','danger'];

var dialog = require('electron').remote.dialog;

var loading;

var debuggingRes = null;

function notify(icon,message,type) {
    $.notify({
        icon: icon || 'pe-7s-note',
        message: message || "内容"

    },{
        type: type || 'info',
        timer: 4000
    });
};

demo = {
    initPickColor: function(){
        $('.pick-class-label').click(function(){
            var new_class = $(this).attr('new-class');  
            var old_class = $('#display-buttons').attr('data-class');
            var display_div = $('#display-buttons');
            if(display_div.length) {
            var display_buttons = display_div.find('.btn');
            display_buttons.removeClass(old_class);
            display_buttons.addClass(new_class);
            display_div.attr('data-class', new_class);
            }
        });
    },
    
	showNotification: function(from, align){
    	color = Math.floor((Math.random() * 4) + 1);
    	
    	$.notify({
        	icon: "pe-7s-gift",
        	message: "Welcome to <b>Light Bootstrap Dashboard</b> - a beautiful freebie for every web developer."
        	
        },{
            type: type[color],
            timer: 4000,
            placement: {
                from: from,
                align: align
            }
        });
	}
    
};

var baseSetting = {
    mysql : {},
    mysqlState : false
};

//获取基本配置信息
$(function () {
    //获取数据库连接参数
    eventManager.run(eventManager.events.mysql.connetctionParam,function (ret) {
        baseSetting.mysql = ret[1];
    });
    //获取数据库状态
    eventManager.run(eventManager.events.mysql.state,function (ret) {
        baseSetting.mysqlState = ret[1];
    });
    //获取策略方法
    createMethods = null;
    eventManager.run(eventManager.events.createMethods.getAll,function (ret) {
        if (ret[0]) {
            notify(null,"获取策略发生错误，请重启");
        } else {
            ret[1].forEach(function (cm) {
                eventManager.events.createMethods.refreshCreateMethods($,cm);
            });
        }
    });
    loading = new Proxy({
        loading : $("#loading")[0],
        time : 0
    },{
        set : function (obj,prop,value) {
            if (prop == "time") {
                if (value) {
                    obj.loading.style.display = "block";
                } else {
                    obj.loading.style.display = "none";
                }
                obj[prop] = value;
            }
        }
    });
    ipc.send("fetchFore",{
        contact : "contact"
    });
});

/**
 * 如果这里是使用 get 或者 post 请求，则这里 res 为请求返回内容
 * 如果为 page （直接获取页面） 则 res 为 null
 * req 为请求的所有参数 包括 url headers params
 * times 为请求次数
 * */
function loaded(req,times,res) {
    /**
     * 这里可以使用 $ 即 jq 对象
     * 可以使用 eventManager mysql 中的接口将数据录入数据库
     * 也可以使用 eventManager file 中的接口将数据保存为本地文件
     * */
}
