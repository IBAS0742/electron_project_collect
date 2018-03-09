//这里将函数定义为页面加载完成时运行，这里可以是获取页面的某一个信息，
//获取成功后将信息发送到后端进行保存，
//当前只能进行一次保存
window.onload = function () {
	/*
	var obj = [];
	Array.prototype.slice.call(
		document.getElementsByTagName("tbody")[0]
			.getElementsByTagName("tr")
		).forEach((tr) => {
			var item = [];
			Array.prototype.slice.call(tr.children)
				.forEach((td) => {
					item.push(td.innerText);
				});
			obj.push(item);
		});
	*/
	//获取通信类
	const ipc = require('electron').ipcRenderer;
	//发起和后端的通信
	ipc.send("fetchFore",{
		//调用后端的文件缓存方法
		event : "file-saveDom",
		//将 header 和 body 两部分信息发送给后端保存 
		//param : JSON.stringify(obj),
		param : document.head.innerHTML + document.body.innerHTML,
		//发生错误时进行日志记录
		log : "error"
	});
};