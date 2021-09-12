// pages/personal/personal.js
import request from "../../utils/request";
let startY = 0;//手指起始的坐标
let moveY = 0;//手指移动的坐标
let moveDistance = 0;//手指移动的距离
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coverTransform: 'translateY(0)',//因为起始的坐标是初始值，没有移动，所以为0
    // coverTransform: 'translateY(200rpx)'//测试一开始是否有位移
    coveTransition: '',
    userInfo: {},//用户信息
    recentPlayList: [],//用户播放记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //读取用户的基本信息
    let userInfo = wx.getStorageSync('userInfo');
    // 只有用户登录的时候才能读到信息，否则读到的userInfo里面为空，所以需要下面的判断
    if(userInfo){//为true才能说明用户登录了。用户登录以后，就把数据显示到页面上，这时页面的数据都找data要，所以，在data中初始化userInfo: {}
      // console.log('userInfo: ', userInfo);
      //更新userInfo的状态
      this.setData({
        // 存进userInfo的数据是JSON，所以取出来就要反编译
        userInfo: JSON.parse(userInfo)
      })

      // 要拿用户的播放记录，就要先拿用户的userId,所以获取用户的播放记录就需要在这个if条件里面
      //获取用户播放记录
      this.getUserRecentPlayList(this.data.userInfo.userId)
    }
  },
  // 注意：最好不要在实例的生命周期函数上async，这样会导致页面的加载出问题，所以这里封装为一个函数，没有写在onLoad()里面
  //封装方法。获取用户播放记录的功能函数
  async getUserRecentPlayList(userId){//因为是动态获取，所以这里写userId形参
    // http://localhost:3000/user/record?uid=5167766309&type=0
    let recentPlayListData = await request('/user/record', {uid: userId, type: 0})//谁调用这个方法，就应该把你的userId传给我
    //拿到数据后应该将数据更新到data中
    this.setData({
      // 因为allData里面的数据太多了，所以这里截取10条数据
      recentPlayList: recentPlayListData.allData.splice(0,10)
    })
  },

  handleTouchStart(event){
    // console.log('start');//测试事件有没有问题
    //获取手指起始坐标。因为有可能是多个手指，所以这里以数组的形式捕捉手指的动作。但是以第一个触摸屏幕的手指为标准，touches[0].clientY是拿到第一个手指的纵向坐标
    startY = event.touches[0].clientY;

    // 保证滑动的时候没有过渡，松开的时候有过渡。方法：在手指点击的时候，一上来就把过渡效果干掉
    this.setData({
      coveTransition: ''
    })
  },
  handleTouchMove(event){
    // console.log('move');
    moveY = event.touches[0].clientY;
    moveDistance = moveY - startY;
    // console.log(moveDistance);// 打印移动的距离

    if(moveDistance <= 0){//小于0时不让它向上互动，只能向下拉动
      return;
    }
     // 如果大于80就不能再往下拉了
     if(moveDistance >= 80){
      moveDistance = 80;// 手指再移动就让它恒为80
     }
    //动态更新coverTransform的状态值
    this.setData({
      coverTransform: `translateY(${moveDistance}rpx)`//``是用了ES6模板，变量的地方用${}即可。用rpx移动的距离小一点，用px移动的距离大一点
    })
  },
  handleTouchEnd(event){
    // console.log('end');
    // 在向下拉到最底端的时候，需要有一个回弹的效果，这个动作的发生是在手指松开的时候。将位移的值改为0即可
    //动态更新coverTransform的状态值
    this.setData({
      coverTransform: `translateY(0rpx)`,//``是用了ES6模板，变量的地方用${}即可。用rpx移动的距离小一点，用px移动的距离大一点
      coveTransition: 'transform 1s linear'//1s的回弹过渡效果
    })
  },

  // 跳转至登录login页面的回调
  toLogin(){
    wx.navigateTo({
      url: '/pages/login/login'
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