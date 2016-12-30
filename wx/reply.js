/**
 * Created by Administrator on 2016/12/22.
 */
'use strict'
var config = require('./../config')
var Wechat = require('./../wechat/wechat')
var path = require('path')
var menu = require('./menu')

//初始化Wechat
var wechatApi = new Wechat(config.wechat)

wechatApi.deleteMenu()
.then(function(data){
    return wechatApi.createMenu(menu);
}).then(function(msg){
    console.log(msg);
})

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
        else if (message.Event === 'LOCATION'){
            this.body = "您上报的位置是"+message.Latitude+'/' + message.Longitude + '-' + message.Label;
        }
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
        //扫码事件
        else if(message.Event === 'scancode_push' || message.Event === 'scancode_waitmsg') {
            console.log(message.ScanCodeInfo);
            this.body = "扫码结果:"+ message.ScanCodeInfo.ScanResult || "";
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
            }*/
            var message = {
                media_id: 'Q-1eme9exgvPKzpFiM05TuPSp9ZDgK3aT5RI53z_Gt8'
            }
            var data = yield wechatApi.sendByGroup('image', message, 'oJZSCw8fF51SOCTi_3TDdzXbL1uo');
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
        this.body = reply;
    }
}