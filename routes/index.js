var express = require('express');
var router = express.Router();
// path 处理路径的模块
var path = require('path');
// 链接目录生成目录路径
var media = path.join(__dirname, '../public/media');

/* GET home page. */
router.get('/', function(req, res, next) {
	// fs 文件系统
	var fs = require('fs');
	// 异步读取 names数组列表
	fs.readdir(media, function(err, names){
		if (err) {
			console.log(err)
		} else {
			res.render('index', { title: 'Visuality Music', music: names });
		}
	})
});

module.exports = router;
