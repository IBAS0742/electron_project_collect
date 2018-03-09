var mysqlPool = {};
const uuidV1 = require('uuid/v1');
var fs = require("fs");

var connetctionParam_ = require("./../setting/database.json");

var connetctionParam = function (connetctionParam,cb) {
    if (!connetctionParam) {
        cb(null,connetctionParam_);
    } else {
        connetctionParam_.host = connetctionParam.host || connetctionParam_.host;
        connetctionParam_.user = connetctionParam.user || connetctionParam_.user;
        connetctionParam_.password = connetctionParam.password || connetctionParam_.password;
        fs.writeFileSync( './setting/database.json',JSON.stringify(connetctionParam_));
        cb(null,connetctionParam_);
    }
};

var init = function () {
    if (!connetctionParam_) {
        return "请先配置数据库连接信息";
    } else {
        mysqlPool = require("sqlpool").sqlpool;
        return mysqlPool.init(connetctionParam_);
    }
};

var isInit = function () {
    return mysqlPool.pool ? true : false;
};

var methods = function () {
    return mysqlPool.methods;
};

var destroy = function (cb) {
    mysqlPool.pool().end(function (err) {
        cb(err,"关闭成功");
        mysqlPool = null;
    });
};

module.exports.database = {
    connetctionParam,
    init,
    isInit,
    methods,
    destroy
};
