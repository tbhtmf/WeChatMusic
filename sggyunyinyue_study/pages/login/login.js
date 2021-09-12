// pages/login/login.js
/**
  说明: 登录流程
  1. 收集表单项数据
  2. 前端验证
    1) 验证用户信息(账号，密码)是否合法
    2) 前端验证不通过就提示用户，不需要发请求给后端
    3) 前端验证通过了，发请求(携带账号, 密码)给服务器端
  3. 后端验证
    1) 验证用户是否存在
    2) 用户不存在直接返回，告诉前端用户不存在
    3) 用户存在需要验证密码是否正确
    4) 密码不正确返回给前端提示密码不正确
    5) 密码正确返回给前端数据，提示用户登录成功(会携带用户的相关信息)
*/
import request from '../../utils/request'//因为要发请求，所以这里这样写
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 初始化phone、password
    phone: '',//手机号
    password: ''//用户密码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  //表单项内容发生改变的回调.通过event拿表单项的数据
  handleInput(event){
    // console.log(event);
    // console.log(event.detail.value);
    let type = event.currentTarget.id;//这里type的取值有两种，一种是phone，一种是password
    // console.log(type,event.detail.value);

    // 因为type是变量，如果是在对象里面操作属性，就要加中括号
    this.setData({
      [type]: event.detail.value
    })
  },

  //登录的回调
  async login(){
    // 收集表单项数据（之前已经收集过了，现在只是把phone、password从data中找出来）
    let {phone, password} = this.data;
    // 2. 前端验证
    /*
    * 手机号验证：
    *   1. 内容为空
    *   2. 手机号格式不正确
    *   3. 手机号格式正确，验证通过
    * */

    if(!phone){//如果手机号为空
      //提示用户
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none'//如果不写这行代码，在手机为空点击登录按钮时，会显示一个√图标，不太符合情况
      })
      return;//它有成功和失败的回调，说明是异步任务，所以为了保险起见，加上return.走到这里就退出了，没必要往下走
    }

    //如果手机号不空，需要验证，这里用到正则表达式
    let phoneReg = /^1(3|4|5|6|7|8|9)\d{9}$/;//第二位是从3-9
    if(!phoneReg.test(phone)){
      //提示用户
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none'//如果不写这行代码，在手机为空点击登录按钮时，会显示一个√图标，不太符合情况
      })
      return; //它有成功和失败的回调，说明是异步任务，所以为了保险起见，加上return
    }

    //验证密码
    if(!password){
      wx.showToast({
        title: '密码不能为空',
        icon: 'none'
      })
      return;
    }

    //再往下走就是前端验证通过
    wx.showToast({
      title: '前端验证通过',
    })


    //后端验证
    let result = await request('/login/cellphone', {phone, password,isLogin: true})
    // 建议先判断成功的。因为成功的状态码少些，所以先判断少的，失败的很多的
    if(result.code === 200){
      wx.showToast({
        title: '登录成功'
      })
      console.log(result);//查看在登录成功以后拿到的值什么，有没有cookie

      //将用户的信息存储至本地
      wx.setStorageSync('userInfo', JSON.stringify(result.profile))//转为json对象

      // 登录成功就跳转至个人中心personal
      // wx.navigateTo({//用navigateTo，即使输入账号和密码都正确，登录成功后不能跳转回个人中心页面。
      // wx.switchTab({
      wx.reLaunch({
        url: '/pages/personal/personal'
      })

    }else if(result.code === 400){
      wx.showToast({
        title: '手机号错误',
        icon: 'none'
      })
    }else if(result.code === 502){
      wx.showToast({
        title: '密码错误',
        icon: 'none'
      })
    }else{
      wx.showToast({//最后不管什么原因都没有成功就是登录失败
        title: '登录失败，请重新登录',
        icon: 'none'
      })
    }
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