/**
 * Created by Administrator on 2016/12/17.'*/
 'use strict'
var Koa = require('koa');
var g = require('./wechat/g')
var path = require('path')
var config = require('./config')
var reply = require('./wx/reply')
var Wechat = require('./wechat/wechat')
var app = new Koa()


var ejs = require('ejs')
var heredoc = require('heredoc')
var tpl = heredoc(function(){/*
<!doctype html>
<html>
  <head>
    <title>搜电影</title>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1">
  </head>
  <body>
    <h1>点击标题开始录音</h1>
    <p id="title"></p>
    <div id="director"></div>
    <div id="year"></div>
    <div id="poster"></div>
    <script src="//cdn.bootcss.com/zepto/1.2.0/zepto.js"></script>
    <script src="//res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
    <script>
         wx.config({
            debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: '<%= appId %>', // 必填，公众号的唯一标识
            timestamp: <%= timestamp %>, // 必填，生成签名的时间戳
            nonceStr: "<%= noncestr %>", // 必填，生成签名的随机串
            signature: "<%= signature %>",// 必填，签名，见附录1
            jsApiList: ['startRecord',
            'stopRecord',
            'onVoiceRecordEnd',
            'translateVoice',
            'onMenuShareTimeline',
            'onMenuShareAppMessage',
            'onMenuShareQQ',
            'onMenuShareWeibo',
            'previewImage'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2',
         });
         //分享给朋友
         function shareToFriend(shareContent) {
            wx.onMenuShareAppMessage(shareContent);
         }
         var slides = null;

         wx.ready(function(){
             var isRecording = false
             $('#poster').on('click', function(){
                 wx.previewImage(slides);
             });

             $('h1').on('click', function(){
                if (!isRecording){
                    isRecording = true;
                    wx.startRecord({
                        cancel: function(){alert("那就不能搜了")}
                    })
                    return
                }
                isRecording = false;
                wx.stopRecord({
                    success: function (res) {
                       var localId = res.localId;
                       wx.translateVoice({
                           localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
                           isShowProgressTips: 1, // 默认为1，显示进度提示
                           success: function (res) {
                               var translateResult = res.translateResult; // 语音识别的结果
                               $.ajax({
                                    url: "https://api.douban.com/v2/movie/search?q=黑客帝国",//+translateResult,
                                    dataType: "jsonp",
                                    type: "GET",
                                    jsonpCallback: "callback",
                                    success: function(data) {
                                        var subject = data.subjects[0];
                                        $('#director').html(subject.directors[0].name)
                                        $('#poster').html("<img src='" + subject.images.large + "'/>")
                                        $('#year').html(subject.year)
                                        $('#title').html(subject.title)
                                        shareContent = {
                                             title: subject.title, // 分享标题
                                             desc: "我搜出来了"+subject.title, // 分享描述
                                             link: 'http://liuyiqing.iok.la/movie', // 分享链接
                                             imgUrl: subject.images.small, // 分享图标
                                             success: function () {
                                                alert("分享成功")
                                             },
                                             cancel: function () {
                                                alert("分享失败")
                                             }
                                        };
                                        shareToFriend(shareContent)
                                        slides = {
                                            current: subject.images.large,
                                            urls: []
                                        }

                                        data.subjects.forEach(function(item) {
                                            slides.urls.push(item.images.large)
                                        })
                                    }
                               })
                           }
                       });
                    }
                });
             })
         });

    </script>
  </body>
</html>
*/
})


var createNonce = function() {
  return Math.random().toString(36).substr(2);
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
    var sha1 = require('sha1')
    return sha1(str);
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

/*app.use(function *next(){
  if (this.url.indexOf('/movie') > -1) {
      var wechatApi = new Wechat(config.wechat)
      var data = yield wechatApi.fetchAccessToken();
      var ticketData = yield wechatApi.fetchTicket(data.access_token);
      var ticket = ticketData.ticket;
      var url = this.href;
      var params = sign(ticket, url);
      params.appId = wechatApi.appID;
      this.body = ejs.render(tpl, params)
      return next;
  }
  yield next;
})*/

app.use(g(config.wechat, reply.reply));

app.listen(3000);
console.log("Listening: 3000")