//search.js
var $ = require('../../utils/cheerio.js')
var app = getApp()
Page({
  data: {
    focusing: false,
    isFetching: false,
    errorMsg: "",
    list:[]
  },
  onTapSearch: function(e) {
    this.setData({
      focusing: true
    })
  },
  onInputSearch: function(e) {
  //   if (this.timer) {
  //     clearTimeout(this.timer)
  //     this.timer = undefined
  //   }
  //   this.timer = setTimeout(()=>{
  //     this.doSearch(e.detail.value)
  //     this.timer = undefined
  //   }, 1000)
  },
  onConfirmSearch: function(e) {
    this.doSearch(e.detail.value)
  },
  doSearch: function(value) {
    if (this.data.isFetching || !value) {
      return
    }
    this.setData({
      isFetching: true,
      errorMsg: "",
      list: []
    })
    if (wx.showLoading) {
      wx.showLoading({
        title: '正在搜索',
        mask: true
      })
    }
    var thePage = this
    wx.request({
      url: 'https://yoopu.me/gallery?q='+encodeURI(value),
      success: function(res) {
        // console.log(res.data)
        var rawList = $('a', '.galleryTable', res.data)
        // console.log(rawList)
        var list = []
        rawList.each(function(i, elem) {
          var item = thePage.parseItem($(elem))
          if (item) {
            list.push(item)
          }
        })
        if (list.length == 0) {
          thePage.setData({ errorMsg: "没有找到相关内容" })
        } else {
          thePage.setData({ list })
        }
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
  parseItem: function(item) {
    var typeName = item.attr('class')
    if (typeName != 'ukulele') {
      return
    }
    var link = app.globalData.baseURL + item.attr('href')
    var title = item.find('.title').text()
    var artist = item.find('.artist').text()
    return {
      link,
      title,
      artist
    }
  },
  onTapItem: function(e) {
    var { link, title, artist } = e.currentTarget.dataset
    wx.navigateTo({
      url: '/pages/music/music?link='+link+'&title='+title+'&artist='+artist
    })
  },
  onShareAppMessage: function () {
    return {
      title: '「尤谱」有谱，尤克里里谱',
      path: '/pages/search/search'
    }
  }
})