var vm,
    tab;
baseApiUrl = "./json";

layui.use(['form','element','layer',"jquery"],function() {
    layer = layui.layer;
    $ = layui.jquery;
    element = layui.element;

    //配置型函数
    var configure = function () {
        //将 登陆、注册、表格例子的模拟数据 接口加入到 ajax 管理器中
        $AjaxProxy($,baseApiUrl);
        //将 登陆、注册、图标 页加入管理器中
        pageManage(layer);
        /**
         * 这里假定的需求是模块不同显示不同菜单
         * 方法是 mainStore.state.menus = [{}];
         * 由于每一个菜单项有一个唯一 id，并且该 id 与 tab 项关联
         * 由此需要为每一个菜单项赋予不同的 id 的同时将 id 进行记录
         * 这里编写了一个代理，
         * menu = {
         *      oldMenu : {
         *          menuOneHash : [ menus ],
         *          menuTwoHash : [ menus ]
         *      },
         *      menu : [ menus ]
         * }
         * 使用方法
         * menu.menus = [ menus ];
         * 当赋予新的菜单时，将计算菜单内容的 哈希值 并检查是否有使用过，
         *      有则重缓存中获取带 id 的菜单内容
         *      没有则为每一个菜单项赋予 id ，并缓存
         * */
        menu = bindToCache({
            menu : [],
            oldMenu : {}
        },nullStorageManage,"menu",true,null,{
            set : function (obj,prop,value) {
                if (prop == "menu") {
                    var hash = "hash_" + this.getHashCode(JSON.stringify(value).substring(0,100));
                    if (hash in obj.oldMenu) {
                        value = obj.oldMenu[hash];
                    } else {
                        if ($.isArray(value)) {} else {
                            value = [value];
                        }
                        for (var j = 0;j < value.length;j++) {
                            if (value[j].children) {
                                for (var i = value[j].children.length - 1;i + 1;i--) {
                                    value[j].children[i].id = "menu_" + (new Date()).getTime() + "_" + parseInt(Math.random() * 100);
                                }
                            } else {
                                value[j].id = "menu_" + (new Date()).getTime() + "_" + parseInt(Math.random() * 100);
                            }
                        }
                        obj.oldMenu[hash] = value;
                    }
                    while (mainStore.state.menus.length) {
                        mainStore.state.menus.pop();
                    }
                    value.forEach(function (i) {
                        mainStore.state.menus.push(i);
                    });
                    return value;
                }
            },
            getHashCode : function(str,caseSensitive){
                if(!caseSensitive){
                    str = str.toLowerCase();
                }
                var hash  =   1315423911,i,ch;
                for (i = str.length - 1; i >= 0; i--) {
                    ch = str.charCodeAt(i);
                    hash ^= ((hash << 5) + ch + (hash >> 2));
                }
                return  (hash & 0x7FFFFFFF);
            }
        });
        //初始化封装 promise 对象
        sailPromise = new sailPromise($.ajax.bind($));
        // 配置主体框架
        {
            mainStore.state.$ = $;
            mainStore.state.logo = "后台系统";
            mainStore.state.bottomHTML = "copyright @" + (new Date()).getYear();
            mainStore.state.lefttopmenu = [
                {
                    iconHtml : "<i class='layui-icon'>&#xe65f;</i>",
                    event : function () {
                        if (mainStore.state.showMenu == "open")
                            mainStore.state.showMenu = "close";
                        else
                            mainStore.state.showMenu = "open";
                    }
                }
            ];
            mainStore.state.righttopmenu = [
                {
                    iconHtml : "<i class=\"iconfont icon-gonggao\"></i>",
                    text : "日历",
                    click : function () {
                        layer.msg("。。。进行中");
                    }
                }
            ];
            mainStore.state.tabFrame = [
                {
                    url : "./childView/main.html"
                }
            ];
            mainStore.state.tabTitles = [
                {
                    iconHtml: "<i class='layui-icon'>&#xe857;</i>",
                    name: "主页",
                    id : 'first'
                }
            ];
            mainStore.state.hideTop = true;
            mainStore.state.hideBottom = true;
            mainStore.state.showMenu = "close";
            mainStore.state.windowsAction = [
                {
                    html : '<i class="layui-icon">&#x1007;</i> 关闭所有',
                    event : ['self','closeAllTab']
                },
                {
                    html : '<i class="iconfont">&#x1006;</i> 关闭其他',
                    event : ['self','closeOthers']
                },
                {
                    html : '<i class="layui-icon">&#x1002;</i> 刷新当前',
                    event : ['self','refleshTab']
                },
                {
                    html : '<i class="layui-icon">&#xe64e;</i> 开闭侧栏',
                    event : ['self','toggleMenu']
                }
            ];
            menu.menu = [
                {
                    "title": "测试",
                    "iconHtml": '<i class="iconfont icon-gonggao"></i>',
                    "spread": false,
                    "children": [
                        {
                            "title": "测试",
                            "iconHtml": '<i class="iconfont icon-gonggao"></i>',
                            "href": "./page/building.html",
                            "spread": false
                        }
                    ]
                },
                {
                    "title": "修改 layui 的 table 方法",
                    "iconHtml": '<i class="layui-icon">&#xe62d;</i>',
                    "href": "./page/function/tableDoc.html",
                    "spread": false
                }
            ];
        }
    };

    vm = new Vue({
        el: '#app',
        data: {
            loading : false
        },
        mounted : function () {
            setTimeout(function () {
                configure();
                element.render();
                // mainStore.state.showMenu = "open";
            });
        }
    });
});