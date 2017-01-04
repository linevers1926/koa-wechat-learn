/**
 * Created by Administrator on 2016/12/18.
 */
'use strict'
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
    },
    group: {
        create: prefix + 'groups/create?access_token=ACCESS_TOKEN',
        get: prefix + 'groups/get?access_token=ACCESS_TOKEN',
        update: prefix + 'groups/update?access_token=ACCESS_TOKEN',
        move: prefix + 'groups/members/update?access_token=ACCESS_TOKEN',
        batchupdate: prefix + 'groups/members/batchupdate?access_token=ACCESS_TOKEN',
        delete: prefix + 'groups/delete?access_token=ACCESS_TOKEN',
        check: prefix + 'groups/getid?access_token=ACCESS_TOKEN'
    },
    user: {
        remark: prefix + 'user/info/updateremark?access_token=ACCESS_TOKEN',
        fetch: prefix + 'user/info?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN',
        batch: prefix + 'user/info/batchget?access_token=ACCESS_TOKEN'
    },
    mass: {
        group: prefix + 'message/mass/sendall?access_token=ACCESS_TOKEN',
        openId: prefix + 'message/mass/send?access_token=ACCESS_TOKEN',
        del: prefix + 'message/mass/delete?access_token=ACCESS_TOKEN',
        preview: prefix + 'message/mass/preview?access_token=ACCESS_TOKEN'
    },
    menu: {
        create: prefix + 'menu/create?access_token=ACCESS_TOKEN',
        get: prefix + 'menu/get?access_token=ACCESS_TOKEN',
        del: prefix + 'menu/delete?access_token=ACCESS_TOKEN',
        current: prefix + 'get_current_selfmenu_info?access_token=ACCESS_TOKEN'
    },
    semantic: 'https://api.weixin.qq.com/semantic/semproxy/search?access_token=ACCESS_TOKEN',
    long2short: prefix + "shorturl?access_token=ACCESS_TOKEN",
    ticket: prefix + "ticket/getticket?access_token=ACCESS_TOKEN&type=jsapi",
    qrcode: {
        create: prefix + "qrcode/create?access_token=ACCESS_TOKEN",
        show: "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=TICKET"
    }
    //upload: prefix + 'media/upload?access_token=ACCESS_TOKEN&type=TYPE'
}
function Wechat(ops) {
    var that = this;
    this.appID = ops.APPID;
    this.appSecret = ops.appSecret;
    this.getAccessToken = ops.getAccessToken;
    this.saveAccessToken = ops.saveAccessToken;
    this.getTicket = ops.saveTicket;
    this.saveTicket = ops.saveTicket;
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
    return this.getAccessToken()
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

Wechat.prototype.fetchTicket = function(accessToken) {
    var that = this;
    return this.getTicket()
        .then(function(data){
            try {
                data = JSON.parse(data)
            }
            catch(e) {
                return that.updateTicket(accessToken);
            }
            if (that.isValidTicket(data)){
                //return Promise.resolve(data);
                return Promise.resolve(data);
            } else {
                return that.updateTicket(accessToken);
            }
        })
        .then(function(data){
            that.saveTicket(data);
            return Promise.resolve(data);
        })
}


Wechat.prototype.isValidAccessToken = function(data) {
    if (!data || !data.expires_in || !data.access_token) {
        return false;
    }
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
            var data = response.body;
            var now = new Date().getTime();
            var expires_in = now + data.expires_in*1000 - 20*1000;
            data.expires_in = expires_in;
            resolve(data);
        })
    })
}

//检测jsapi票据是否有效
Wechat.prototype.isValidTicket = function(data) {
    if (!data || !data.expires_in || !data.access_token) {
        return false;
    }
    var expires_in = data.expires_in;
    var now = (new Date()).getTime();
    if (now < expires_in) {
        return true;
    } else {
        return false;
    }
}

