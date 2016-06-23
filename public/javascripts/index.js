function $(s){
	return document.querySelectorAll(s)
}

var lis = $('#list li')
var size = 64				// 数据的长度
var box = $('#box')[0]		// 获得box
var height,width     		// box 宽度和高度
var canvas = document.createElement('canvas') 		// 添加 canvas
var ctx = canvas.getContext('2d') 					// 获得画笔
box.appendChild(canvas)
var Dots = [] 				// 点状数组
var types = $('#type li')	// 设置 #type样式 及操作

var mv = new MusicVisualizer({
	size: size,
	visualizer: draw
})

// 设置选中状态
for (var i = 0;i < lis.length;i++){
	lis[i].onclick = function(){
		// 取消其他的选中状态
		for (var j = 0;j < lis.length;j++){
			lis[j].className = ''
		}
		this.className = 'selected'
		mv.play('/media/' + this.title)
	}
}

// 随机函数
function random(m, n){
	return Math.round(Math.random() * (n - m) + m)
}
function getDots(){
	// 每一次调用时将数组清空
	Dots = []
	for (var i = 0;i < size;i++){
		var x = random(0, width)
		var y = random(0, height)
		var color = 'rgba('+random(0,255)+','+random(0,255)+','+random(0,255)+ ',0)'
		Dots.push({
			x: x,
			y: y,
			dx: random(1, 4),
			color: color,
			cap: 0	// 小帽距离最低端距离
		})
	}
}
// 
function resize(){
	// 取得宽度、高度
	height = box.clientHeight
	width = box.clientWidth
	// 宽度、高度 赋值给 canvas
	canvas.height = height
	canvas.width = width
	// 每次改变调用getDots
	getDots()
}
// 先调用一次
resize()
// 窗口改变时，重新计算
window.onresize = resize
// 绘制渐变的矩形
function draw(arr){
	// 绘制每一次，先清除上一次
	ctx.clearRect(0,0,width,height)
	// 矩形宽度
	var w = width / size
	// 计算小帽的高度
	var cw = w * 0.6
	var capH = cw > 10 ? 10 : cw

	for (var i = 0; i < size; i++) {
		// 取出Dots里对应的对象
		var o = Dots[i]
		if (draw.type == 'column') {
			// 柱状图
			var h = arr[i] / 256 * height	// 矩形高度
			
			// 线性的渐变
			var line = ctx.createLinearGradient(0,0,0,height)
			// 添加渐变色
			line.addColorStop(0,'red')
			line.addColorStop(0.5,'yellow')
			line.addColorStop(1,'green')
			ctx.fillStyle = line
			ctx.fillRect(w * i,height - h,cw,h)	
			ctx.fillRect(w * i,height - (o.cap + capH),cw,capH)	// 画小帽
			// 小帽下滑
			o.cap--
			if (o.cap < 0) {
				o.cap = 0
			}
			if (h > 0 && o.cap < h + 40) {
				o.cap = h + 40 > height - capH ? height - capH : h + 40
			}
			
		} else if (draw.type == 'dot') {
			// 圆的半径
			var r = 8 + arr[i] / 256 * (height > width ? width : height) / 10
			ctx.beginPath()
			ctx.arc(o.x, o.y, r, 0, Math.PI * 2, true)
			// 创建渐变色
			var g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r)
			g.addColorStop(0, '#fff')
			g.addColorStop(1, o.color)
			ctx.fillStyle = g
			ctx.fill()
			o.x += o.dx
			o.x = o.x > width ? 0 : o.x
		}
		
	}
}
// 给draw方法设置默认属性，默认画柱状图
draw.type = 'column'
for (var i = 0;i < types.length;i++){
	types[i].onclick = function(){
		// 点击时清除样式
		for (var j = 0; j < types.length;j++){
			types[j].className = ''
		}
		this.className = 'selected'
		draw.type = this.getAttribute('data-type')
	}
}
// 绑定changeVolume事件
$('#volume')[0].onchange =function(){
	mv.changeVolume(this.value/this.max)
}
// 调用方法让初始设置的value值生效
$('#volume')[0].onchange()

