/**
 * Created by Administrator on 2016/12/22.
 */
'use strict'
var path = require('path')
var wechat_file = path.join(__dirname, './config/wechat.txt');
var wechat_ticket_file = path.join(__dirname, './config/wechat_ticket.txt');
var util = require('./libs/util');

var config = {
    wechat: {
        //测试
        /*token: 'linevers1',
        APPID: 'wxb3080423ca727a96',  //wxb3080423ca727a96
        appSecret: "d4624c36b6795d1d99dcf0547af5443d",
        encodingAESKey: 'lineversloveyinglineversloveyinglineverslov',*/
        //个人
        token: 'linevers',
        APPID: 'wx2bb849b868e53e9e',  //wxb3080423ca727a96
        appSecret: "747f3850f2d2bbbe3c2b828f0f7c339d",
        encodingAESKey: 'lineversloveyinglineversloveyinglineverslov',
        //企业
        /*token: 'linevers',
        APPID: 'wx4918ec79d40bd117',  //wxb3080423ca727a96
        appSecret: "747f3850f2d2bbbe3c2b828f0f7c339d",
        encodingAESKey: 'ElOm1paGHVrPPZMAqEAlf6HMJ1v9bFtiavLx2nsWgjR',*/
        getAccessToken: function(){
            return util.readFileAsync(wechat_file);
        },
        saveAccessToken: function(data) {
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_file, data);
        },
        getTicket: function() {
            return util.readFileAsync(wechat_ticket_file)
        },
        saveTicket: function(data) {
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_ticket_file, data);
        }
    }
}

module.exports = config;