//更新jsapi ticket方法
Wechat.prototype.updateTicket = function(accessToken) {
    var url = api.ticket.replace('ACCESS_TOKEN', accessToken);
    return new Promise(function(resolve, reject) {
        request({url: url, json: true}).then(function(response){
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
        that.fetchAccessToken().then(function(data){
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
        that.fetchAccessToken().then(function(data){
            var url = api.permanent.count.replace('ACCESS_TOKEN', data.access_token);
            request({method: "GET", url: url, json: true})
            .then(function(response){
                var _data = JSON.stringify(response.body);
                if (_data) {
                    resolve(_data);
                } else {
                    throw new Error("Count material fails");
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
        that.fetchAccessToken().then(function(data){
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

//创建用户分组
Wechat.prototype.createGroup= function(name) {
    var that = this;
    var form = {
        group: {
            name: name
        }
    }
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken().then(function(data){
            var url = api.group.create.replace('ACCESS_TOKEN', data.access_token);
            console.log(url);
            request({method: "POST", body: form, url: url, json: true})
            .then(function(response){
                var _data = JSON.stringify(response.body);
                if (_data) {
                    resolve(_data);
                } else {
                    throw new Error('createGroup error');
                }
            })
        })
    })
}

Wechat.prototype.getGroups = function() {
    var that = this;
    return new Promise(function(resolve,reject){
        that.fetchAccessToken().then(function(data){
            var url = api.group.get.replace('ACCESS_TOKEN', data.access_token)
            request({url: url, method: 'GET'})
                .then(function(response){
                    var _data = response.body;
                    if(_data) {
                        resolve(_data);
                    } else {
                        throw new Error("getGroups Error");
                    }
                })
        })
    })
}

//查询用户所在分组
Wechat.prototype.checkGroup = function(openid) {
    var that = this;
    return new Promise(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.group.check.replace('ACCESS_TOKEN', data.access_token)
            var ops = {openid: openid};
            request({method: 'POST', json: true, url: url, body: ops})
            .then(function(response){
                var _data = response.body;
                if (_data) {
                    resolve(_data);
                } else {
                    throw new Error('checkGroup Error');
                }
            })
        })
    })
}

//修改分组
Wechat.prototype.checkGroup = function(id, name) {
    var that = this;
    return new Promise(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.group.update.replace('ACCESS_TOKEN', data.access_token)
            var ops = {
                group: {
                    id: id,
                    name: name
                }
            };
            request({method: 'POST', json: true, url: url, body: ops})
                .then(function(response){
                    var _data = JSON.stringify(response.body);
                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error('checkGroup Error');
                    }
                })
        })
    })
}

//移动用户分组
Wechat.prototype.moveUserGroup = function(openid, to_groupid) {
    var that = this;
    return new Promise(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.group.move.replace('ACCESS_TOKEN', data.access_token)
            var ops = {
                    openid: openid,
                    to_groupid: to_groupid
            };
            console.log(ops);
            request({method: 'POST', json: true, url: url, body: ops})
            .then(function(response){
                var _data = JSON.stringify(response.body);
                if (_data) {
                    resolve(_data);
                } else {
                    throw new Error('checkGroup Error');
                }
            }).catch(function(err)
            {
                reject(err)
            })
        })
    })
}

//设置用户别名
Wechat.prototype.remarkUser = function(openId, remark) {
    var that = this;
    return new Promise(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.user.remark.replace('ACCESS_TOKEN', data.access_token)
            var ops = {
                openid: openId,
                remark: remark
            };
            request({method: 'POST', json: true, url: url, body: ops})
            .then(function(response){
                var _data = JSON.stringify(response.body);
                if (_data) {
                    resolve(_data);
                } else {
                    throw new Error('checkGroup Error');
                }
            })
            .catch(function(err)
            {
                reject(err)
            })
        })
    })
}

//获取用户信息
Wechat.prototype.fetchUserInfo = function(openId, lang) {
    var that = this;
    return new Promise(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.user.fetch.replace('ACCESS_TOKEN', data.access_token).replace('OPENID', openId)
            var ops = {
                openid: openId,
                lang: lang||"zh_CN"
            };
            request({method: 'POST', json: true, url: url, body: ops})
            .then(function(response){
                var _data = response.body;
                if (_data) {
                    resolve(_data);
                } else {
                    throw new Error('checkGroup Error');
                }
            }).catch(function(err)
            {
                reject(err)
            })
        })
    })
}

//消息群发
Wechat.prototype.sendByGroup = function(type, message, groupId) {
    var that = this;
    var msg = {
        filter: {},
        msgtype: type
    }
    msg[type] = message

    if(!groupId) {
        msg.filter.is_to_all = true;
    } else {
        msg.filter = {
            "is_to_all":false,
            "group_id":groupId
        }
    }
    return new Promise(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.mass.group.replace('ACCESS_TOKEN', data.access_token)
            request({method: 'POST', json: true, url: url, body: msg})
                .then(function(response){
                    var _data = response.body;
                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error('sendByGroup Error');
                    }
                }).catch(function(err)
                {
                    reject(err)
                })
        })
    })
}

//根据openID列表群发
Wechat.prototype.sendByOpenId = function(type, message, openIds) {
    var that = this;
    var msg = {
        touser: openIds,
        msgtype: type
    }
    msg[type] = message;
    return new Promise(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.mass.openId.replace('ACCESS_TOKEN', data.access_token)
            request({method: 'POST', json: true, url: url, body: msg})
                .then(function(response){
                    var _data = response.body;
                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error('sendByGroup Error');
                    }
                }).catch(function(err)
                {
                    reject(err)
                })
        })
    })
}

