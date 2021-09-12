// pages/index/index.js
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [],//轮播图数据
    recommendList: [],//推荐歌单
    topList: [],//排行榜数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // 以下代码封装到request.js中
    // wx.request({//发起 HTTPS 网络请求
    //   url: 'http://localhost:3000/banner',//对应的接口.这里需要写完整的url，不能只写/banner
    //   data:{type: 2},//2代表iPhone
    //   success: (res) => {
    //     console.log('请求成功：', res);
    //   },
    //   fail: (err) => {
    //     console.log('请求失败：',err);
    //   }
    // })

    let bannerListData =await request('/banner',{type:2});//await是等待异步任务结果，需要搭配async使用。await后面的异步任务通常要返回promise实例，所以在request.js中return new promise
    // console.log('结果数据：', result);
    this.setData({//修改数据
      bannerList: bannerListData.banners
    })

    //获取推荐歌单数据
    let recommendListData =await request('/personalized', {limit: 10});
    this.setData({//修改数据
      recommendList: recommendListData.result
    })


    //获取排行榜数据
    /**
     * 需求分析：
    *   1. 需要根据idx的值获取对应的数据
    *   2. idx的取值范围是0-20， 我们需要0-4
    *   3. 需要发送5次请求
    * 前++ 和 后++的区别
    *   1. 先看到是运算符还是值
    *   2. 如果先看到的是运算符就先运算再赋值
    *   3. 如果先看到的值那么就先赋值再运算
     */
    // top/list?idx=1。如果要取5个，idx的取值范围是0-4，要发5次请求，每次的请求的idx的值不一样
    let index = 0;
    let resultArr = [];
    while(index < 5){
      ;//因为要发5次请求，index不能一直是1，每发一次都要加1
      let topListData = await request('/top/list',{idx: index++})//{idx: 1}的意思是这个参数idx=1以对象的形式放在这里
      // 注意：topListData这是官方提供的数据量特别大的对象，我们要整合为自己的对象 
      // 这个对象里面有个字段叫name，name就应该在这个大的对象topListData里面取
      // splice(会修改原数组，可以对指定的数组进行增删改) slice(不会修改原数组)
      let topListItem = {name: topListData.playlist.name, tracks: topListData.playlist.tracks.slice(0,3)}//还应该有tracks这个数组,然后取这个数组的前3项
      resultArr.push(topListItem);//循环结束，数组里面就有足够的对象了

      //更新topListe的状态值, 放在此处可以提升用户体验。因为拿到数据就更新到这个数组，进而显示到页面。即发一次请求就那一次数据
      // 放这里好处：不需要等待五次请求全部结束才更新，用户体验较好，但是渲染次数会多一些
      this.setData({
        topList: resultArr
      })
    }
    //更新topListe的状态值, 放在此处更新会导致发送请求的过程中页面长时间白屏，用户体验差
    // this.setData({
    //   topList: resultArr
    // })
  },

  // 跳转至recommendSong页面的回调
  toRecommendSong(){
    wx.navigateTo({
      url: '/songPackage/pages/recommendSong/recommendSong'
    })
  },
  //跳转至other页面
  toOther(){
    wx.navigateTo({
      url: '/songPackage/pages/other/other'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})