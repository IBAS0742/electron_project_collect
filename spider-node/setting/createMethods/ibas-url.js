if (window.parent == window) {if (createMethods && createMethods instanceof Object) {} else {createMethods = {};}} else {if (window.parent.createMethods instanceof Object) {} else {window.parent.createMethods = {};}};(window.parent.createMethods || window.createMethods)["ibas-url"] =
    function (val,times) {
	/* 函数内容 */
	var rnd = parseInt(Math.random() * 100);
	
	return val + "/" + times + "/" + rnd;
}