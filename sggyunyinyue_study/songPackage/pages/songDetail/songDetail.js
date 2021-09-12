import PubSub from 'pubsub-js';
import moment from 'moment'
import request from '../../../utils/request'
// 获取全局实例
const appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false, // 音乐是否播放。通过这个标识可以决定摇杆是抬起还是落下
    song: {}, // 歌曲详情对象
    musicId: '', // 音乐id
    musicLink: '', // 音乐的链接
    currentTime: '00:00',  // 实时时间
    durationTime: '00:00', // 总时长
    currentWidth: 0, // 实时进度条的宽度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // options: 用于接收路由跳转的query参数
    // 下面查看传的json数据。可以看到只传了一部分，剩下的被截取了
    // console.log(typeof options.song);
    // console.log(options.song);
    // console.log(JSON.parse(options.song));//这里转不成完整的json对象，因为options少东西
    // 原生小程序中路由传参，对参数的长度有限制，如果参数长度过长会自动截取掉
    // console.log(JSON.parse(options.songPackage));
    
    let musicId = options.musicId;
    // 测试是否正确
    console.log(options);
    console.log(musicId);
    this.setData({
      musicId
    })
    // 获取音乐详情
    this.getMusicInfo(musicId);
    
    
    /*
    * 问题： 如果用户操作系统的控制音乐播放/暂停的按钮，页面不知道，导致页面显示是否播放的状态和真实的音乐播放状态不一致
    * 解决方案：
    *   1. 通过控制音频的实例 backgroundAudioManager 去监视音乐播放/暂停
    *
    * */
    
    // 判断当前页面音乐是否在播放
    // appInstance.globalData.isMusicPlay只能判断是否有音乐在播放
    // appInstance.globalData.musicId === musicId表示如果之前存进去的音乐id与当前页面的id一样，就表示有音乐在播放。
    if(appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId){
      // 修改当前页面音乐播放状态为true
      this.setData({
        isPlay: true//这是显示给用户看的
      })
    }
  
    // 注意：这里的所有backgroundAudioManager通过this访问，这是为了让其他函数里面都能使用到
    // 创建控制音乐播放的实例
    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    // 监视音乐播放/暂停/停止
    this.backgroundAudioManager.onPlay(() => {
      this.changePlayState(true);//调用下面封装的方法
      // 修改全局音乐播放的状态
      appInstance.globalData.musicId = musicId;
    });
    this.backgroundAudioManager.onPause(() => {
      this.changePlayState(false);
    });
    this.backgroundAudioManager.onStop(() => {
      this.changePlayState(false);
    });
    
    // 监听音乐播放自然结束
    this.backgroundAudioManager.onEnded(() => {
      // 自动切换至下一首音乐，并且自动播放。切换歌曲只需要发一个消息即可
      PubSub.publish('switchType', 'next')//切换下一首这个type就是next了
      // 将实时进度条的长度还原成 0；时间还原成 0；
      this.setData({
        currentWidth: 0,
        currentTime: '00:00'
      })
    });
    
    // 监听音乐实时播放的进度
    this.backgroundAudioManager.onTimeUpdate(() => {
      // console.log('总时长: ', this.backgroundAudioManager.duration);
      // console.log('实时的时长: ', this.backgroundAudioManager.currentTime);
      // 格式化实时的播放时间
      let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')//乘以1000转换为毫秒
      let currentWidth = this.backgroundAudioManager.currentTime/this.backgroundAudioManager.duration * 450;//在总进度条的样式中设置450
      this.setData({
        currentTime,//更新到data中，才能在页面显示出来
        currentWidth
      })
      
    })
  },
  // 修改播放状态的功能函数
  changePlayState(isPlay){//你isPlay是false还是true要告诉我，所以这里写isplay
    // 修改音乐是否的状态
    this.setData({
      isPlay
    })
  
    // 修改全局音乐播放的状态
    appInstance.globalData.isMusicPlay = isPlay;
  },
  // 获取音乐详情的功能函数
  async getMusicInfo(musicId){
    // http://localhost:3000/song/detail?ids=1338695683
    let songData = await request('/song/detail', {ids: musicId});
    // songData.songs[0].dt 单位ms
    let durationTime = moment(songData.songs[0].dt).format('mm:ss');//mm:ss就是指定的输出格式
    this.setData({
      song: songData.songs[0],
      durationTime
    })
    
    // 动态修改窗口标题(动态显示当前歌手名称)
    wx.setNavigationBarTitle({
      title: this.data.song.name
    })
  },
  // 点击播放/暂停的回调
  handleMusicPlay(){
    let isPlay = !this.data.isPlay;//一上来就拿到取反的状态
    // // 修改是否播放的状态
    // 下面的不要了，因为上面就修改了
    // this.setData({
    //   isPlay
    // })
    
    let {musicId, musicLink} = this.data;//从data中拿musicId和musicLink
    this.musicControl(isPlay, musicId, musicLink);//把musicId传进去
  },
  
  // 控制音乐播放/暂停的功能函数
  async musicControl(isPlay, musicId, musicLink){
    if(isPlay){ // 音乐播放
      if(!musicLink){//优化：如果有之前的音乐链接，就不需要再发请求。如果你给我音乐链接，就不发请求，如果不给就发请求
        // 获取音乐播放链接
        // http://localhost:3000/song/url?id=33894312
        let musicLinkData = await request('/song/url', {id: musicId});
        musicLink = musicLinkData.data[0].url;
        
        this.setData({//拿到链接后更新到data中
          musicLink
        })
      }
      this.backgroundAudioManager.src = musicLink;//音乐链接
      this.backgroundAudioManager.title = this.data.song.name;//音乐标题，通常是当前歌曲的名称
    }else { // 暂停音乐
      this.backgroundAudioManager.pause();
    }
    
  },
  
  // 点击切歌的回调
  handleSwitch(event){
    // 获取切歌的类型
    let type = event.currentTarget.id;
    console.log(type);

    // 关闭当前播放的音乐
    this.backgroundAudioManager.stop();
    // // 订阅来自recommendSong页面发布的musicId消息
    PubSub.subscribe('musicId', (msg, musicId) => {
      // console.log(musicId);
      
      // 获取音乐详情信息
      this.getMusicInfo(musicId);
      // 自动播放当前的音乐
      this.musicControl(true, musicId);
      // 取消订阅
      PubSub.unsubscribe('musicId');
    })
    // 发布消息数据给recommendSong页面
    PubSub.publish('switchType', type)
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
