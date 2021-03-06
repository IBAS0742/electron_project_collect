/**
 * type 为 hidden 的内容将不会绘制，并直接加入到
 *
 * 以下用到的 value 都是默认值
 *
 * 使用 date 需要用到 laydate
 *
 * tree 用的是 z-tree，需要使用到 layer，用到 jquery(当前页面 jQuery 记得注入基本配置)，并且使用 sailPromise
 * ▲这里使用的 jQuery 统一使用 jQuery 代替
 * */

/**
 * 使用方法
 *
 *      <layui-form :eles="eles" :verify="verify" @submit="submitToServer" :submit-btn="submitBtn" @test="ptest"></layui-form>
        new Vue({
            el : '#app',
            data : {
                eles : [
                    //表单部件定义看定义处即可
                    {
                        type : "input",
                        label : 'ibas',
                        placeholder : "ibas",
                        name : "input",
                        value : "inp"
                    }
                ],
                verify : {
                    //默认有部分定义(返回false表示通过验证，不通过返回理由)
                    a : function () {
                        return false;
                    }
                },
                submitBtn : [
                    {
                        text : "提交",
                        type : "submit" //目前只定义改类型
                    },{
                        text : "其他",
                        //type : "other",
                        $emit : "test"
                    }
                ]
            },
            methods : {
                //verify 所有验证方法
                //fields 表单信息
                submitToServer : function (fields,verify) {
                    console.log(a);
                    console.log(b);
                },
                //获取子部件的this对象
                ptest : function($this) {
                }
            }
        });
 * */
/**
 * 例如身份证修改时，连带修改出生日期和年龄
 * 那么字段就是 身份证，绑定字段1，2就是出生日期和年龄
 * */
/*
bindMethods = {
    "字段名称" : [
        {
            name : "绑定字段名称1",
            dear : function (val) {
                return val.split("-")[0];
            }
        },
        {
            name : "绑定字段名称1",
            dear : function (val) {
                return val.split("-")[0];
            }
        }
    ]
};
*/

