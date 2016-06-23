function MusicVisualizer(obj) {
	this.source = null	// 资源
	this.count = 0		// 控制播放(相当于单例)
	// 分析音频
	this.analyser = MusicVisualizer.ac.createAnalyser()		// 分析节点
	this.size = obj.size  		// 数据的大小
	this.analyser.fftSize = this.size * 2	// 设置音频大小
	// 音量
	this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain?
					'createGain':'createGainNode']() 	// 获得音量控制对象
	this.gainNode.connect(MusicVisualizer.ac.destination) 	// 连接到destination上 
	// analyser => gainNode
	this.analyser.connect(this.gainNode)
	this.xhr = new XMLHttpRequest()		// ajax请求
	this.visualizer = obj.visualizer 	// 可视化
	// 开始就执行可视化函数
	this.visualize()
}
// 创建audioContext对象，并兼容较老的浏览器
MusicVisualizer.ac =  new (window.AudioContext||window.webkitAudioContext)()
// 1.通过Ajax请求获取音频Data
MusicVisualizer.prototype.load = function(url, fun){
	// 之前若有请求先终止掉
	this.xhr.abort()	
	// 设置请求方式
	this.xhr.open('GET', url)
	// 设置请求类型
	this.xhr.responseType = 'arraybuffer'
	// self 保存
	var self = this
	// 绑定onload事件
	this.xhr.onload = function(){
		fun(self.xhr.response)
	}
	// 请求开始
	this.xhr.send()
}
// 2.解码音频资源
MusicVisualizer.prototype.decode = function(arraybuffer, fun){
	MusicVisualizer.ac.decodeAudioData(arraybuffer, function(buffer){
		// 解码成功
		fun(buffer)
	},function(err){
		// 解码错误
		console.log(err)
	})
}
// play function
MusicVisualizer.prototype.play = function(url){
	// 0.
	// 控制只有一首歌在播放
	var n = ++this.count
	// console.log('n: ' + n + 'this.count = ' + this.count)
	// 1.
	var self = this
	// 之前若有请求先终止掉
	this.source && this.stop()
	this.load(url, function(arraybuffer){
		// 控制只有一首歌在播放
		// console.log('one')
		if(n != self.count)return
		self.decode(arraybuffer, function(buffer){
			// console.log('two')
			// 控制只有一首歌在播放
			if(n != self.count)return
			// console.log('three')
			// 创建bufferSource对象
			var bs = MusicVisualizer.ac.createBufferSource()
			bs.buffer = buffer
			// bufferSource => analyser => gainNode => destination
			bs.connect(self.analyser)

			// 连接上开始播放,并兼容老版本
			bs[bs.start?'start':'noteOn'](0)
			// 将bufferSource保存到对象的source属性上
			self.source = bs
		})
	})
	// 2.

}
// stop function
MusicVisualizer.prototype.stop = function(){
	this.source[this.source.stop ? 'stop' : 'noteOff'](0)
}
// 直接播放当前的 bufferSource ,在苹果设备用户触发时调用
// MusicVisualizer.prototype.start = function(){
// 	this.source && this.source[this.source.start ? 'start' : 'noteOn']
// }
// 应用加载完毕，为苹果设备添加用户触发事件
// MusicVisualizer.prototype.addinit = function(fun){
// 	this.initCallback = fun
// }
// 控制音量函数
MusicVisualizer.prototype.changeVolume = function(percent){
	this.gainNode.gain.value = percent * percent
}
// 音频分析函数
MusicVisualizer.prototype.visualize = function(){
	// 音频长度的一半
	var arr = new Uint8Array(this.analyser.frequencyBinCount)	
	// 动画函数
	requestAnimationFrame = window.requestAnimationFrame || 
							window.webkitRequestAnimationFrame || 
							window.mozRequestAnimationFrame
	var self = this
	function v(){
		// 分析数据赋值到数组
		self.analyser.getByteFrequencyData(arr)
		// 绘制
		self.visualizer(arr)
		requestAnimationFrame(v)
	}
	requestAnimationFrame(v)
}
