import request from '../../utils/request'
let isSend = false; // 函数节流使用
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholderContent: '', // placeholder的内容。默认为空串
    hotList: [], // 热搜榜数据
    searchContent: '', // 用户输入的表单项数据
    searchList: [], // 关键字模糊匹配的数据
    historyList: [], // 搜索历史记录。初始化一个数组。
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取初始化数据
    this.getInitData();//调用方法
    
    // 获取历史记录
    this.getSearchHistory();//调用这个方法
  },
  // 获取初始化的数据
  async getInitData(){
    // http://localhost:3000/search/default
    let placeholderData = await request('/search/default');
    // http://localhost:3000/search/hot/detail
    let hotListData = await request('/search/hot/detail');
    this.setData({
      placeholderContent: placeholderData.data.showKeyword,//更新data中的数据
      hotList: hotListData.data
    })
  },
  
  // 获取本地历史记录的功能函数
  getSearchHistory(){
    let historyList = wx.getStorageSync('searchHistory');//获取searchHistory
    if(historyList){//如果historyList为true就是有值，有值就更新到data中
      this.setData({
        historyList
      })
    }
  },
   
  // 表单项内容发生改变的回调
   handleInputChange(event){
    // console.log(event);
    // 更新searchContent的状态数据
    this.setData({
      searchContent: event.detail.value.trim()//trim()是去掉空格
    })

     if(isSend){//判断isSend是否为true
       return
     }
     isSend = true;
     this.getSearchList();
     // 函数节流
    setTimeout( () => {
      isSend = false;
    }, 300)//300毫秒发一次请求
    
  },
  // 获取搜索数据的功能函数
  async getSearchList(){
    if(!this.data.searchContent){
      this.setData({
        searchList: []//当删除搜索框的字符后，搜索框里面没有字符，就把之前的搜索记录置空
      })
      return;
    }
    let {searchContent, historyList} = this.data;

    // 发请求获取关键字模糊匹配数据
    // http://localhost:3000/search?keywords=%E6%B5%B7%E9%98%94%E5%A4%A9%E7%A9%BA&limit=10
    let searchListData = await request('/search', {keywords: searchContent, limit: 10});//searchContent是用户输入的内容。limit是限制10条数量
    this.setData({//把数据更新到data中
      searchList: searchListData.result.songs
    })
    
    // 将搜索的关键字添加到搜索历史记录中
    if(historyList.indexOf(searchContent) !== -1){//说明之前有
      historyList.splice(historyList.indexOf(searchContent), 1)//(historyList.indexOf(searchContent)意思是如果有返回下标，如果没有就是-1
    }
    historyList.unshift(searchContent);//最新搜索的排序放到前面，所以用unshift
    this.setData({//这里存到data中写不写都行，因为应该要存到本地，防止一刷新数据就没有
      historyList
    })
    
    wx.setStorageSync('searchHistory', historyList)//把历史记录存到本地
  },
  // 清空搜索内容
  clearSearchContent(){
    this.setData({
      searchContent: '',
      searchList: []
    })
  },
  
  // 删除搜索历史记录
  deleteSearchHistory(){
    wx.showModal({//弹出一个框询问用户是否删除
      content: '确认删除吗?',
      success: (res) => {
        // console.log(res);
        if(res.confirm){
          // 清空data中historyList
          this.setData({
            historyList: []
          })
          // 移除本地的历史记录缓存
          wx.removeStorageSync('searchHistory');
        }
      }
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
