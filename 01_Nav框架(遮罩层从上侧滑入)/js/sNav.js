/*
 * sNav:导航栏主函数
 * @param:NavClass:导航栏类名，一般为ul的类名
 *
 */
function sNav(NavClass) {
	var _this = this;
	//获得所有sNav
	var oNav = _this.getByClass(document, NavClass)[0]; //获取类名为navClass的元素
	var aItem = oNav.getElementsByTagName('li'); //获取所有的li元素，li为导航子项
	this.aHoverItem = [];
	this.aA = oNav.getElementsByTagName('a'); //ul中所有的a标签
	for (var i = 0; i < aItem.length; i++) {
		//获取原Item样式
		var itemWidth = aItem[i].offsetWidth; //获取li的宽度
		var itemHeight = oNav.offsetHeight; //获取li的高度，即ul的高度

		var oHoverItem = document.createElement('span'); //创建一个span元素
		this.aHoverItem.push(oHoverItem); //将span推入数组

		//创建滑动容器并设置好位置
		var itemWrap = document.createElement('div'); //创建一个div元素，并返回该元素的指针
		this.aA[i].appendChild(itemWrap); //将div元素放置到a标签内部
		itemWrap.appendChild(oHoverItem); //将span元素放入该div中
		itemWrap.appendChild(aItem[i]); //将li元素放入div中

		//布局转换
		itemWrap.style.position = 'absolute'; //div绝对定位并向上移动li的高度的值，由于a标签overflow为hidden，且a标签的高度为li的高度，则意味着只能显示li元素在窗口上
		itemWrap.style.background = 'yellow';
		//最外层容器占位
		this.aA[i].style.width = itemWidth + 'px'; //设置a标签的宽度为li的宽度
		this.aA[i].style.height = itemHeight + 'px'; //设置a标签的高度为li的高度
		//设置itemWrap的Top值
		itemWrap.style.top = -itemHeight + 'px'; //设置div的top值为向上移动li的高度
		//传递参数-滑动距离
		itemWrap.slideHeight = itemHeight;
		//设置item样式
		aItem[i].style.padding = '0';
		aItem[i].style.lineHeight = itemHeight + 'px';
		//设置oHoverItem样式
		oHoverItem.style.height = itemHeight + 'px';
		oHoverItem.style.width = itemWidth + 'px';
		oHoverItem.style.display = 'block';
		oHoverItem.style.lineHeight = itemHeight + 'px';
		oHoverItem.innerHTML = this.hoverText ? this.hoverText : aItem[i].innerHTML;

		//绑定事件
		function eventRegister(itemWrap) {
			_this.myAddEvent(itemWrap, 'mouseover', function(ev) {
				_this.hoverIn(ev, itemWrap);
			});
			_this.myAddEvent(itemWrap, 'mouseout', function(ev) {
				_this.hoverOut(ev, itemWrap);
			});
		}
		eventRegister(itemWrap);

	}
	//默认参数设置
	this.slideSpeed = 8;
}

sNav.prototype.setText = function(json) {
	//设置hoverItem内容
	for (var i in json) {
		this.aHoverItem[i].innerHTML = json[i];
	};
}

sNav.prototype.hoverIn = function(ev, itemWrap) { //鼠标移入，则将div向下移动，top恢复到0
	this.startMove(itemWrap, {
		'top': 0
	});
}

sNav.prototype.hoverOut = function(ev, itemWrap) { //鼠标移出，则将div还原，top还原为之前的-li高度
	this.startMove(itemWrap, {
		'top': -itemWrap.slideHeight
	});
}

sNav.prototype.startMove = function(obj, json, fn) {
		var nowAttr; //Integer，保存当前值
		var speed; //速度
		var k = this.slideSpeed; //this指的是调用该startMove函数的this，即sNav。
		var delay = 20; //每隔多久运行一次定时器
		var _this = this;
		clearInterval(obj.moveTimer); //初始化清空定时器
		obj.moveTimer = setInterval(function() {
			var stop = true;
			for (var attr in json) {
				var gotStyle = _this.getStyle(obj, attr); //获取当前属性
				var target = json[attr]; //获取目标属性需要到达的值
				nowAttr = parseInt(gotStyle, 10); //保存当前值，将值中的符号去掉，例如Px/em等
				if (nowAttr != target) { //如果目标属性尚未到达，则不停止计时器
					stop = false;
				}
				if (stop) { //如果属性完成，则清空定时器
					clearInterval(obj.moveTimer);
					fn && fn(); //回调函数，如果fn存在，则执行fn
				} else {
					speed = (target - nowAttr) / k; //计算移动速度， 当离开目标值距离越小， 则速度也越小
					speed = target > nowAttr ? Math.ceil(speed) : Math.floor(speed); //如果iSpeed是正值，则向上取整，否则，向下取整
					obj.style[attr] = (nowAttr + speed) + "px"; //应用新属性值
				}
			}
		}, delay);
	}
	/*
	 * 事件监听方法：myAddEvent
	 *@param:obj：事件元素;evName:需要监听的事件名,fn:事件函数
	 */
sNav.prototype.myAddEvent = function(obj, evName, fn) {
		if (obj.attachEvent) { //IE：注意为倒序执行，且事件类型必须加'on'，例如onclick
			obj.attachEvent('on' + evName, function() {
				fn.call(this); //避免this被修改
			});
		} else {
			obj.addEventListener(evName, fn, false); //通用方法，支持IE>=9,FF,Chrome,Opera
		}
	}
	/*
	 * getByClass:根据Class名称来获取元素
	 * @return：数组aResult
	 * @param：oParent:父级元素；className：类名
	 *
	 */
sNav.prototype.getByClass = function(oParent, className) {
		var aResult = [];
		var arr = oParent.getElementsByTagName('*');
		var re = new RegExp('\\b' + className + '\\b', i);
		//\b为独立部分，匹配class名称为className的
		for (var i = 0; i < arr.length; i++) {
			if (re.test(arr[i].className)) {
				aResult.push(arr[i]);
			}
		};
		return aResult;
	}
	/*
	 * getStyle:获取元素样式
	 * @param obj:元素，attr：属性
	 * @return：返回属性值
	 *
	 */
sNav.prototype.getStyle = function(obj, attr) {
	var value;
	if (window.getComputedStyle) { //IE
		value = getComputedStyle(obj, false)[attr];
	} else {
		value = obj.currentStyle[attr];
	}
	value = parseInt(value, 10);
	return value;
}