Vue.component("layuiForm",{
    template :
        '<div class="layui-form">\
            <div :ref="ele.type" class="layui-form-item" :style="formStyle" v-for="(ele,ind) in eles" :key="ind">\
                <div                 v-if="ele.type==\'hidden\'"              style="display: none;"></div>\
                <layui-input        v-else-if="ele.type==\'input\'"          :ele="ele"></layui-input>\
                <layui-password     v-else-if="ele.type==\'password\'"     :ele="ele"></layui-password>\
                <layui-select       v-else-if="ele.type==\'select\'"        :ele="ele"></layui-select>\
                <layui-checkbox     v-else-if="ele.type==\'checkbox\'"      :ele="ele"></layui-checkbox>\
                <layui-radio        v-else-if="ele.type==\'radio\'"         :ele="ele"></layui-radio>\
                <layui-switch       v-else-if="ele.type==\'switch\'"        :ele="ele"></layui-switch>\
                <layui-textarea     v-else-if="ele.type==\'textarea\'"      :ele="ele"></layui-textarea>\
                <layui-date         v-else-if="ele.type==\'date\'"           :ele="ele"></layui-date>\
                <layui-tree         v-else-if="ele.type==\'tree\'"           :ele="ele"></layui-tree>\
                <div v-else v-html="ele.html"></div>\
            </div>\
            <div v-if="submitBtn" class="layui-form-item"><div class="layui-input-block">\
                <button class="layui-btn" v-for="(btn,ind) in submitBtn" :key="ind" @click.stop="submitBtnClick(ind)" v-html="btn.text"></button>\
            </div></div>\
        </div>',
    //props : ['eles','verify','submitBtn'],
    props : {
        //表单元素
        eles : {
            type: Array,
            required: true
        },
        //提交按钮元素
        submitBtn : {
            type: Array,
            required: false
        },
        //验证部分函数
        verify : {
            type: Object,
            required: false
        },
        //表单样式
        formStyle : {
            type : String,
            required : false
        },
        //绑定方法
        bindMethods : {
            type : Object,
            required : false
        }
    },
    data : function () {
        return {
            dVerify : {
                _verify_ : function (fields,verify) {
                    var err = "";
                    fields.every(function (field) {
                        if (field.verify && field.verify in verify) {
                            err = verify[field.verify](field.value,verify);
                            return !err;
                        } else {
                            return true;
                        }
                    });
                    return err;
                },
                required: function(value){
                    if(!/[\S]+/.test(value)) return '必填项不能为空';
                },
                phone: function(value){
                    if(!/^1\d{10}$/.test(value)) return '请输入正确的手机号';
                },
                email: function(value){
                    if(!/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(value)) return '邮箱格式不正确';
                },
                url: function(value){
                    if(!/(^#)|(^http(s*):\/\/[^\s]+\.[^\s]+)/.test(value)) return '链接格式不正确';
                },
                number: function(value){
                    if(!value || isNaN(value)) return '只能填写数字'
                },
                date: function(value){
                    if(!/^(\d{4})[-\/](\d{1}|0\d{1}|1[0-2])([-\/](\d{1}|0\d{1}|[1-2][0-9]|3[0-1]))*$/.test(value)) return '日期格式不正确';
                },
                identity: function(value){
                    if(!/(^\d{15}$)|(^\d{17}(x|X|\d)$)/.test(value)) return '请输入正确的身份证号';
                }
            }
        }
    },
    computed : {
        fields : function () {
            var fs = {},
                ele = this.eles;
            for (var i = 0;i < ele.length;i++) {
                if (ele[i].type == "hidden") {
                    fs[ele[i].name] = {
                        value : ele[i].value,
                        verify : "",
                        ind : i
                    };
                } else {
                    if (ele[i].name) {
                        fs[ele[i].name] = {
                            value : ele[i].value,
                            verify : ele[i].verify || "",
                            ind : i
                        };
                    }
                }
            }
            return fs;
        },
        rSubmitBtn : function () {
            console.log(this.submitBtn);
            return null;
        }
    },
    methods : {
        valueChange : function (name,value,fn) {
            if (name in this.fields) {
                if (fn) {
                    value = fn(this.fields[name],value);
                }
                this.fields[name].value = value;
                //console.log(this.fields);
                if (this.bindMethods) {
                    if (name in this.bindMethods) {
                        var $this = this;
                        this.bindMethods[name].forEach(function (obj) {
                            $this.eles[$this.fields[obj.name].ind].value = obj.dear(value);
                        });
                    }
                }
            }
        },
        submitBtnClick : function (ind) {
            if (this.submitBtn[ind].type == "submit") {
                this.submit();
            } else {
                var $emit = this.submitBtn[ind].$emit;
                if ($emit) {
                    this.$emit($emit,this);
                }
            }
        },
        submit : function () {
            this.$emit('submit',this.fields,this.dVerify);
        }
    },
    mounted : function () {
        for (var i in this.verify) {
            this.dVerify[i] = this.verify[i];
        }
        (this.$refs.hidden || []).forEach(function (ele) {
            ele.style.display = "none";
        });
    },
    watch : {
        dVerify : function (val) {
            for (var i in this.verify) {
                this.dVerify[i] = this.verify[i];
            }
        }
    }
});
/**
 * label : html 字符串
 * name : 提交服务器名称
 * placeholder : 提示文字
 * value : 默认值
 * */
Vue.component('layuiInput',{
    template :
        '<div>\
            <label class="layui-form-label" v-html="ele.label"></label>\
            <div class="layui-input-block">\
                <input v-model="ele.value" @change="change" type="text" :name="ele.name" :placeholder="ele.placeholder" class="layui-input"/>\
            </div>\
        </div>',
    props : ['ele'],
    data : function () {
        return {
            //value : this.ele.value || ""
        };
    },
    computed : {
        value : function () {
            return this.ele.value || "";
        }
    },
    methods :  {
        change : function () {
            this.$parent.valueChange(this.ele.name,this.value,null);
        }
    },
    mounted : function () {
        this.$parent.valueChange(this.ele.name,this.value,null);
    }
});
/**
 * 同 layuiInput 添加了密码的查看功能
 * */
Vue.component('layuiPassword',{
    template :
        '<div>\
            <label class="layui-form-label" v-html="ele.label"></label>\
            <div class="layui-input-block">\
                <input v-model="ele.value" @change="change" style="width: calc(100% - 80px);float: left;" :type="type" :name="ele.name" :placeholder="ele.placeholder" class="layui-input"/>\
                <div @click="view($event)" class="layui-form-mid layui-word-aux" style="float: left;width: 60px;margin-left: 5px;cursor: pointer;">{{viewPassword}}</div>\
            </div>\
        </div>',
    props : ['ele'],
    data : function () {
        return {
            type : "password",
            viewPassword : "查看密码",
            canView : false,
            //value : this.ele.value || ""
        }
    },
    computed : {
        value : function () {
            return this.ele.value || "";
        }
    },
    methods : {
        view : function ($e) {
            if (this.canView) {
                this.type = "password";
                this.viewPassword = "查看密码";
                //$e.target.style.color = "#000";
            } else {
                this.type = "text";
                this.viewPassword = "隐藏密码";
                //$e.target.style.color = "#01ff0b";
            }
            this.canView = !this.canView;
        },
        change : function () {
            this.$parent.valueChange(this.ele.name,this.value,null);
        }
    },
    mounted : function () {
        this.$parent.valueChange(this.ele.name,this.value,null);
    }
});
/**
 * label : html 字符串
 * name : 提交服务器名称
 * value 提交服务器的值（默认值）
 * //content 显示内容（html）（默认值对应显示给用户看的内容）
 * options : [{
 *              value 提交服务器的值
 *              label 显示内容（html）
 *          }]
 * */
Vue.component('layuiSelect',{
    template :
        '<div>\
            <label class="layui-form-label" v-html="ele.label"></label>\
            <div class="layui-input-block">\
                <div @click="showSelection" class="layui-form-select" ref="tar">\
                    <div  class="layui-select-title">\
                        <input type="text"  @blur.stop="hideSelection"\
                            placeholder="-- 请选择 --" \
                            v-model="label" readonly=""\
                            class="layui-input"/>\
                            <i class="layui-edge"></i>\
                    </div>\
                    <dl class="layui-anim layui-anim-upbit" style="">\
                        <dd lay-value="" class="layui-select-tips" @click.stop="change()">请选择</dd>\
                        <dd v-for="(op,ind) in ele.options" :key="ind" @click.stop="change(op.value,op.label)" v-html="op.label"></dd>\
                    </dl>\
                </div>\
            </div>\
        </div>',
    props : ['ele'],
    data : function () {
        return {
            value : this.ele.value || "",
            label : "",
            show : false
        }
    },
    methods : {
        change : function (value) {
            var label = "";
            if (value) {
                for (var i = 0;i < this.ele.length;i++) {
                    if (this.ele[i].value == value) {
                        label = this.ele[i].label;
                        break;
                    }
                }
                if (label) {
                    this.$parent.valueChange(this.ele.name,value,null);
                }
            } else {
                this.$parent.valueChange(this.ele.name,"",null);
                value = "";
                label = "-- 请选择 --";
            }
            this.value = value;
            this.label = label;
            this.show = false;
            this.$refs.tar.classList.remove("layui-form-selected");
        },
        showSelection : function () {
            this.show = !this.show;
            if (this.show) {
                this.$refs.tar.classList.add("layui-form-selected");
                return ;
            } else {
                this.$refs.tar.classList.remove("layui-form-selected");
            }
        },
        hideSelection : function () {
            var $this = this;
            setTimeout(function () {
                $this.$refs.tar.classList.remove("layui-form-selected");
                $this.show = false;
            },300);
        }
    },
    mounted : function () {
        this.$parent.valueChange(this.ele.name,this.value,null);
    }
});
/**
 * label
 * name
 * split    分割字符，默认为 |
 * skin primary
 * value    多个值使用分割符分开，例如 a|b|c，这里要和指定分割符一致（默认值）
 * options : [
 *              {
 *                  label :
 *                  value :
 *              }
 *          ]
 * */
Vue.component('layuiCheckbox', {
    template:
        '<div>\
            <label class="layui-form-label" v-html="ele.label"></label>\
            <div class="layui-input-block">\
                <div  v-for="(op,ind) in options"\
                    ref="tar"\
                    target="target" @click.stop="change(ind)" \
                    class="layui-unselect layui-form-checkbox" :lay-skin="ele.skin">\
                    <span >{{op.label}}</span>\
                    <i class="layui-icon"></i>\
                </div>\
            </div>\
        </div>',
    props: ['ele'],
    computed : {
        options : function () {
            var op = [];
            var ops = this.ele.options;
            var split = this.ele.split || "|";
            var vals = [];
            if (this.ele.value) {
                vals = this.ele.value.split("|");
            }
            for (var i = 0;i < ops.length;i++) {
                if (vals.includes(ops[i].value)) {
                    op.push(Object.assign({check : true},ops[i]));
                } else {
                    op.push(Object.assign({check : false},ops[i]));
                }
            }
            return op;
        }
    },
    methods : {
        change : function (ind) {
            var $e = this.$refs.tar[ind],
                option = this.options[ind],
                value = option.value,
                check = !option.check;
            this.options[ind].check = check;
            if (check) {
                $e.classList.add("layui-form-checked");
            } else {
                $e.classList.remove("layui-form-checked");
            }
            var split = this.ele.split || "|";
            this.$parent.valueChange(this.ele.name,value,function (out,split,oldV,newV) {
                if (out) {
                    return oldV + split + newV;
                } else {
                    return oldV.split(split).filter(function (t) {
                        return t != newV;
                    }).join(split);
                }
            }.bind(null,check,split));
        }
    },
    mounted : function () {
        var tars = this.$refs.tar,
            v = [],
            split = this.ele.split || "|";
        for (var i = 0;i < this.options.length;i++) {
            if (this.options[i].check) {
                tars[i].classList.add("layui-form-checked");
                v.push(this.options[i].value);
            }
        }
        this.$parent.valueChange(this.ele.name,v.join(split),null);
    }
});
/**
 * label
 * name
 * value
 * options : [
 *              {
 *                  label :
 *                  value
 *              }
 *          ]
 * */
Vue.component('layuiRadio', {
    template:
        '<div>\
            <label class="layui-form-label" v-html="ele.label"></label>\
            <div class="layui-input-block">\
                <div  v-for="(op,ind) in options"\
                    ref="tar"\
                    target="target" @click.stop="change(ind)" \
                    class="layui-unselect layui-form-radio">\
                    <i class="layui-anim layui-icon layui-anim-scaleSpring"></i>\
                    <div style="font-size: 14px;">{{op.label}}</div>\
                </div>\
            </div>\
        </div>',
    props: ['ele'],
    data : function () {
        return {
            select : -1
        }
    },
    computed : {
        options : function () {
            var op = [],
                val = this.ele.value || "";
            for (var i = 0;i < this.ele.options.length;i++) {
                if (val == this.ele.options[i].value) {
                    op.push(Object.assign({check : true},this.ele.options[i]));
                } else {
                    op.push(Object.assign({check : false},this.ele.options[i]));
                }
            }
            return op;
        }
    },
    methods : {
        change : function (ind) {
            var $e = this.$refs.tar[ind],
                option = this.options[ind],
                value = option.value,
                check = !option.check;
            this.options[ind].check = check;
            if (ind == this.select) {
                return;
            } else {
                if (this.select == -1) {
                } else {
                    this.options[this.select].check = false;
                    this.$refs.tar[this.select].classList.remove("layui-form-radioed");
                    this.$refs.tar[this.select].style.boxShadow = "none";
                }
                this.select = ind;
                $e.classList.add("layui-form-radioed");
                $e.style.boxShadow = "0px 2px #60b879";
            }
            this.$parent.valueChange(this.ele.name,value);
        }
    },
    mounted : function () {
        var tars = this.$refs.tar,
            $this = this;
        this.options.forEach(function (op,ind) {
            if (op.check) {
                tars[ind].classList.add("layui-form-radioed");
                tars[ind].style.boxShadow = "0px 2px #60b879";
                $this.select = ind;
                $this.$parent.valueChange($this.ele.name,op.value);
                return false;
            } else {
                return true;
            }
        });
    }
});
/**
 * label : html 字符串
 * name : 提交服务器名称
 * word a|b 开关时的文字
 * value 可逻辑化的值，默认值
 * */
Vue.component('layuiSwitch', {
    template:
        '<div>\
            <label class="layui-form-label" v-html="ele.label"></label>\
            <div class="layui-input-block">\
                <div @click="change()" ref="tar" class="layui-unselect layui-form-switch" lay-skin="_switch">\
                    <em>{{showWord}}</em><i></i>\
                </div>\
            </div>\
        </div>',
    props: ['ele'],
    data : function () {
        return {
            //open : 0
        }
    },
    computed : {
        open : function () {
            return this.ele.value ? 1 : 0;
        },
        word : function () {
            if (this.ele.word) {
                var w = this.ele.word.split("|");
                if (w.length == 2) {
                    return [w[0],w[1]];
                } else {
                    return ["",""];
                }
            } else {
                return ["",""];
            }
        },
        showWord : function () {
            return this.word[this.open];
        }
    },
    methods :  {
        change : function () {
            var el = this.$refs.tar;
            this.ele.value = 1 - this.ele.value;
            if (this.ele.value) {
                el.classList.add('layui-form-onswitch');
            } else {
                el.classList.remove('layui-form-onswitch');
            }
            this.$parent.valueChange(this.ele.name,this.ele.value,null);
        }
    },
    mounted : function () {
        if (this.open) {
            this.$refs.tar.classList.add('layui-form-onswitch');
            this.$parent.valueChange(this.ele.name,this.open ? 1 : 0,null);
        }
    }
});
/**
 * label : html 字符串
 * name : 提交服务器名称
 * placeholder : 提示文字
 * value
 * */
Vue.component('layuiTextarea', {
    template:
        '<div>\
            <label class="layui-form-label" v-html="ele.label"></label>\
            <div class="layui-input-block">\
                <textarea @change="change" v-model="value" :placeholder="ele.placeholder" class="layui-textarea"></textarea>\
            </div>\
        </div>',
    props: ['ele'],
    computed : {
        value : function () {
            return this.ele.value || "";
        }
    },
    data : function () {
        return {
            //value : this.ele.value || ""
        }
    },
    methods :  {
        change : function () {
            this.$parent.valueChange(this.ele.name,this.value,null);
        }
    },
    mounted : function () {
        this.$parent.valueChange(this.ele.name,this.value,null);
    }
});
/**
 * label
 * value
 * name
 * */
Vue.component('layuiDate', {
    template:
        '<div>\
            <label class="layui-form-label" v-html="ele.label"></label>\
            <div class="layui-input-block">\
                <button ref="dateBtn" style="min-width: 100px;" @click="show" :id="id" class="layui-btn layui-btn-primary layui-btn-sm">\
                    {{value}}\
                </button>\
            </div>\
        </div>',
    props: ['ele'],
    computed : {
        value : function () {
            return this.ele.value || "";
        },
        id : function () {
            return "date_" + parseInt(Math.random() * 10000);
        }
    },
    methods :  {
        change : function () {
            this.$parent.valueChange(this.ele.name,this.value,null);
        },
        show : function () {
            var $this = this;
            laydate.render({
                elem: "#" + this.id
                ,show: true //直接显示
                ,closeStop: "#" + this.id //这里代表的意思是：点击 test1 所在元素阻止关闭事件冒泡。如果不设定，则无法弹出控件
                ,done: function(value, date, endDate){
                    $this.$parent.valueChange($this.ele.name,value,null);
                    $this.ele.value = value;
                    // console.log(value); //得到日期生成的值，如：2017-08-18
                    // console.log(date); //得到日期时间对象：{year: 2017, month: 8, date: 18, hours: 0, minutes: 0, seconds: 0}
                    // console.log(endDate); //得结束的日期时间对象，开启范围选择（range: true）才会返回。对象成员同上。
                }
            });
        }
    },
    mounted : function () {
        this.$parent.valueChange(this.ele.name,this.value,null);
    },
    watch : {
        value : function () {
            this.$refs.dateBtn.innerText = this.value;
        }
    }
});
/**
 * label
 * value
 * content
 * name
 * setting : {
 *      divSetting : {  //显示目录结构的 div 设置
 *          style : ""
 *      },
 *      treeSetting : {    //数据级别设置
 *      }
 *      layerSetting : {    //layer 设置
 *      }
 *      promiseName : 统一使用 promise 进行数据初始化和传递
 *      //过滤方法，通过抛出异常表示数据不合理，错误信息会以提示抛出到 UI 界面送给用户
 *      filterSelect : function(nodes) {
 *          if (nodes.length > 10) {
 *              throw "选中条目超过 10 条";
 *          } else {
 *              return [{
 *                  value : "",
 *                  content : ""
 *              }];
 *          }
 *      }
 * }
 * */
Vue.component('layuiTree', {
    template:
        '<div>\
            <label class="layui-form-label" v-html="ele.label"></label>\
            <div class="layui-input-block">\
                <button ref="select"\
                    style="min-width: 100px;display: block;" \
                    @click="show" \
                    class="layui-btn layui-btn-primary layui-btn-sm">\
                    请选择\
                </button>\
                <fieldset ref="list" class="layui-elem-field site-demo-button" style="padding: 0.5em;display: none;">\
                    <div style="float:left;" ref="selectList"></div>\
                    <!--<button v-for="(con,ind) in content" :key="ind"\
                        class="layui-btn layui-btn-primary layui-btn-sm" \
                        style="min-width: 100px;">{{con}}</button>-->\
                    <button style="margin: 0 10px;" @click.stop="reselect" class="layui-btn layui-btn-primary layui-btn-sm"><i class="layui-icon">ဆ</i></button>\
                </fieldset>\
                <div :id="id" :style="divStyle"><ul :id="\'tree-\' + id" class="ztree"></ul></div>\
            </div>\
        </div>',
    props: ['ele'],
    computed : {
        value : function () {
            return this.ele.value || [];
        },
        content : function () {
            this.ele.content = this.ele.content ? this.ele.content : [];
            return this.ele.content;
        },
        id : function () {
            return "date_" + parseInt(Math.random() * 10000);
        },
        divStyle : function () {
            return ((this.ele.setting.divSetting || { style : ""}).style) += " display: none;";
        },
        treeSetting : function () {
            return Object.assign({
                data: {
                    simpleData: {
                        enable: true,
                        idKey: "id",
                        pIdKey: "parentId",
                        rootPId: "0"
                    },
                    key: {
                        children : "list",
                        url:"nourl"
                    }
                }},this.ele.setting.treeSetting || {});
        },
        layerSetting : function() {
            var set = {
                offset: '50px',
                skin: 'layui-layer-molv',
                title: "",
                area: ['300px', '450px'],
                shade: 0,
                shadeClose: false,
                btn: ['确定', '取消']
            };
            Object.assign(set,this.ele.setting.layerSetting);
            if (set.btn.length != 2) {
                set.btn = ['确定', '取消'];
                console.warn("set.btn.length must be two");
            }
            if (!set.title) {
                set.title = "请选择";
                //console.warn("title is not force to set.");
            }
            return set;
        },
        filterSelect : function () {
            if (this.ele.setting.filterSelect instanceof Function) {
                return this.ele.setting.filterSelect;
            } else {
                return function (nodes) {
                    var value = [];
                    nodes.forEach(function (node) {
                        value.push({
                            content : node.name,
                            value : node.id
                        });
                    });
                    return value;
                };
            }
        }
    },
    methods :  {
        change : function () {
            this.$parent.valueChange(this.ele.name,this.value,null);
            if (this.value.length) {
                this.$refs.select.style.display = "none";
                this.$refs.list.style.display = "block";
            } else {
                this.$refs.select.style.display = "block";
                this.$refs.list.style.display = "none";
            }
        },
        show : function () {
            if (this.treeInit) {
                var $this = this;
                var layerSetting = this.layerSetting;
                layer.open({
                    content: this.treeEle,
                    type: 1,
                    offset: layerSetting.offset,
                    skin: layerSetting.skin,
                    title: layerSetting.title,
                    area: layerSetting.area,
                    shade: layerSetting.shade,
                    shadeClose: layerSetting.shadeClose,
                    btn: ['确定', '取消'],
                    btn1: function (index) {
                        $this.layerId = index;
                        $this.selected = $this.treeListEle.getSelectedNodes();
                    }
                });
            } else {
                layer.msg("数据未初始化完成，请稍等");
            }
        },
        reselect : function () {
            if (this.value.length) {
                layer.confirm('你想重新选择?', {icon: 3, title:'提示'}, function(index){
                    layer.close(index);
                    var len = this.value.length;
                    for (var i = 0;i < len;i++) {
                        this.value.pop();
                        this.content.pop();
                    }
                    this.change();
                    this.show();
                }.bind(this));
            }
        }
    },
    data : function () {
        return {
            treeEle : "",
            treeListEle : "",
            //选中的树节点
            selected : [],
            layerId : -1,
            //树目录是否已经初始化完成
            treeInit : false
        }
    },
    mounted : function () {
        this.$parent.valueChange(this.ele.name,this.value,null);
        var $this = this;
        sailPromise.getPromise(this.ele.setting.promiseName).init().then(function (ret) {
            $this.treeEle = jQuery("#" + $this.id);
            $this.treeListEle = jQuery.fn.zTree.init(jQuery("#tree-" + $this.id), $this.treeSetting, ret);
            $this.treeInit = true;
        });
        if (this.value.length) {
            this.$refs.select.style.display = "none";
            this.$refs.list.style.display = "block";
            var htmlStr = "";
            for (var i = 0;i < this.content.length;i++) {
                htmlStr += '<button class="layui-btn layui-btn-primary layui-btn-sm" style="min-width: 100px;">' + this.content[i] + '</button>'
            }
            this.$refs.selectList.innerHTML = htmlStr;
        } else {
            this.$refs.select.style.display = "block";
            this.$refs.list.style.display = "none";
        }
    },
    watch : {
        selected : function (val,oldVal) {
            //判断选中的内容和是否需要关闭弹层
            var ret,err;
            try {
                ret = this.filterSelect(val);
            } catch(e) {
                err = e;
            }
            if (err) {
                //不通过，可能是内容不合理
                layer.msg(err);
            } else {
                //内容通过，可以进行下一步
                //关闭弹层
                layer.close(this.layerId);
                var len = this.value.length;
                for (var i = 0;i < len;i++) {
                    this.value.pop();
                    //this.content.pop();
                    this.content.pop();
                }
                len = ret.length;
                var htmlStr = "";
                for (var i = 0;i < len;i++) {
                    this.value.push(ret[i].value);
                    this.content.push(ret[i].content);
                    //this.content.push(ret[i].content);

                    //for (var i = 0;i < this.content.length;i++) {
                        htmlStr += '<button class="layui-btn layui-btn-primary layui-btn-sm" style="min-width: 100px;">' + ret[i].content + '</button>'
                    //}
                }
                this.$refs.selectList.innerHTML = htmlStr;
                this.change();
            }
        }
    }
});
