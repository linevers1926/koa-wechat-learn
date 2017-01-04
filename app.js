/**
 * Created by Administrator on 2016/12/17.'*/
 'use strict'
var Koa = require('koa');
var g = require('./wechat/g')
var path = require('path')
var config = require('./config')
var reply = require('./wx/reply')
var crypto = require('crypto')
var Wechat = require('./wechat/wechat')
var app = new Koa()


var ejs = require('ejs')
var heredoc = require('heredoc')
var tpl = heredoc(function(){/*
<!doctype html>
<html>
  <head>
    <title>电影</title>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1">
  </head>
  <body>
    <h1>点击标题开始录音</h1>
    <p id="title"></p>
    <div id="poster"></div>
    <script src="//cdn.bootcss.com/zepto/1.2.0/zepto.js"></script>
    <script src="//res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
    <script>
       wx.config({
          debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: 'wxb3080423ca727a96', // 必填，公众号的唯一标识
          timestamp: <%= timestamp %>, // 必填，生成签名的时间戳
          nonceStr: "<%= noncestr %>", // 必填，生成签名的随机串
          signature: "<%= signature %>",// 必填，签名，见附录1
          jsApiList: ['startRecord',
          'stopRecord',
          'onVoiceRecordEnd',
          'translateVoice'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
       });
    </script>
  </body>
</html>
*/
})


var createNonce = function() {
  return Math.random().toString(36);
}

var createTimeStamp = function() {
  return parseInt(new Date().getTime()/1000, 10);
}

var _sign = function(nonceStr, ticket, timeStamp, url) {
  var params = ["noncestr="+nonceStr,
   "jsapi_ticket="+ticket,
   "timestamp="+timeStamp,
   "url="+url];
  var str = params.sort().join('&');
  var shasum = crypto.createHash('sha1');
  shasum.update(str);
  return shasum.digest('hex');
    /*var sha1 = require('sha1')
    return sha1(str);*/
}

function sign(ticket, url) {
  var nonceStr = createNonce();
  var timeStamp = createTimeStamp();
  var signature = _sign(nonceStr, ticket, timeStamp, url);
  return {
      noncestr: nonceStr,
      jsapi_ticket: ticket,
      timestamp: timeStamp,
      signature : signature
  }
}

app.use(function *next(){
  if (this.url.indexOf('/movie') > -1) {
      var wechatApi = new Wechat(config.wechat)
      var data = yield wechatApi.fetchAccessToken();
      var ticketData = yield wechatApi.fetchTicket(data.access_token);
      var ticket = ticketData.ticket;
      var url = this.href;
      var params = sign(ticket, url);
      console.log(params)
      this.body = ejs.render(tpl, params)
      return next;
  } else {
      yield next;
  }
})

//app.use(g(config.wechat, reply.reply));

app.listen(3000);
console.log("Listening: 3000")