/**
 * Created by Administrator on 2016/12/18.
 */
'use strict'
var sha1 = require('sha1');
var Promise = require('bluebird');
var request = Promise.promisify(require('request')); //request promise��
var util = require('./util')
var fs = require('fs')
var _  = require('lodash')

var prefix = "https://api.weixin.qq.com/cgi-bin/"
var api = {
    accessToken: prefix + 'token?grant_type=client_credential&appid=APPID&secret=APPSECRET',
    temporary: {
        upload: prefix + 'media/upload?access_token=ACCESS_TOKEN&type=TYPE',
        fetch: prefix + 'media/get?access_token=ACCESS_TOKEN&media_id=MEDIA_ID',
    },
    permanent: {
        upload: prefix + 'material/add_material?access_token=ACCESS_TOKEN&type=TYPE',
        fetch: prefix + 'material/get_material?access_token=ACCESS_TOKEN',
        uploadNews: prefix + 'material/add_news?access_token=ACCESS_TOKEN',
        uploadNewsPic: prefix + 'media/uploadimg?access_token=ACCESS_TOKEN',
        del: prefix + 'material/del_material?access_token=ACCESS_TOKEN',
        update: prefix + 'material/update_news?access_token=ACCESS_TOKEN',
        count: prefix + 'material/get_materialcount?access_token=ACCESS_TOKEN',
        batch: prefix + 'material/batchget_material?access_token=ACCESS_TOKEN'
    }
    //upload: prefix + 'media/upload?access_token=ACCESS_TOKEN&type=TYPE'
}
function Wechat(ops) {
    var that = this;
    this.appID = ops.APPID;
    this.appSecret = ops.appSecret;
    this.getAccessToken = ops.getAccessToken;
    this.saveAccessToken = ops.saveAccessToken;
    this.fetchAccessToken();
}

//��ȡ΢��Ʊ��
Wechat.prototype.fetchAccessToken = function() {
    var that = this;
    if (this.access_token && this.expires_in) {
        if (this.isValidAccessToken(this)) {
            return Promise.resolve(this);
        }
    }
    this.getAccessToken()
        .then(function(data){
            try {
                data = JSON.parse(data)
            }
            catch(e) {
                return that.updateAccessToken();
            }
            if (that.isValidAccessToken(data)){
                //return Promise.resolve(data);
                return Promise.resolve(data);
            } else {
                return that.updateAccessToken();
            }
        })
        .then(function(data){
            that.access_token = data.access_token;
            that.expires_in = data.expires_in;
            that.saveAccessToken(data);
            return Promise.resolve(data);
        })
}


Wechat.prototype.isValidAccessToken = function(data) {
    if (!data || !data.expires_in || !data.access_token) {
        return false;
    }
    var access_token = data.access_token;
    var expires_in = data.expires_in;
    var now = (new Date()).getTime();
    if (now < expires_in) {
        return true;
    } else {
        return false;
    }
}
Wechat.prototype.updateAccessToken = function() {
    var url = api.accessToken.replace('APPID', this.appID).replace('APPSECRET', this.appSecret);
    return new Promise(function(resolve, reject) {
        request({url: url, json: true}).then(function(response){
            console.log(response.body);
            var data = response.body;
            var now = new Date().getTime();
            var expires_in = now + data.expires_in*1000 - 20*1000;
            data.expires_in = expires_in;
            resolve(data);
        })
    })
}

Wechat.prototype.reply = function() {
    var content = this.body;
    var message = this.weixin;
    console.log(message);
    var xml = util.tpl(content, message);
    console.log(xml);
    this.status = 200;
    this.type = "application/xml";
    this.body = xml;
}

Wechat.prototype.fetch = function(mediaId, type, permanent) {
    var that = this;
    var form = {}
    var fetchUrl = api.temporary.fetch;
    if (permanent) {
        fetchUrl = api.permanent.fetch;
    }

    return new Promise(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = fetchUrl.replace('ACCESS_TOKEN', data.access_token).replace('MEDIA_ID', mediaId);
            if (!permanent && type === 'video') {
                url = url.replace('https', 'http');
            }
            resolve(url);
        })

    })
}

Wechat.prototype.uploadMaterial = function(type, material, permanent) {
    var that = this;
    var form = {}
    var uploadUrl = api.temporary.upload;
    if (permanent) {
        uploadUrl = api.permanent.upload;
        _.extend(form, permanent);
    }


    //type 是pic则认为是图文消息的图片
    if (type === 'pic') {
        uploadUrl = api.permanent.uploadNewsPic;
    }
    //图文 material传进来的是数组
    if (type === 'news') {
        uploadUrl = api.permanent.uploadNews;
        form = material;
    }
    else {
        form.media = fs.createReadStream(material);
    }

    return new Promise(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            form.access_token = data.access_token;
            var url = uploadUrl.replace('ACCESS_TOKEN', data.access_token).replace('TYPE', type);
            //下载临时视频
            if (!permanent && type==='video'){
                url = url.replace('https','http');
            } else {
                form.access_token = data.access_token;
            }

            var ops = {
                method: 'POST',
                url: url,
                json: true
            }

            if (type === 'news') {
                ops.body = form;
            } else {
                ops.formData = form;
            }
            request(ops)
                .then(function(response){
                    var _data = response.body;
                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("Delete material fails");
                    }
                })
        })
    })
}


/*
*@description:删除素材
 */
Wechat.prototype.deleteMaterial = function(mediaId){
    var that = this;
    var form = {
        media_id: mediaId
    };
    return new Promise(function(resolve, reject){
        that.getAccessToken().then(function(data){
            var deleteUrl = api.permanent.del.replace('ACCESS_TOKEN', data.access_token);
            request({method: "POST", url: deleteUrl, json: true, body: form})
            .then(function(response){
                var _data = response.body;
                if (_data) {
                    resolve(_data);
                } else {
                    throw new Error("Delete material fails");
                }
            })
        })
    })
}


/*
* @description：更新素材(只针对永久素材)
 */
Wechat.prototype.updateMaterial = function(mediaId, news){
    var that = this;
    var form = {
        media_id: mediaId
    }
    _.extend(form, news)
    return new Promise(function(resolve, reject){
        that.getAccessToken().then(function(data){
            var url = api.permanent.update.replace('ACCESS_TOKEN', data.access_token);
            request({method: "POST", url: url, json: true, body: form})
                .then(function(response){
                    var _data = response.body;
                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("Delete material fails");
                    }
                })
        })
    })
}


/*
 *@description:获取素材数目
 */
Wechat.prototype.count = function(){
    var that = this;
    return new Promise(function(resolve, reject){
        that.getAccessToken().then(function(data){
            var url = api.permanent.count.replace('ACCESS_TOKEN', data.access_token);
            request({method: "GET", url: url, json: true})
            .then(function(response){
                var _data = response.body;
                if (_data) {
                    resolve(_data);
                } else {
                    throw new Error("Delete material fails");
                }
            })
        })
    })
}

/*
 *@description:批量获取素材列表
 */
Wechat.prototype.batchMaterial = function(options){
    var that = this;
    options.type == options.type||'image';
    options.offset = options.offset||0;
    options.count = options.count || 1;
    return new Promise(function(resolve, reject){
        that.getAccessToken().then(function(data){
            var url = api.permanent.batch.replace('ACCESS_TOKEN', data.access_token);
            request({method: "POST", url: url, json: true, body: options})
                .then(function(response){
                    var _data = response.body;
                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("Delete material fails");
                    }
                })
        })
    })
}

module.exports = Wechat;