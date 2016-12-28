/**
 * Created by Administrator on 2016/12/18.
 */
'use strict';

var sha1 = require('sha1');
var Promise = require('bluebird');
var request = Promise.promisify(require('request')); //request promise��
var prefix = "https://api.weixin.qq.com/cgi-bin/";
var api = {
    accessToken: prefix + 'token?grant_type=client_credential&appid=APPID&secret=APPSECRET'
};
function Wechat(ops) {
    var that = this;
    this.appID = ops.APPID;
    this.appSecret = ops.appSecret;
    this.getAccessToken = ops.getAccessToken;
    this.saveAccessToken = ops.saveAccessToken;

    this.getAccessToken().then(function (data) {
        try {
            data = JSON.parse(data);
        } catch (e) {
            return that.updateAccessToken();
        }

        if (that.isValidAccessToken(data)) {
            Promise.resolve(data);
        } else {
            return that.updateAccessToken();
        }
    }).then(function (data) {
        that.access_token = data.access_token;
        that.expires_in = data.expires_in;
        that.saveAccessToken(data);
    });
}
Wechat.prototype.isValidAccessToken = function (data) {
    if (!data || !data.expires_in || !data.access_token) {
        return false;
    }
    var access_token = data.access_token;
    var expires_in = data.expires_in;
    var now = new Date().getTime();
    if (now < expires_in) {
        return true;
    } else {
        return false;
    }
};
Wechat.prototype.updateAccessToken = function () {
    var url = api.accessToken.replace('APPID', this.appID).replace('APPSECRET', this.appSecret);
    return new Promise(function (resolve, reject) {
        request({ url: url, json: true }).then(function (response) {
            console.log(response.body);
            var data = response.body;
            var now = new Date().getTime();
            var expires_in = now + data.expires_in - 20 * 1000;
            data.expires_in = expires_in;
            resolve(data);
        });
    });
};

module.exports = Wechat;

//# sourceMappingURL=wechat-compiled.js.map