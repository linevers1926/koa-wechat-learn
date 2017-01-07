/**
 * Created by Administrator on 2017/1/5.
 */
'use strict'
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var MovieSchema = new Schema({
    director: String,
    title: String,
    doubanId: String,
    language: String,
    country: String,
    summary: String,
    flash: String,
    poster: String,
    year: Number,
    genres: [String],
    pv: {
        type: Number,
        default: 0
    },
    category: {
        type: ObjectId,
        ref: 'Category'
    },
    meta: {
        createAt: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: Date,
            default: Date.now()
        }
    }
})

module.exports = MovieSchema