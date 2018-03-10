//如果需要开启后台请求，先安装 request 模块
//https://www.npmjs.com/package/request
// const request = require("request");

module.exports.fetchEventDear = (function (log4j,fs,rootDir) {
    let logAll,
        logPass,
        logError,
        logProcess,
        log,
        fildDBInstance = require('./fileDB').fildDB(fs,rootDir + '/setting/fildDB');

    //如果没有 log4j 这里将使用文件记录的方式，模拟 log 过程
    if (log4j) {
        logAll = log4j.getLogger("fetchEventDearAll");
        logPass = log4j.getLogger("fetchEventDearPass");
        logError = log4j.getLogger("fetchEventDearError");
        logProcess = log4j.getLogger("process");
        log = {
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
        };
        fs.writeFile(rootDir + '/logs/process.log',"",function (err) {
            if (err) {
                logProcess.info("日志删除失败-不重要");
            }
        });
    } else {
        let replaceLog = function (tar,level,msg) {
            msg = '┏ ' + tar + ' ## ' + level + ' -------------------\n' + msg +
                '\n┗ ----------------------------';
            console.log(msg);
            //将 console 日志进行保存
            fs.appendFile("./logs/console.log", msg, (err) => {
                if (err) {
                    console.log('┏ Keep Log Error -------------------');
                    console.log(err.message);
                    console.log('┗ ----------------------------');
                }
            });
        };
        logAll = {
            error : replaceLog.bind(null,'logAll','Error'),
            info : replaceLog.bind(null,'logAll','Info')
        };
        logPass = {
            error : replaceLog.bind(null,'logPass','Error'),
            info : replaceLog.bind(null,'logPass','Info')
        };
        logPass = {
            error : replaceLog.bind(null,'logPass','Error'),
            info : replaceLog.bind(null,'logPass','Info')
        };
        logProcess = {
            error : replaceLog.bind(null,'logProcess','Error'),
            info : replaceLog.bind(null,'logProcess','Info')
        };
        let fetchConsoleLog = function (cb) {
            fs.readFile("./logs/console.log",'utf-8',cb);
        };
        log = {
            //所有运行中日志（未分类部分）
            fetchAllLog : fetchConsoleLog,
            //分类中发生过错误的日志
            fetchErrorLog : fetchConsoleLog,
            //分类中通过的日志
            fetchPassLog : fetchConsoleLog,
            //整体程序的日志
            fetchSysLog : fetchConsoleLog,
            //清空日志
            clearLog : function (cb,target) {
                fs.writeFile("./logs/console.log","",cb);
            },
            //导出日志
            output : function (cb,path) {
                fs.readFile("./logs/console.log",'utf-8',function (err,ret) {
                    if (err) {
                        cb("读取日志失败");
                    } else {
                        fs.writeFile(path,ret,function (error) {
                            cb(error,"写入成功");
                        });
                    }
                });
            },
            //读取本地日志
            read : function (cb,path) {
                fs.readFile(path,'utf-8',cb);
            }
        };
        fs.writeFile("./logs/console.log","",function (err) {
            if (err) {
                logProcess.info("日志删除失败-不重要");
            }
        });
    }

    /**
     * 这里如果需要使用 数据库模块，并且为 MySQL 可以解注此处
     */
    let mysql = null;
    // let database = require("./database").database;
    // mysql = {
    //         isInit : function (cb) {
    //             cb(null,database.isInit());
    //         },
    //         connetctionParam : function (cb,param) {
    //             database.connetctionParam(param,cb);
    //         },
    //         init : function (cb) {
    //             database.init();
    //             cb(null,"database.init()");
    //         },
    //         setDefaultDatabaseName : function (cb,databaseName) {
    //             console.log("databaseName = " + databaseName);
    //             database.methods().setDefaultDatabaseName(databaseName);
    //             cb(null,"设置完成");
    //         },
    //         setDefaultTableName : function (cb,tableName) {
    //             database.methods().setDefaultTableName(tableName);
    //             cb(null,"设置完成");
    //         },
    //         query : function (cb,sql) {
    //             if (database.isInit()) {
    //                 database.methods().query(sql,cb);
    //             } else {
    //                 cb("未初始化数据库");
    //             }
    //         },
    //         destroy : function (cb) {
    //             if (database.isInit()) {
    //                 database.destroy(cb);
    //             } else {
    //                 cb("未初始化数据库");
    //             }
    //         },
    //         fetchDBS : function (cb) {
    //             database.methods().fetchDBS(cb);
    //         },
    //         insert : function (cb,obj,dbname,tableName) {
    //             if (database.isInit()) {
    //                 database.methods().insert(obj.obj,cb,obj.dbname,obj.tableName);
    //             } else {
    //                 cb("未初始化数据库");
    //             }
    //         },
    //         delete : function (cb,obj,dbname,tableName) {
    //             if (database.isInit()) {
    //                 database.methods().delete(obj.obj,cb,obj.dbname,obj.tableName);
    //             } else {
    //                 cb("未初始化数据库");
    //             }
    //         },
    //         update : function (cb,obj,dbname,tableName) {
    //             if (database.isInit()) {
    //                 database.methods().update(obj.obj,cb,obj.dbname,obj.tableName);
    //             } else {
    //                 cb("未初始化数据库");
    //             }
    //         },
    //         select : function (cb,obj,dbname,tableName) {
    //             if (database.isInit()) {
    //                 database.methods().select(obj.obj,cb,obj.dbname,obj.tableName);
    //             } else {
    //                 cb("未初始化数据库");
    //             }
    //         }
    //     };
    
    let tempRequestContent = "";
    let workDir = "";
    let saveDom = {
        over : false,
        error : ""
    };

    /**
     * 如果事件中仅仅有一个参数，则 param 对应参数
     * 如果超过一个，则 param 以对象传递
     *  例如 mysql 的 insert 接口
     *      param = { obj : obj , dbname : dbname , tableName : tableName }
     *
     * ▲特别说明，这里的结构必须遵循的规范如下
     *      其中 cb 为一个返回值，用于将结果返回给前端
     *      obj 不是必选项，根据程序设置，为 前端 发送给后端的数据对象
     *      function(cb,obj) {
     *          //第一个参数必须是一个错误对象或者 null
     *          cb(err,ret_1,ret_2,...)
     *      }
     * */
    let events = {
        mysql : mysql || {},
        fildDBInstance,
        log,
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

    /**
     * 该函数的目的是将整个程序运行过程中日志记录进行简单封装便于和其他模块进行整合
     * 简单的结构为(需要重写请阅读以下文字)
     * var logManager = function(logKeeper) {
     *      var keepType = "";
     *      return {
     *          order : function(type) {
     *              unzip if it is necessary
     *              //keepType = type;
     *          },
     *          keepLog : function(err,msg) {
     *              use keepType to select one way to keep log
     *              logKeeper.keepLog(msg);
     *          }
     *      }
     * }(logKeeper);
     * 其中 logKeeper 必须提供一些 log 操作手段、接口，用于处理日志信息
     * 其中的 keepType 作为一种保持 log 的标记，用于 log 有多种类型时，
     *      例如 系统日志、用户操作日志 需要分开记录时，又或者需要将错误日志和正常日志进行分开
     * 这里的 order 接口，历史原因必须保留，即便是一个空接口也是可以保证程序正常运行
     * keepLog 这里将获取两个参数，分别为 err 和 content
     *      err 为 null 时表示运行过程无误，否则将是一个 Error 对象
     *      content 是程序运行过程中产生的将发送会前端的数据
     *
     * ▲特别说明，这里的 logManager 是服务于 前端和后台进行通信时被用于其运行过程的，
     *      过程中的所有接口运行结束后会调用其中的 keepLog　进行日志记录，
     *      并且所有接口的调用规范为
     *      err = err                   //错误对象、null
     *      content = [err,ret_1,ret_2] //其中的错误对象被复制作为调用的第一个函数
     * */
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
            if (ev) {
                ev.bind(null,function(){
                    var ret = arguments;
                    logManager.keepLog(ret[0],ret);
                    event.sender.send("fetchBack",ret);
                })(obj.param || {});
            } else {
                logManager.keepLog("error","无法找到该命令");
                event.sender.send("fetchBack",["找不到该命令"]);
            }
        }
    }
});