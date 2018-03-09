if (window.parent == window) {if (createMethods && createMethods instanceof Object) {} else {createMethods = {};}} else {if (window.parent.createMethods instanceof Object) {} else {window.parent.createMethods = {};}};(window.parent.createMethods || window.createMethods)["屋宇署"] =
/**
 * val 设置值
 * times 请求次数
 */
function (url,times) {
	/* 函数内容 */
	return url + "&page=" + times;
}