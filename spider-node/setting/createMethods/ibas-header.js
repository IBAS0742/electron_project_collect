if (window.parent == window) {if (createMethods && createMethods instanceof Object) {} else {createMethods = {};}} else {if (window.parent.createMethods instanceof Object) {} else {window.parent.createMethods = {};}};(window.parent.createMethods || window.createMethods)["ibas-header"] =
    function (val,times) {
	/* 函数内容 */
	return val + "=" + times;
}