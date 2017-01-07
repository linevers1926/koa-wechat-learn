/**
 * Created by Administrator on 2017/1/6.
 */
'use strict'
var mongoose = require('mongoose')
var ObjectId = mongoose.Schema.Types.ObjectId

var CategorySchema = new mongoose.Schema({
    name: String,
    movies: [{type: ObjectId, ref: 'Movie'}]
})

module.exports = CategorySchema