/**
 * Created by Administrator on 2017/1/5.
 */
'use strict'
var Movie = require('../api/movie')

// index page
exports.index = function *(next) {
    /*Category
        .find({})
        .populate({
            path: 'movies',
            select: 'title poster',
            options: {limit: 6}
        })
        .exec(function(err, categories) {
            if (err) {
                console.log(err);
            }
            res.render('index', {
                title: 'linevers 首页',
                categories: categories
            })
        })*/
    var categories = yield Movie.findAll();
    yield this.render('pages/index', {
        title: 'linevers 首页',
        categories: categories
    })
}

//查找
exports.search = function *(next) {
    var cateId = this.query.cat;
    var q = this.query.q;
    var page = parseInt(this.query.p, 10) || 0;
    var count = 2;
    var index = page*count;
    if (cateId) {
        var categories = yield Movie.searchByCatogory(cateId);
        var category = categories[0] || {}
        var movies = category.movies || [];
        var results = movies.slice(index, index+count)
        yield this.render('pages/results', {
            title: "linevers 结果列表页面",
            keyword: category.name,
            currentPage: page+1,
            query: 'cat='+cateId,
            totalPage: Math.ceil(movies.length/count),
            movies: results
        })
    }
    else {
        var movies = yield Movie.searchByName(q)
        var result = movies.slice(index, index+count)
        yield this.render('pages/results', {
            title: 'lineves 结果列表页面',
            keyword: q,
            currentPage: page+1,
            qurey: 'q='+q,
            totalPage: Math.ceil(movies.length/count),
            movies: results
        })
    }
}


