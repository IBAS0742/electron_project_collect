const request = require("request");

module.exports.fetchEventDear = (function (log4j,fs,rootDir) {
    let logAll = log4j.getLogger("fetchEventDearAll");
    let logPass = log4j.getLogger("fetchEventDearPass");
    let logError = log4j.getLogger("fetchEventDearError");
    let logProcess = log4j.getLogger("process");
    let database = require("./database").database;
    let createMethods = null;
    let requestManager = null;
    let tempRequestContent = "";
    let workDir = "";
    let saveDom = {
        over : false,
        error : ""
    };

    fs.readdir(rootDir + "/setting/createMethods",function(err,ret){
        if (err) {
            throw err;
        } else {
            createMethods = ret;
        }
    });

    fs.readdir(rootDir + "/setting/request",function(err,ret){
        if (err) {
            throw err;
        } else {
            requestManager = ret;
        }
    });

    fs.writeFile(rootDir + '/logs/process.log',"",function (err) {
        if (err) {
            logProcess.info("日志删除失败-不重要");
        }
    });

    console.log(createMethods);

    /**
     * 如果事件中仅仅有一个参数，则 param 对应参数
     * 如果超过一个，则 param 以对象传递
     *  例如 mysql 的 insert 接口
     *      param = { obj : obj , dbname : dbname , tableName : tableName }
     * */
    let events = {
        mysql : {
            isInit : function (cb) {
                cb(null,database.isInit());
            },
            connetctionParam : function (cb,param) {
                database.connetctionParam(param,cb);
            },
            init : function (cb) {
                database.init();
                cb(null,"database.init()");
            },
            setDefaultDatabaseName : function (cb,databaseName) {
                console.log("databaseName = " + databaseName);
                database.methods().setDefaultDatabaseName(databaseName);
                cb(null,"设置完成");
            },
            setDefaultTableName : function (cb,tableName) {
                database.methods().setDefaultTableName(tableName);
                cb(null,"设置完成");
            },
            query : function (cb,sql) {
                if (database.isInit()) {
                    database.methods().query(sql,cb);
                } else {
                    cb("未初始化数据库");
                }
            },
            destroy : function (cb) {
                if (database.isInit()) {
                    database.destroy(cb);
                } else {
                    cb("未初始化数据库");
                }
            },
            fetchDBS : function (cb) {
                database.methods().fetchDBS(cb);
            },
            insert : function (cb,obj,dbname,tableName) {
                if (database.isInit()) {
                    database.methods().insert(obj.obj,cb,obj.dbname,obj.tableName);
                } else {
                    cb("未初始化数据库");
                }
            },
            delete : function (cb,obj,dbname,tableName) {
                if (database.isInit()) {
                    database.methods().delete(obj.obj,cb,obj.dbname,obj.tableName);
                } else {
                    cb("未初始化数据库");
                }
            },
            update : function (cb,obj,dbname,tableName) {
                if (database.isInit()) {
                    database.methods().update(obj.obj,cb,obj.dbname,obj.tableName);
                } else {
                    cb("未初始化数据库");
                }
            },
            select : function (cb,obj,dbname,tableName) {
                if (database.isInit()) {
                    database.methods().select(obj.obj,cb,obj.dbname,obj.tableName);
                } else {
                    cb("未初始化数据库");
                }
            }
        },
        log : {
            //所有运行中日志（未分类部分）
            fetchAllLog : function (cb) {
                fs.readFile("./logs/fetchEventDearAll.log",'utf-8',cb);
            },
            //分类中发生过错误的日志
            fetchErrorLog : function (cb) {
                fs.readFile("./logs/fetchEventDearError.log",'utf-8',cb);
            },
            //分类中通过的日志
            fetchPassLog : function (cb) {
                fs.readFile("./logs/fetchEventDearPass.log",'utf-8',cb);
            },
            //整体程序的日志
            fetchSysLog : function (cb) {
                fs.readFile("./logs/mainLog.log",'utf-8',cb);
            },
            //清空日志
            clearLog : function (cb,target) {
                switch (target) {
                    case "all" :
                        target = "./logs/fetchEventDearAll.log";
                        break;
                    case "error" :
                        target = "./logs/fetchEventDearError.log";
                        break;
                    case "pass" :
                        target = "./logs/fetchEventDearPass.log";
                        break;
                    case "sys" :
                        target = "./logs/mainLog.log";
                        break;
                    default :
                        target = "";
                }
                if (target) {
                    fs.writeFile(target,"",cb);
                } else {
                    cb("找不到目标文件");
                }
            },
            //导出日志
            output : function (cb,path) {
                fs.readFile(rootDir + '/logs/process.log','utf-8',function (err,ret) {
                    if (err) {
                        cb("读取日志失败");
                    } else {
                        fs.writeFile(path + "/spider.log",ret,function (error) {
                            cb(error,"写入成功");
                        });
                    }
                });
            },
            //读取本地日志
            read : function (cb,path) {
                fs.readFile(path,'utf-8',cb);
            }
        },
        request : {
            /**
             * param 格式如下
             *   {
             *       url : "http://localhost:3080/testGet",
             *       headers : {
             *           "hName" : "ibas"
             *       },
             *       method : "get",
             *       form : {
             *           hName : "bing"
             *       }
             *   }
             * */
            get : function (cb,param) {
                console.log(param);
                request.get(param,function (err,res,body) {
                    tempRequestContent = body;
                    cb(err,res,body);
                });
            },
            post : function (cb,param) {
                request.post(param,function (err,res,body) {
                    console.log(err);
                    tempRequestContent = body;
                    cb(err,res,body);
                });
            },
            saveTemp : function (cb,path) {
                if (tempRequestContent) {
                    fs.writeFile(path,tempRequestContent,cb);
                } else {
                    cb("没有内容可以保存");
                }
            }
        },
        createMethods : {
            /**
             * obj = { name : "函数名称" , function : "函数内容" }
             * 函数内容格式为
             *      val 为定制的内容，times 为请求的次数
             *      function(val,times) { 函数内容; return "返回一个内容作为参数"; }
             * */
            create : function (cb,obj) {
                console.log("jump to update");
                if (createMethods.indexOf(obj.name + ".js") + 1) {
                    //转发到 update 中
                    events.createMethods.update(cb,obj);
                } else {
                    fs.writeFile(rootDir + "/setting/createMethods/" + obj.name + ".js",
                        'if (window.parent == window) {if (createMethods && createMethods instanceof Object) {} else {createMethods = {};}} else {if (window.parent.createMethods instanceof Object) {} else {window.parent.createMethods = {};}};(window.parent.createMethods || window.createMethods)["' + obj.name + '"] =\n' +
                        obj.function,
                        function (err,ret) {
                            if (err) {
                                cb("创建失败");
                            } else {
                                createMethods.push(obj.name + ".js");
                                cb(null,"创建成功");
                            }
                        }
                    );
                }
            },
            /**
             * name 为 策略名称
             * */
            delete : function (cb,name) {
                name += ".js";
                if (createMethods.indexOf(name) + 1) {
                    fs.unlink(rootDir + "/setting/createMethods/" + name,function (err,ret) {
                        if (err) {
                            cb("删除失败");
                        } else {
                            createMethods.splice(createMethods.indexOf(name),1);
                            cb(null,"删除成功");
                        }
                    });
                } else {
                    cb("文件不存在");
                }
            },
            /**
             * obj 同 create 说明
             * */
            update : function (cb,obj) {
                if (createMethods.indexOf(obj.name + ".js") + 1) {
                    console.log(obj);
                    fs.writeFile(rootDir + "/setting/createMethods/" + obj.name + ".js",
                        'if (window.parent == window) {if (createMethods && createMethods instanceof Object) {} else {createMethods = {};}} else {if (window.parent.createMethods instanceof Object) {} else {window.parent.createMethods = {};}};(window.parent.createMethods || window.createMethods)["' + obj.name + '"] =\n' +
                        obj.function,
                        function (err,ret) {
                            if (err) {
                                cb("更新失败");
                            } else {
                                cb(null,"更新成功");
                            }
                        }
                    );
                } else {
                    //转发到 create 中
                    events.createMethods.create(cb,obj);
                }
            },
            getAll : function (cb) {
                cb(null,createMethods);
            },
            fetch : function (cb,name) {
                fs.readFile(rootDir + "/setting/createMethods/" + name + ".js","utf-8",cb);
            }
        },
        requestManager : {
            /**
             * obj = { name : "函数名称" , obj : "配置内容对象" }
             * */
            create : function (cb,obj) {
                if (requestManager.indexOf(obj.name + ".json") + 1) {
                    //转发到 update 中
                    events.requestManager.update(cb,obj);
                } else {
                    fs.writeFile(rootDir + "/setting/request/" + obj.name + ".json", JSON.stringify(obj.obj),
                        function (err,ret) {
                            if (err) {
                                cb("创建失败");
                            } else {
                                requestManager.push(obj.name + ".json");
                                cb(null,"创建成功");
                            }
                        }
                    );
                }
            },
            /**
             * name 为 策略名称
             * */
            delete : function (cb,name) {
                name += ".json";
                if (requestManager.indexOf(name) + 1) {
                    fs.unlink(rootDir + "/setting/request/" + name,function (err,ret) {
                        if (err) {
                            cb("删除失败");
                        } else {
                            requestManager.splice(requestManager.indexOf(name),1);
                            cb(null,"删除成功");
                        }
                    });
                } else {
                    cb("文件不存在");
                }
            },
            /**
             * obj 同 create 说明
             * */
            update : function (cb,obj) {
                if (requestManager.indexOf(obj.name + ".json") + 1) {
                    fs.writeFile(rootDir + "/setting/request/" + obj.name + ".json", JSON.stringify(obj.obj),
                        function (err,ret) {
                            if (err) {
                                cb("更新失败");
                            } else {
                                cb(null,"更新成功");
                            }
                        }
                    );
                } else {
                    //转发到 create 中
                    events.requestManager.create(cb,obj);
                }
            },
            getAll : function (cb) {
                cb(null,requestManager);
            },
            fetch : function (cb,name) {
                fs.readFile(rootDir + "/setting/request/" + name + ".json","utf-8",cb);
            }
        },
        file : {
            /**
             * obj 为
             *      name : 文件名
             *      content : 文件内容
             * */
            append : function (cb,obj) {
                fs.appendFile(obj.name,obj.content,function (err) {
                    cb(err,"添加成功");
                });
            },
            write : function (cb,obj) {
                fs.writeFile(obj.name,obj.content,function (err) {
                    cb(err,"写入成功");
                });
            },
            saveDom : function (cb,content) {
                fs.writeFile(workDir + "/temp.dom.html",content,function (err) {
                    saveDom.over = true;
                    if (err) {
                        saveDom.error = "写入失败";
                    } else {
                        saveDom.error = "";
                    }
                });
            },
            fetchSaveDom : function (cb) {
                if (!saveDom.over) {
                    cb("saving");
                } else {
                    saveDom.over = false;
                    if (saveDom.error) {
                        cb(saveDom.error);
                    } else {
                        fs.readFile(workDir + "/temp.dom.html",'utf-8',cb);
                    }
                }
            },
            setPath : function (cb,path) {
                workDir = path;
                cb("","设置成功");
            },
            fetchPreviewDear : function (cb) {
                fs.readFile(rootDir + "/util/saveDomToFile.js",'utf-8',cb);
            },
            savePreivewDear : function (cb,content) {
                fs.writeFile(rootDir + "/util/saveDomToFile.js",content,cb);
            }
        }
    };

    var logManager = function (logAll,logPass,logError) {
        /**
         * error 表示仅记录错误日志
         * pass  记录成功日志
         * join 合并记录两种日志
         * split 分开记录两种日志
         * */
        var logType = "";
        var logEvent = [];
        return {
            //定制 log 事件
            order : function (type) {
                logType = type;
            },
            //完成 log 定制事件
            keepLog : function (err,content) {
                var type = logType;
                logType = "";
                if (content instanceof Object) {
                    content = JSON.stringify(content);
                }
                if (err) {
                    logProcess.error(content);
                } else {
                    logProcess.info(content);
                }
                if (type == "error") {
                    if (err) {
                        logError.error(content);
                    }
                } else if (type == "pass") {
                    if (!err) {
                        logPass.info(content);
                    }
                } else if (type == "join") {
                    if (err) {
                        logAll.error(content);
                    } else {
                        logAll.info(content);
                    }
                } else if (type == "split") {
                    if (err) {
                        logError.error(content);
                    } else {
                        logPass.info(content);
                    }
                } else {
                    //no log
                }
            }
        };
    }(logAll,logPass,logError);

    /**
     * obj 格式为
     *      event : "mysql-isInit",
     *      param : {}  //根据每个函数具体定义
     *      log : null  // null 是为不启动日志进行记录
     *          log 有多种取值，
     *              error 表示仅记录错误日志
     *              pass  记录成功日志
     *              join 合并记录两种日志
     *              split 分开记录两种日志
     * event 为 ipc 事件对象
     *
     * 前端接收到的信息必定是一个 错误对象和相应的内容，错误对象为空时，可能就没有相应的内容
     * */
    return function (event,obj) {
        var eventList = [];
        if (obj.event) {
            eventList = obj.event.toString().split("-");
        }
        if (eventList.length) {
            var el = eventList.shift(),
                ev = events;
            while (el) {
                ev = ev[el];
                el = eventList.shift();
            }
            logManager.order(obj.log);
            ev.bind(null,function(){
                var ret = arguments;
                logManager.keepLog(ret[0],ret);
                event.sender.send("fetchBack",ret);
            })(obj.param || {});
        }
    }
});