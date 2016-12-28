/**
 * Created by Administrator on 2016/12/17.'*/
 'use strict'
var Koa = require('koa');
var wechat = require('./wechat/g')
var path = require('path')
var wechat_file = path.join(__dirname, './config/wechat.txt');
var config = require('./config')
var weixin = require('./weixin')
//ÊµÀý»¯koa
var app = new Koa()
app.use(wechat(config.wechat, weixin.reply));

app.listen(3000);
console.log("Listening: 3000")