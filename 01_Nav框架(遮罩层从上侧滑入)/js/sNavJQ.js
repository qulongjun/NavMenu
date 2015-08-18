/*
 * slideNav导航栏JQuery实现
 * @param:
 * className:类名，即ul的class名称。
 * wordColor:遮罩层的字体颜色
 * bgColor:遮罩层的背景颜色
 * titleArray:遮罩层标题内容数组，需一一对应
 * (c) Copyright 2015 瞿龙俊. All Rights Reserved.
 */
function sildeNav(className, wordColor, bgColor, titleArray) {
	if (!wordColor) { //如果用户没有输入字体颜色，则按照默认设置
		wordColor = '#000';
		bgColor = '#f5c1c1'
	} else {
		if (!bgColor) { //如果用户没设置背景颜色
			bgColor = '#f5c1c1'
		} else {
			if ((typeof bgColor) == 'object') {
				titleArray = bgColor;
				bgColor = '#f5c1c1';
			}
		}
	}
	if ((typeof wordColor) == 'object') {
		titleArray = wordColor;
		wordColor = '#000';
		bgColor = '#f5c1c1';
	}
	var $ul = $('.' + className); //获取菜单项
	var $a = $ul.children('a');
	var $li = $a.children('li'); //获取所有的li菜单子项
	var $divTop = $li.eq(0).css('height'); //获取菜单的高度
	var wid = 1; //计算整个ul的宽度
	var i = 0;
	$a.each(function() { //遍历每一个a标签
		$(this).css('float', 'left');
		wid += parseInt($(this).css('width'), 10); //将所有菜单子项相加，计算宽度
	});
	$ul.css('width', wid);
	$li.each(function() { //遍历每一个li元素
		var $newSpan = $('<span>'); //新增span元素
		var $newDiv = $('<div>'); //新增div元素
		$newDiv.appendTo($(this).parent('a')); //将div添加到a标签内部
		$newSpan.appendTo($newDiv);
		//将span添加到div内部
		$(this).appendTo($newDiv);
		//将li添加到div内部
		$newSpan.css({ //给span设置样式
			'display': 'block',
			'width': $(this).css('width'),
			'height': $(this).css('height'),
			'padding-left': $(this).css('padding-left'),
			'padding-right': $(this).css('padding-right'),
			'line-height': $(this).css('height'),
			'text-align': $(this).css('text-align'),
			'color': wordColor,
			'background-color': bgColor
		});
		if (titleArray[i]) {
			$newSpan.html(titleArray[i]);
		} else {
			$newSpan.html($(this).html()); //将遮罩层标题的值传入
		}
		$newDiv.css({ //设置div样式
			'position': 'relative',
			'top': '-' + $divTop,
			'float': 'left'
		});
		$newDiv.hover(function() { //鼠标移入移除事件
			startMove(this, {
				top: 0
			}, 15);
		}, function() {
			startMove(this, {
				top: '-60'
			}, 15);
		});
		i++;
	});
};




/*
 * 从运动框架选取了部分功能作为导航栏框架的子框架
 */
function startMove(obj, json, interval, fn) {
	//将需要运动的多个属性保存成JSON格式，方便在startMove中调用，key-Value键值对，不同的key，不用数组
	clearInterval(obj.iTimer); //使用obj.iTimer，用来控制N个不同元素的运动互不影响，否则会将前一个元素的定时器清空Bug
	var iCur = 0;
	var iSpeed = 0; //速度变量
	obj.iTimer = setInterval(function() {
		var iBtn = true; //定义变量用来判断是否所有元素都已经到达指定位置了，若为true，则表示所有元素到了指定位置，false则为有元素未到达
		//定时器每运行一次，就要把运动的属性都推进一步
		for (var attr in json) {
			//停止计时器时间：所有属性都运动到了目标的时候。
			iTarget = json[attr];
			if (attr == 'opacity') {
				iCur = Math.round(css(obj, 'opacity') * 100); //四舍五入，在某些浏览器中（目前实测Opera）中，Opacity得到的值是一个很长的数，例如：0.29999999998,0.3000000001
			} else {
				iCur = parseInt(css(obj, attr));
			}
			//速度 = (目标点值-当前值)*摩擦系数：BUG：JS计算CSS样式小数时会四舍五入导致运动差几PX，解决方法：若速度为正数，则向上取整，否则向下取整。
			iSpeed = (iTarget - iCur) / 8;
			iSpeed = iSpeed > 0 ? Math.ceil(iSpeed) : Math.floor(iSpeed); //速度取整
			if (iCur != iTarget) { //如果元素未达到指定位置
				iBtn = false; //将标识设置为false
				if (attr == 'opacity') {
					//非IE浏览器
					obj.style.opacity = (iCur + iSpeed) / 100;
					obj.style.filter = 'alpha(opacity=' + (iCur + iSpeesd) + ')' //IE浏览器兼容
				} else {
					obj.style[attr] = iCur + iSpeed + 'px';
				}
			}
		}
		//在这里来判断是否所有属性都已经运行完毕，iBtn为false则表示有元素未达到，true表示都到达了。
		//true的条件：当定时器运行了一次，并扫描了所有attr，发现没有需要移动的属性。
		if (iBtn) {
			clearInterval(obj.iTimer); //关闭定时器
			fn && fn.call(obj); //若此处未使用call，则this会指向window，call的作用是让this指针指向obj
		}
	}, interval);
}

function css(obj, attr) { //获取元素CSS样式
	if (obj.currentStyle) {
		return obj.currentStyle[attr]; //若浏览器支持CurrentStyle，则使用它获取，最精确，IE
	} else {
		return getComputedStyle(obj, false)[attr]; //若不支持，则使用getComputedStyle获取，FF,Chrome等
	}
}