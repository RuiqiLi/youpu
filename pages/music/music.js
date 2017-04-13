//music.js
var $ = require('../../utils/cheerio.js')
var parser = require('../../utils/contentParser.js')
var canvasHelper = require('../../utils/canvasHelper.js')
Page({
  data: {
    isFetching: false,
    errorMsg: "",
    title: "",
    artist: "",
    meta: [],
    content: [],
    canvasWidth: {}
  },
  // onTouchMove: function(e) {
  //   console.log(e)
  //   switch (e.type) {
  //   case 'touchstart':
  //     this.touchX = e.changedTouches[0].x
  //     this.touchY = e.changedTouches[0].y
  //     break
  //   case 'touchmove':
  //     var left = this.data.canvasLeft[e.target.dataset.canvasId] ? this.data.canvasLeft[e.target.dataset.canvasId] : 0
  //     left = left - this.touchX + e.changedTouches[0].x
  //     if (left > 0) {
  //       left = 0
  //     }
  //     this.setData({
  //       ['canvasLeft.'+e.target.dataset.canvasId]: left
  //     })
  //     break
  //   }
  // },
  parseData: function(json) {
    var data = JSON.parse(json)
    // console.log(data)
    var { chords, content: rawContent } = data
    var { meta, content } = parser.parseContent(rawContent)
    this.setData({ meta, content })
    var canvasWidth = {}
    for (var i = 0; i < content.length; i++) {
      if (content[i].lineType == 'TAB') {
        canvasHelper.drawTab(content[i].value, content[i].canvasId)
      } else if (content[i].lineType == 'RHYTHM') {
        var w = canvasHelper.drawRhythm(content[i].value, content[i].canvasId)
        canvasWidth = Object.assign(canvasWidth, {
          [content[i].canvasId]: w
        })
      } else if (content[i].lineType == 'CHORUS') {
        var tmp_content = content[i].value
        for (var j = 0; j < tmp_content.length; j++) {
          if (tmp_content[j].lineType == 'RHYTHM') {
            var w = canvasHelper.drawRhythm(tmp_content[j].value, tmp_content[j].canvasId)
            canvasWidth = Object.assign(canvasWidth, {
              [tmp_content[j].canvasId]: w
            })
          }
        }
      }
    }
    this.setData({ canvasWidth })
  },
  onLoad: function(options) {
    this.link = options.link
    var { title, artist } = options
    // this.link = 'https://yoopu.me/view/o%3AAXqzV8P7'
    // var title = 'test'
    // var artist = 'test'
    this.setData({ title, artist })
    var thePage = this
    wx.getStorage({
      key: thePage.link,
      success: function(res) {
        thePage.parseData(res.data)
      },
      fail: function() {
        thePage.setData({
          isFetching: true
        })
        if (wx.showLoading) {
          wx.showLoading({
            title: '正在加载',
            mask: true
          })
        }
        wx.request({
          url: thePage.link,
          success: function(res) {
            // console.log(res.data)
            var data = $('script', res.data).eq(1).text().split('\n')[1].trim().slice(12, -1)
            // console.log(data)
            wx.setStorage({
              key: thePage.link,
              data
            })
            thePage.parseData(data)
          },
          fail: function(res) {
            console.error(res)
            thePage.setData({ errorMsg: "网络错误，无法获取内容" })
          },
          complete: function() {
            if (wx.hideLoading) {
              wx.hideLoading()
            }
            thePage.setData({ isFetching: false })
          }
        })
      },
    })
  },
  onShareAppMessage: function () {
    var title = this.data.title
    var artist = this.data.artist
    var link = this.link
    return {
      title: '「尤谱」'+ title + ' - ' + artist,
      path: '/pages/music/music?link='+link+'&title='+title+'&artist='+artist
    }
  }
})