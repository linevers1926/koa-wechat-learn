/**
 * Created by Administrator on 2016/12/17.
 */
'use strict'
var fs = require('fs')
var Promise = require('bluebird')

exports.readFileAsync = function(fpath, encoding) {
    return new Promise(function(resolve, reject){
        fs.readFile(fpath, encoding, function(err, content) {
            if (err) {
                reject(err);
            } else {
                resolve(content);
            }
        })
    })
}

exports.writeFileAsync = function (fpath, content) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(fpath, content, function(err){
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        })
    })
}

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

exports.sign = function(ticket, url) {
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