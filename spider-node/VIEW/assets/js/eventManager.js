var ipc = require('electron').ipcRenderer;
var eventManager = {};

var pageSaved = new Proxy({
    id : "",
    cb : function (id) {
        /**
         * 使用前先配置 id ，这里会进行检测 id
         * */
    },
    save : ""
},{
    set : function (obj,prop,value) {
        if (prop == "save") {
            obj.cb(obj.id,value);
        } else {
            obj[prop] = value;
        }
    }
});

var baseAPIELE = new Vue({
    el : "#baseAPIELE",
    data : {
        curAction : "",
        action : false,
        prompt : false,
        promptInfo : {
            placeholder : "请输入",
            title : "标题",
            value : ""
        }
    },
    methods : {
        close : function (content) {
            this.curAction = "";
            this[this.curAction] = false;
            this.action = false;
            baseAPI.cb(content || "");
        }
    },
    watch : {
        curAction : function (newV) {
            if (newV && newV in this) {
                this[newV] = true;
                this[newV + "Info"].value = "";
                this.action = true;
            }
        }
    }
});

var baseAPI = {
    /**
     * obj
     *      title : "",
     *      placeholder : "",
     *      event : function(){} or "name-list"
     * */
    prompt : function (obj) {
        baseAPIELE.promptInfo.title = obj.title || "请输入...";
        baseAPIELE.promptInfo.placeholder = obj.placeholder || "...";
        baseAPIELE.curAction = "prompt";
        if (obj.event instanceof Function) {
            this.cb = obj.event;
        } else {
            this.cb = function (event,ret) {
                if (ret) {
                    var list = event.split("-"),
                        ev = window;
                    list.forEach(function (li) {
                        ev = ev[li];
                    });
                    ev(ret);
                }
            }.bind(this,obj.event);
        }
    },
    changeBGURL : function (url) {
        ipc.send("fetchFore",{
            view : "viewOP",
            url : url
        });
    },
    cb : function () {
        
    },
    init : function () {
        ipc.send("fetchFore",{
            contact : "contact"
        });
    }
};

ipc.on("fetchBack",function (e,obj) {
    if (obj[0] == "baseAPI") {
        baseAPI[obj[1]](obj[2]);
    } else {
        eventManager.runing = false;
        eventManager.cbFn(obj);
    }
});

eventManager = new Proxy({
    workDir : "",
    events : {
        mysql : {
            connetctionParam : "mysql-connetctionParam",
            openConnection : "mysql-init",
            closeConnection : "mysql-destroy",
            state : "mysql-isInit",
            query : "mysql-query",
            fetchDBS : "mysql-fetchDBS",
            changeDB : "mysql-setDefaultDatabaseName",
            changeTable : "mysql-setDefaultTableName",
            insert : "mysql-insert",
            delete : "mysql-delete",
            update : "mysql-update",
            select : "mysql-select",
        },
        log : {
            sys : "log-fetchSysLog",
            all : "log-fetchAllLog",
            error : "log-fetchErrorLog",
            pass : "log-fetchPassLog",
            //需要制定清空哪一个
            clear : "log-clearLog",
            output : "log-output",
            read : "log-read"
        },
        request : {
            get : "request-get",
            post : "request-post",
            save : "request-saveTemp"
        },
        createMethods : {
            //除了增删改查，前端多一个 生成策略的重新获取
            refreshCreateMethods : function ($,createMethodName) {
                $("#" + createMethodName).remove();
                $("head").append('<script src="../setting/createMethods/' + createMethodName + '" id="' + createMethodName + '" time="' + (new Date()).getTime() + '"></script>')
            },
            create : "createMethods-create",
            delete : "createMethods-delete",
            update : "createMethods-update",
            getAll : "createMethods-getAll",
            fetch : "createMethods-fetch"
        },
        requestManager : {
            create : "requestManager-create",
            delete : "requestManager-delete",
            update : "requestManager-update",
            getAll : "requestManager-getAll",
            fetch : "requestManager-fetch"
        },
        file : {
            append : "file-append",
            write : "file-write",
            saveDom : "file-saveDom",
            setPath : "file-setPath",
            fetchSaveDom : "file-fetchSaveDom",
            fetchPreviewDear : "file-fetchPreviewDear",
            savePreivewDear : "file-savePreivewDear"
        }
    },
    eventStack : [],
    runing : false,
    cbFn : null,
    run (event,cb,arg,log) {
        if (!this.runing) {
            this.runing = true;
            this.cbFn = function (cb,ret) {
                (cb || function(){})(ret);
                if (this.eventStack.length) {
                    var es = this.eventStack.shift();
                    this.run(es.event,es.cb,es.arg);
                }
            }.bind(this,cb);
            ipc.send("fetchFore",{
                event : event,
                param : arg || "",
                log : log || ""
            });
        } else {
            this.eventStack.push({
                event,cb,arg
            });
        }
    },
    viewOP(event) {
        ipc.send("fetchFore",{
            view : "viewOP"
        });
    },
    query : function (sql,cb) {
        eventManager.run(eventManager.events.mysql.query,cb,sql,"error");
    },
    writeFile : function (fileName,content,cb) {
        if (!eventManager.workDir) {
            notify(null,"请选择一个工作路径");
            return;
        }
        eventManager.run(eventManager.events.file.write,cb,{
            name : eventManager.workDir + "\\" + fileName,
            content : content
        },"error");
    },
    appendFile : function (fileName,content,cb) {
        if (!eventManager.workDir) {
            notify(null,"请选择一个工作路径");
            return;
        }
        eventManager.run(eventManager.events.file.append,cb,{
            name : eventManager.workDir + "\\" + fileName,
            content : content
        },"error");
    }
},{
    set : function (obj,prop,value) {
        if (prop == "workDir") {
            eventManager.run(eventManager.events.file.setPath,() => {},value,"error");
        }
        obj[prop] = value;
    }
});
