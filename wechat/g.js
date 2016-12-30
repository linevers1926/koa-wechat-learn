/**
 * Created by Administrator on 2016/12/17.
 */
//实例化koa
'use strict'
var sha1 = require('sha1');
var getRawBody = require('raw-body');
var Wechat = require('./wechat');
var util = require('./util')

module.exports = function(ops, hander) {
    var wechat = new Wechat(ops);
    return function *(next) {
        var that = this;

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
                this.body =  echostr + '';
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
            })
            var content = yield util.parseXMLAsync(data);
            var message = util.formatMessage(content.xml);

            this.weixin = message;
            //@description:控制权转移
            yield hander.call(this, next)
            //处理完毕解析和回复，真正的回复
            wechat.reply.call(this)
        }
    }
}