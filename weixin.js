/**
 * Created by Administrator on 2016/12/22.
 */
'use strict'
var config = require('./config')
var Wechat = require('./wechat/wechat')

//初始化Wechat
var wechatApi = new Wechat(config.wechat)

exports.reply = function *(next) {
    var message = this.weixin;
    //事件推送
    if (message.MsgType === 'event') {
        //订阅事件
        if (message.Event === 'subscribe') {
            if (message.EventKey) {
                console.log("扫二维码进来:" + message.EventKey +' '+ message.ticket);
            }
            this.body = '哈哈，你订阅了这个号\r\n';
        }
        //取消订阅
        else if (message.Event === 'unsubscribe') {
            console.log('无情取关');
            this.body = "取消关注"
        }
        //地理位置
        /*else if (message.Event === 'LOCATION'){
            this.body = "您上报的位置是"+message.Latitude+'/' + message.Longitude + '-' + message.Precision;
        }*/
        //click事件
        else if(message.Event === 'CLICK') {
            this.body = "您点击了菜单:"+message.EventKey;
        }
        //扫描
        else if(message.Event === 'SCAN') {
            console.log("关注后扫二维码:"+message.EventKey+','+message.Ticket);
            this.body = "看到你扫一下哦";
        }
        //链接
        else if(message.Event === 'VIEW') {
            this.body = '您点击了菜单中的链接:'+message.EventKey;
        }
    }
    else if(message.MsgType === 'text'){
        var content = message.Content;
        var reply = "额，你说的 " + message.content + ' 太复杂了';

        if (content === '1') {
            reply = '天下第一吃大米';
        } else if(content === '2') {
            reply = "天下第二吃豆腐"
        } else if(content === '3') {
            reply = "天下第三吃咸蛋"
        } else if(content === '4'){
            reply = [{
                title: "技术改变世界",
                description: "只是个描述而已",
                picUrl: "https://img6.bdstatic.com/img/image/smallpic/weiju1222.jpg",
                url: 'http://linevers.com'
            },{
                title: "Node js开发微信",
                description: "爽到爆",
                picUrl: "https://img6.bdstatic.com/img/image/smallpic/chongwu1222.jpg",
                url: 'http://linevers.com'
            }]
        } else if(content === '5') {
            var data = yield wechatApi.uploadMaterial('image', __dirname + '/assets/2.jpg')
            //回复音乐消息
            reply = {
                type: 'image',
                media_id: data.media_id
            }
        } else if(content === '6') {
            //var data = yield wechatApi.uploadMaterial('video', __dirname+'/assets/2.mp4');
            reply = {
                type: 'video',
                title: '回复视频内容',
                description: '打个篮球玩玩',
                media_id: 'lTnx2yHeV7pEiM_F6QvSpw6-I8yfi0aAaYVAaOKs20z7NF0tVr8IEsT7fUr9_Ue7'//data.media_id'//'oaADhAar10tyW04KqYiyQNG0rGwr9lAnfLCYiDhTI9LKcHwg5SzBc8hCih8oeWFk'//
            }
        } else if(content === '7'){
            var data = yield wechatApi.uploadMaterial('image', __dirname + '/assets/2.jpg')
            console.log(data)
            reply = {
                type: 'music',
                title: '回复音乐内容',
                description: '放松一下',
                MUSIC_Url: 'http://mpge.5nd.com/205/2015-9-12/66325/1.mp3',
                HQ_MUSIC_Url: 'http://mpge.5nd.com/205/2015-9-12/66325/1.mp3',
                media_id: data.media_id
            }
        } else if(content === '8'){
            var data = yield wechatApi.uploadMaterial('image', __dirname + '/assets/2.jpg', {type: 'image'})
            console.log(data)
            reply = {
                type: 'image',
                media_id: data.media_id
            }
        } else if(content === '9') {
            var data = yield wechatApi.uploadMaterial('video', __dirname+'/assets/2.mp4',
                {type: 'video', description:'{"title": "really a nice place", "introduction":"Nevver think it so easy"}'});
            console.log(data);
            reply = {
                type: "video",
                title: "回复视频内容",
                description: "打个篮球玩玩",
                media_id: data.media_id
            }
        }
        //获取素材总数
        else if(content === '10') {
            var data = yield wechatApi.count();
            console.log(data);
            reply = "voice_count:" + data.voice_count + '\n,video_count:'+data.video_count
                    +'\nimage_count:'+data.image_count + 'news_count:' + data.news_count;
        }
        this.body = reply;
    }
}