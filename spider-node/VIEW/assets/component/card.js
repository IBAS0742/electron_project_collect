Vue.component("vCard",{
    template :
        '<div class="card">\
            <div class="header">\
                <h4 class="title">{{title}}</h4>\
                <p class="category">{{subtitle}}</p>\
            </div>\
            <div class="content table-responsive table-full-width">\
                <slot name="content"></slot>\
            </div>\
        </div>',
    props : ["title","subtitle"]
});