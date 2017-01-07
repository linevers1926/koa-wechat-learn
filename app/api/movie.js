/**
 * Created by Administrator on 2017/1/5.
 */
'use strict'
var mongoose = require('mongoose')
var Movie = require('../models/movie')
var Category = require('../models/category')
var Movie = mongoose.model('Movie')
var Category = mongoose.model('Category')
var koa_request = require('koa-request')
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var _ = require('lodash')

// index page
exports.findAll = function *() {
    var categories = yield Category.find({}).populate({
                                path: 'movies',
                                select: 'title poster',
                                options: {limit: 6}
                            }).exec();
    return categories;
}

// search page
exports.searchByCatogory = function *(cateId){
    var categories = yield Category.find({_id: cateId})
        .populate({
            path: 'movies',
            select: 'title poster'
        })
        .exec(/*function(err, categories) {
            if (err) {
                console.log(err)
            } else {
                var category = categories[0] || {}
                var movies = category.movie
                var result = movies.slice(index, index + count)

                return res.render('search', {
                    categories: categories,
                    keyword: category.name,
                    currentPage: (page+1),
                    query: 'cat=' + cateId,
                    totalPage: Math.ceil(movies.length / count),
                    movies: result
                })
            }
        }*/);
    return categories;
}

exports.searchByName = function *(q) {
    var movies = yield  Movie.find({title: new RegExp(q + '.*', 'i')})
        .exec(/*function(err, movies) {
         if (err) {
         console.log(err)
         }
         var results = movies.slice(index, index + count);
         res.render({
         title: "linevers 结果列表页面",
         keyword: q,
         currentPage: (page+1),
         query: 'q='+q,
         totalPage: Math.ceil(movies.length/count),
         movies: results
         })
         }*/)
    return movies
}

function* updateMovie(movie) {
    var options = {
        url: "https://api.douban.com/v2/movie/subject/" + movie.doubanId,
        json: true
    }
    var cateArray = [];

    var response = yield request(options);
    var _data = response.body;
    _.extend(movie, {
        country: _data.countries[0] ||"",
        language: _data.language || "",
        summary: _data.summary || ""
    })


    var genres = movie.genres;
    if (genres && genres.length > 0) {
        genres.forEach(function(genre){
            cateArray.push(function *(){
                console.log('bbb')
                var cat = yield Category.findOne({name: genre}).exec();
                if (cat) {
                    cat.movies.push(movie._id);
                    yield cat.save()
                } else {
                    cat = new Category({
                        name: genre,
                        movies: [movie._id]
                    })
                    cat = yield cat.save()
                    console.log(cat)
                    movie.category = cat._id;
                    yield movie.save()
                }
            })
        })
        yield cateArray
    }
    else {
        movie.save();
    }
}

//通过豆瓣查询电影
exports.searchByDouban = function *(q) {
    var options = {
        url: "https://api.douban.com/v2/movie/search?q="+ encodeURIComponent(q)
    }
    var response = yield koa_request(options);
    var data = JSON.parse(response.body);

    var subjects = [];
    var movies = []
    if (data && data.subjects) {
        subjects = data.subjects;
    }

    //检测是否存储过
    if (subjects.length > 0) {
        var queryArray = [];
        subjects.forEach(function(item) {
            queryArray.push(function *() {
                var movie = yield Movie.findOne({doubanId: item.id})
                if (movie) {
                    movies.push(movie)
                }
                else {
                    var directors = item.directors || []
                    var director = directors[0] || {}
                    var movie = new Movie({
                        director: director.name || "",
                        title: item.title,
                        doubanId: item.id,
                        poster: item.images.large,
                        year: item.year,
                        genres: item.genres || []
                    });
                    movie = yield movie.save()
                    movies.push(movie)
                }
            })
        })
        //forEach over
        yield queryArray;
        var updates = [];
        movies.forEach(function(movie){
            updates.push(function *(){
                yield updateMovie(movie);
            })
        })
        yield updates
    }
    return subjects
}

//通过Id查询电影
exports.searchById = function *(id) {
    var movie = yield  Movie.findOne({doubanId: id})
    return movie
}