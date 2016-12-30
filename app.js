/**
 * Created by Administrator on 2016/12/17.'*/
 'use strict'
var Koa = require('koa');
var g = require('./wechat/g')
var path = require('path')
var config = require('./config')
var reply = require('./wx/reply')
//ʵ����koa
var app = new Koa()
//app.use(g(config.wechat, reply.reply));

app.listen(3000);
console.log("Listening: 3000")