/**
 * Created by Administrator on 2016/12/17.
 */
//ʵ����koa
'use strict';

var sha1 = require('sha1');
var getRawBody = require('raw-body');
var Wechat = require('./wechat');
var util = require('./util');

module.exports = function (ops) {
    //var wechat = new Wechat(ops);
    return function* (next) {
        console.log(this.method);

        var token = ops.token;
        var signature = this.query.signature;
        var nonce = this.query.nonce;
        var timestamp = this.query.timestamp;
        var echostr = this.query.echostr;
        var str = [token, timestamp, nonce].sort().join('');
        var sha = sha1(str);

        if (this.method === 'GET') {
            if (sha != signature) {
                this.body = "wrong";
            } else {
                this.body = echostr + '';
            }
        } else if (this.method === 'POST') {
            if (sha != signature) {
                this.body = "wrong";
                return false;
            }
            var data = yield getRawBody(this.req, {
                length: this.length,
                limit: '1mb',
                encoding: this.charset
            });
            var content = yield util.parseXMLAsync(data);
            console.log(content);
        }
    };
};

//# sourceMappingURL=g-compiled.js.map