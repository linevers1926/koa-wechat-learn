/**
 * Created by Administrator on 2017/1/6.
 */
'use strict'
var mongoose = require('mongoose')
var MovieSchema = require('../schemas/movie')
var Movie = mongoose.model('Movie', MovieSchema)

module.exports = Movie