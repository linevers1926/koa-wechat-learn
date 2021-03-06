/**
 * Created by Administrator on 2016/12/22.
 */
'use strict'
var Wechat = require('./../wechat/wechat')
var path = require('path')
var menu = require('./menu')
var Movie = require('../app/api/movie')

//初始化Wechat
var wx = require('../wx/index')
var wechatApi = wx.getWechat();

exports.reply = function *(next) {
    var message = this.weixin;
    //事件推送
    if (message.MsgType === 'event') {
        //订阅事件
        if (message.Event === 'subscribe') {
            if (message.EventKey) {
                console.log("扫二维码进来:" + message.EventKey +' '+ message.ticket);
            }
            this.body = '亲，欢迎关注linevers电影世界\n'
                        + '回复1~3，测试文字回复\n'
                        + '回复4，测试图文回复\n'
                        + '回复 首页，进入电影首页\n'
                        + '回复 登录，进入微信登录绑定\n'
                        + '回复 游戏，进入游戏页面\n'
                        + '回复 电影名称，查询电影信息\n'
                        + '也可以点击 <a href="http://liuyiqing.iok.la/movie">语音查电影</a> ';
        }
        //取消订阅
        else if (message.Event === 'unsubscribe') {
            console.log('无情取关');
            this.body = "取消关注"
        }
        //地理位置
        else if (message.Event === 'LOCATION'){
            this.body = "您上报的位置是"+message.Latitude+'/' + message.Longitude + (message.Label?('-'+message.Label):"");
        }
        //click事件
        else if(message.Event === 'CLICK') {
            this.body = "您点击了菜单:"+message.EventKey;
        }
        //扫描
        else if(message.Event === 'SCAN') {
            console.log("关注后扫二维码:"+message.EventKey+','+message.Ticket);
            if (message.EventKey === '124') {
                this.body = "欢迎关注linevers测试公众号~~~";
            } else {
                this.body = "看到你扫一下哦";
            }
        }
        //链接
        else if(message.Event === 'VIEW') {
            this.body = '您点击了菜单中的链接:'+message.EventKey;
        }
        //扫码事件
        else if(message.Event === 'scancode_push' || message.Event === 'scancode_waitmsg') {
            console.log(message.ScanCodeInfo);
            this.body = "扫码结果:"+ message.ScanCodeInfo.ScanResult || "";
        }
    }
    //语音
    else if (message.MsgType === 'voice') {
        var voiceText = message.Recognition;
        var movies = yield Movie.searchByName(voiceText)
        if (!movies || movies.length === 0) {
            movies = yield Movie.searchByDouban(voiceText);
        }

        if (movies && movies.length > 0) {
            reply = [];
            movies = movies.slice(0, 10);
            movies.forEach(function(movie){
                reply.push({
                    title: movie.title,
                    description: movie.title,
                    picUrl: movie.images.large,
                    url: movie.alt
                })
            })
        }
        else {
            reply = '没有查询到与'+content + ' 匹配的电影，要不要换一个名字试试'
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
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../assets/2.jpg'))
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
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../assets/2.jpg'))
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
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../assets/2.jpg'), {type: 'image'})
            console.log(data)
            /*
             { media_id: 'Q-1eme9exgvPKzpFiM05TuPSp9ZDgK3aT5RI53z_Gt8',
             url: 'http://mmbiz.qpic.cn/mmbiz_jpg/iaC9H4ic7VeuYsUb0EHhPfErJDsicDu4mqklwTs6fOSJCaOyBsQzSbGKQpZZoHFTKFd1tHOvYbQGOLJ7encZhBICA/0?wx_fmt=jpeg' }
             */
            reply = {
                type: 'image',
                media_id: data.media_id
            }
        } else if(content === '9') {
            var data = yield wechatApi.uploadMaterial('video', path.join(__dirname, '../assets/2.mp4'),
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
            reply = data.replace(/\"/g, '');
        }
        //创建标签
        else if(content === '11') {
            var data = yield wechatApi.createGroup('广东');
            reply = data.replace(/\"/g, '');
        }
        //获取所有的用户分组
        else if(content === '12') {
            var data = yield wechatApi.getGroups();
            reply = data.replace(/\"/g, '');
        }
        //获取所有所在的分组
        else if(content === '13') {
            var data = yield wechatApi.checkGroup(this.weixin.FromUserName);
            reply = data.groupid;
        }
        //修改分组名称
        else if(content === '14') {
            var data = yield wechatApi.checkGroup(100, 'test_modify');
            reply = data.replace(/\"/g, '');;
        }
        //移动用户分组
        else if(content === '15') {
            var data = yield wechatApi.moveUserGroup(this.weixin.FromUserName, 'test_modify');
            reply = data.replace(/\"/g, '');
        }
        //移动用户分组
        else if(content === '16') {
            var data = yield wechatApi.fetchUserInfo(message.FromUserName, 'test_modify');
            console.log(data);
            reply = "Hi "+data.nickname;
        }
        //分组转发消息
        else if (content === '17') {
            var message = {
                content: 'hello from boxer'
            }
            var data = yield wechatApi.sendByGroup('text', message);
            console.log(data);
            reply = data.errmsg;
        }
        //分组转发消息
        else if (content === '18') {
            /*var message = {
                content: 'okokoko'
                oJZSCw1RavftrBwkXZ9arAURTuys
            }*/
            var message = {
                media_id: 'Q-1eme9exgvPKzpFiM05TuPSp9ZDgK3aT5RI53z_Gt8'
            }
            var data = yield wechatApi.sendByGroup('image', message, 'oJZSCw1RavftrBwkXZ9arAURTuys');
            console.log(data);
            reply = data.errmsg;
        }
        //创建自定义菜单
        else if(content === '19') {
            var menu = [
                {
                    "name": "发图",
                    "sub_button": [
                        {
                            "type": "pic_sysphoto",
                            "name": "系统拍照发图",
                            "key": "rselfmenu_1_0",
                            "sub_button": [ ]
                        },
                        {
                            "type": "pic_photo_or_album",
                            "name": "拍照或者相册发图",
                            "key": "rselfmenu_1_1",
                            "sub_button": [ ]
                        },
                        {
                            "type": "pic_weixin",
                            "name": "微信相册发图",
                            "key": "rselfmenu_1_2",
                            "sub_button": [ ]
                        }
                    ]
                },
                {
                    "name":"菜单",
                    "sub_button":[
                        {
                            "type":"view",
                            "name":"搜索",
                            "url":"http://www.soso.com/"
                        },
                        {
                            "type":"view",
                            "name":"视频",
                            "url":"http://v.qq.com/"
                        },
                        {
                            "type":"click",
                            "name":"赞一下我们",
                            "key":"V1001_GOOD"
                        }]
                },
                {
                    "name":"扫码",
                    "sub_button": [
                        {
                            type: "scancode_waitmsg",
                            name: "扫码带提示",
                            key: "rselfmenu_0_0",
                            sub_button: []
                        },
                        {
                            type: "scancode_push",
                            name: "扫码推事件",
                            key: "rselfmenu_0_1",
                            sub_button: []
                        }
                    ]
                }];
            var data = wechatApi.createMenu(menu);
            console.log(data);
            reply = data.errmsg;
        }
        else if(content === '20') {
            var semanticData = {
                "query":"来点言情小说看看",
                "city":"深圳",
                "category": "novel",
                "uid":message.FromUserName
            }
            var data = yield wechatApi.semantic(semanticData)
            console.log(data);
            reply = JSON.stringify(data).replace(/\"/g, '');
        }
        else if(content === '21') {
            //创建临时二维码
            var qrcodeTempParams = {
                "expire_seconds": 604800,
                "action_name": "QR_SCENE",
                "action_info": {
                    "scene": {
                        "scene_id": 123
                    }
                }
            }
            var qrcodePermParams = {
                "action_name": "QR_LIMIT_SCENE",
                "action_info": {
                    "scene": {
                        "scene_id": 124
                    }
                }
            }
            var ticketData = yield wechatApi.createQrcode(qrcodePermParams);
            console.log(ticketData)
            var qrcodeHref= yield wechatApi.showQrcode(ticketData.ticket);
            reply = [{
                title: "二维码图片",
                description: "二维码图片地址",
                picUrl: qrcodeHref,
                url: qrcodeHref
            }]
        }
        //长链接转短链接
        else if(content.match(/(http[s]?|weixin)\:\/\//)) {
            var data = yield wechatApi.long2short(content)
            console.log(data);
            reply = data.short_url;
        }
        else {
            var movies = yield Movie.searchByName(content)
            if (!movies || movies.length === 0) {
                movies = yield Movie.searchByDouban(content);
            }

            if (movies && movies.length > 0) {
                reply = [];
                movies = movies.slice(0, 5);
                movies.forEach(function(movie){
                    reply.push({
                        title: movie.title,
                        description: movie.title,
                        picUrl: movie.poster || movie.images.large,
                        url: 'http://liuyiqing.iok.la/movie/'+movie.id
                    })
                })
            }
            else {
                reply = '没有查询到与'+content + ' 匹配的电影，要不要换一个名字试试'
            }
        }
        this.body = reply;
    }
}