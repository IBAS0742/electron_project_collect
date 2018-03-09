Vue.component("vInput",{
    template :
        '<div v-for="" class="col-md-6">\
            <div class="form-group">\
                <label>{{inp.label}}</label><span v-if="inp.error" v-html="inp.error" style="margin-left:0.5em;"></span>\
                <input @change="change" :type="type" class="form-control" :placeholder="inp.placeholder" v-model="inp.value">\
            </div>\
        </div>',
    /**
     * inp
     *      label
     *      placeholder
     *      value
     *      error
     * */
    props : ['inp','type'],
    methods : {
        change : function () {
            this.inp.error = "";
        }
    }
});