// pages/recommendSong/recommendSong.js
import PubSub from 'pubsub-js';
import request from '../../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    day: '',//天
    month: '',//月
    recommendList: [],//推荐列表数据
    index: 0,//点击音乐的下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /*为了安全起见，既然需要用户登录，拿用户的cookies，就要在onLoad()中
    （即页面一加载）判断用户是否登录，如果没有登录后面的东西都没有必要执
    行了，让它直接跳转到登录界面*/
    //判断用户是否登录
    let userInfo = wx.getStorageSync('userInfo');//读取之前存储的用户的数据
    if(!userInfo){//如果没有值，说明没有登录
       wx.showToast({
         title: '请先登录',
         icon: 'none',
         success: () =>{
           //提示完后跳转到登录页面
           wx.reLaunch({
              url: '/pages/login/login'
           })
         }
       })
    }
    // 更新日期的状态数据.下面是使用了小程序的内置日期函数
    this.setData({
      day: new Date().getDate(),
      month: new Date().getMonth() + 1//因为外国的月份计数与国内不一样，所以要加1
    })
    //获取每日推荐的数据
    this.getRecommendList();

    // 订阅来自songDetail页面发布的消息
    PubSub.subscribe('switchType', (msg, type) => {
      // console.log(msg, type);
      // 因为上一首和下一首要到歌曲列表recommendList中找，所以要把歌曲列表数组拿出来
      let {recommendList,index} = this.data;
      if(type === 'pre'){//上一首
        (index === 0) && (index = recommendList.length)//这里的意思是如果index === 0，就index = recommendList.length
        index -= 1;
      }else{//下一首
        (index === recommendList.length - 1) && (index = -1);//如果index === recommendList.length - 1，就index = -1//index = -1是因为下面会加1，等于0
        index += 1;
      }

      // 更新下标
      this.setData({
        index 
      })

      let musicId = recommendList[index].id;//详情页有了musicId，就可以通过它获取音乐详情
      // 上面拿到的musicId还要回传给songDetail页面
      PubSub.publish('musicId', musicId)
    });
  },
  //获取用户每日推荐数据
  async getRecommendList(){
    let recommendListData = await request('/recommend/songs')
    this.setData({
      recommendList: recommendListData.recommend//recommendList是要更新的数据，recommendListData是数据源，recommend是最外层的数组
    })
  },

  // 跳转至songDetail页面
  toSongDetail(event){
    // let song = event.currentTarget.dataset.song;
    let {song, index} = event.currentTarget.dataset;
    this.setData({
      index //把下标更新到data中
    })

    //路由跳转传参：query参数
    wx.navigateTo({
      // 不能直接将song对象作为参数传递，长度过长，会被自动截取掉
      // url: '/pages/songDetail/songDetail?song=' + JSON.stringify(song)

      //不能传json， 把http://localhost:3000/song/detail?ids=1338695683的songs里面的id传过去
      url: '/songPackage/pages/songDetail/songDetail?musicId=' + song.id
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