//消息预览
Wechat.prototype.sendByOpenId = function(type, message, openId) {
    var that = this;
    var msg = {
        touser: openId,
        msgtype: type
    }
    msg[type] = message;
    return new Promise(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.mass.preview.replace('ACCESS_TOKEN', data.access_token)
            request({method: 'POST', json: true, url: url, body: msg})
                .then(function(response){
                    var _data = response.body;
                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error('sendByGroup Error');
                    }
                }).catch(function(err)
                {
                    reject(err)
                })
        })
    })
}

//创建自定义菜单
Wechat.prototype.createMenu = function(buttons) {
    var that = this;
    var menu = {
        button: buttons
    }
    return new Promise(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.menu.create.replace('ACCESS_TOKEN', data.access_token)
            request({method: 'POST', json: true, url: url, body: menu})
                .then(function(response){
                    var _data = response.body;
                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error('createMenu Error');
                    }
                }).catch(function(err)
                {
                    reject(err)
                })
        })
    })
}

//获取自定义菜单
Wechat.prototype.getMenu = function() {
    var that = this;
    return new Promise(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.menu.get.replace('ACCESS_TOKEN', data.access_token)
            request({method: 'GET', json: true, url: url})
                .then(function(response){
                    var _data = response.body;
                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error('getMenu Error');
                    }
                }).catch(function(err)
                {
                    reject(err)
                })
        })
    })
}

//删除自定义菜单
Wechat.prototype.deleteMenu = function() {
    var that = this;
    return new Promise(function(resolve, reject){
        that.fetchAccessToken()
            .then(function(data){
            var url = api.menu.del.replace('ACCESS_TOKEN', data.access_token)
            request({method: 'GET', json: true, url: url})
                .then(function(response){
                    var _data = response.body;
                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error('delMenu Error');
                    }
                }).catch(function(err)
                {
                    reject(err)
                })
        })
    })
}

//删除自定义菜单
Wechat.prototype.getCurrentMenu = function() {
    var that = this;
    return new Promise(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.menu.current.replace('ACCESS_TOKEN', data.access_token)
            request({method: 'GET', json: true, url: url})
                .then(function(response){
                    var _data = response.body;
                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error('delMenu Error');
                    }
                }).catch(function(err)
                {
                    reject(err)
                })
        })
    })
}

//发送语义理解请求
Wechat.prototype.semantic = function(semanticData) {
    var that = this;
    return new Promise(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            semanticData.appid = data.appID
            console.log(semanticData)
            var url = api.semantic.replace('ACCESS_TOKEN', data.access_token)
            request({method: 'POST', json: true, url: url, body: semanticData})
                .then(function(response){
                    var _data = response.body;
                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error('delMenu Error');
                    }
                }).catch(function(err)
                {
                    reject(err)
                })
        })
    })
}

//长链接转短链接
Wechat.prototype.long2short = function(longUrl) {
    var that = this;
    var form = {
        action: 'long2short',
        long_url: longUrl
    }
    return new Promise(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.long2short.replace('ACCESS_TOKEN', data.access_token)
            form.access_token = data.access_token;
            console.log(form)
            request({method: 'POST', json: true, url: url, body: form})
                .then(function(response){
                    var _data = response.body;
                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error('delMenu Error');
                    }
                }).catch(function(err)
                {
                    reject(err)
                })
        })
    })
}

//生成二维码链接
Wechat.prototype.createQrcode = function(qrcodeParams) {
    var that = this;
    return new Promise(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.qrcode.create.replace('ACCESS_TOKEN', data.access_token)
            request({method: 'POST', json: true, url: url, body: qrcodeParams})
                .then(function(response){
                    var _data = response.body;
                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error('createQrcode Error');
                    }
                }).catch(function(err)
                {
                    reject(err)
                })
        })
    })
}

//显示二维码
Wechat.prototype.showQrcode = function(ticket) {
    var that = this;
    //var url = api.qrcode.show.replace('TICKET', ticket)
    //return request.get(url).pipe(request.put('img.png'))
    return new Promise(function(resolve, reject){
        var url = api.qrcode.show.replace('TICKET', ticket)
        request({method: 'GET', url: url})
            .then(function(response){
                var _data = response.request.href;
                if (_data) {
                    resolve(_data);
                } else {
                    throw new Error('showQrcode Error');
                }
            }).catch(function(err)
            {
                reject(err)
            })
    })
}

module.exports = Wechat;