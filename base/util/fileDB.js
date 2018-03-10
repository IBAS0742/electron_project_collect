
module.exports.fildDB = function (fs,baseDir,isJSON) {
    let fileDB_ = null;
    baseDir += (baseDir[baseDir.length - 1] == '/' ? '' : '/');

    // fs.readdir(rootDir + "/setting/request",function(err,ret){
    fs.readdir(baseDir,function(err,ret){
        if (err) {
            throw err;
        } else {
            fileDB_ = ret;
        }
    });

    var methods = {
        /**
         * obj = { name : "函数名称" , obj : "配置内容对象" }
         * */
        createOrUpdate : function (cb,obj) {
            if (fileDB_.indexOf(obj.name) + 1) {
                fs.writeFile(baseDir + obj.name, isJSON ? JSON.stringify(obj.obj) : obj.obj,
                    function (err,ret) {
                        if (err) {
                            cb("更新失败");
                        } else {
                            cb(null,"更新成功");
                        }
                    }
                );
            } else {
                fs.writeFile(baseDir + obj.name, isJSON ? JSON.stringify(obj.obj) : obj.obj,
                    function (err,ret) {
                        if (err) {
                            cb("创建失败");
                        } else {
                            fileDB_.push(obj.name);
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
            if (fileDB_.indexOf(name) + 1) {
                fs.unlink(baseDir + name,function (err,ret) {
                    if (err) {
                        cb("删除失败");
                    } else {
                        fileDB_.splice(fileDB_.indexOf(name),1);
                        cb(null,"删除成功");
                    }
                });
            } else {
                cb("文件不存在");
            }
        },
        getAll : function (cb) {
            cb(null,fileDB_);
        },
        fetch : function (cb,name) {
            fs.readFile(baseDir + name,"utf-8",cb);
        }
    };
    return methods;
};