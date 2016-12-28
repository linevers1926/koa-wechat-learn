/**
 * Created by Administrator on 2016/12/17.'*/
'use strict';

var Koa = require('koa');
var wechat = require('./wechat/g');
var path = require('path');
var wechat_file = path.join(__dirname, './config/wechat.txt');
var util = require('./libs/util');
var config = {
    wechat: {
        token: 'linevers',
        APPID: 'wxb3080423ca727a96', //wxb3080423ca727a96
        appSecret: "d4624c36b6795d1d99dcf0547af5443d",
        getAccessToken: function () {
            return util.readFileAsync(wechat_file);
        },
        saveAccessToken: function (data) {
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_file, data);
        },
        encodingAESKey: 'lineversloveyinglineversloveyinglineverslov'
    }
};

//ʵ����koa
var app = new Koa();
app.use(wechat(config.wechat));

app.listen(3000);
console.log("Listening: 3000");

//# sourceMappingURL=app-compiled.js.map