/**
 * Created by Administrator on 2016/12/17.'*/
 'use strict'
var Koa = require('koa');
var path = require('path')
var fs = require('fs')
var mongoose = require('mongoose')
var app = new Koa()
var convert = require('koa-convert')


//mongod
var mongoose = require('mongoose')
var port = process.env.PORT||3000
var fs = require('fs')
var dbUrl = 'mongodb://localhost/imooc'
mongoose.connect(dbUrl)

// models loading
var models_path = __dirname + '/app/models'
var walk = function(path) {
    fs.readdirSync(path)
    .forEach(function(file) {
        var newPath = path + '/' + file;
        var stat = fs.statSync(newPath)
        if (stat.isFile()) {
            if (/(.*)\.(js|coffee)/.test(file)) {
                require(newPath)
            }
        } else if(stat.isDirectory()){
            walk(newPath)
        }
    })
}
//walk(models_path)


/*app.set('views', './app/views/pages')
app.set('view engine', 'jade')*/

// parse application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
//app.use(bodyParser.json())
//app.use(cookieParser())

/*app.use(session({
    sercet: 'linevers',
    resave: false,
    saveUninitialized: true,
    store: new mongoStore({
        url: dbUrl,
        collection: 'sessions'
    })
}))*/

//var env = process.env_NODE_ENV || 'development'

/*if ('development' === env) {
    app.set('showStackError', true)
    app.use(logger(':method :url :status'))
    app.locals.pretty = true
}*/



var wx = require('./wx/index')
var menu = require('./wx/menu')
//初始化Wechat
/*var wechatApi = wx.getWechat();

wechatApi.deleteMenu()
.then(function(data){
    return wechatApi.createMenu(menu);
}).then(function(msg){
    console.log(msg);
})*/

var Router = require('koa-router')
var router = new Router();
var game = require('./app/controllers/game')
router.get('/movie', convert(game.movie));
var wechat = require('./app/controllers/wechat')
router.get('/wechat', convert(wechat.hear))
router.post('/wechat', convert(wechat.hear))

//app
//    .use(router.routes())
//    .use(router.allowedMethods())
app.use(convert(router.routes())).use(convert(router.allowedMethods()))


app.listen(3000);
console.log("Listening: 3000")