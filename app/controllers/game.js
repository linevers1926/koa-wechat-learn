/**
 * Created by Administrator on 2017/1/4.
 */
'use strict'
var wx = require('../../wx/index')
var util = require('../../libs/util')
var Movie = require('../api/movie')

exports.guss = function *(next) {
    var wechatApi = wx.getWechat();
    var data = yield wechatApi.fetchAccessToken();
    var ticketData = yield wechatApi.fetchTicket(data.access_token);
    var ticket = ticketData.ticket;
    var url = this.href;
    var params = util.sign(ticket, url);
    params.appId = wechatApi.appID;
    yield this.render("wechat/game", params)
}

exports.find = function *(next) {
    var id = this.params.id;
    var wechatApi = wx.getWechat();
    var data = yield wechatApi.fetchAccessToken();
    var ticketData = yield wechatApi.fetchTicket(data.access_token);
    var ticket = ticketData.ticket;
    var url = this.href;
    var params = util.sign(ticket, url);
    params.appId = wechatApi.appID;
    var movie = yield Movie.searchById(id)
    params.movie = movie;
    yield this.render("wechat/movie", params)
}
