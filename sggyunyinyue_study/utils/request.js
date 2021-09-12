
//发送ajax请求
/**
 *  一. 封装功能函数
*   1. 功能点明确
*   2. 函数内部应该保留固定代码(静态的)
*   3. 将动态的数据抽取成形参，由使用者根据自身的情况动态的传入实参
*   4. 一个良好的功能函数应该设置形参的默认值(ES6的形参默认值)
*   二. 封装功能组件
*   1. 功能点明确
*   2. 组件内部保留静态的代码
*   3. 将动态的数据抽取成props参数，由使用者根据自身的情况以标签属性的形式动态传入props数据
*   4. 一个良好的组件应该设置组件的必要性及数据类型
*     props: {
*       msg: {
*         required: true,
*         default: 默认值，
*         type: String
*       }
*     }
 */
import config from './config'
 export default (url,data={},method='GET') => {//因为动态的东西需要抽取成参数，所以这里写url,data。抽取出来后下面只写url和data即可，后面不需要跟内容
    return new Promise((resolve,reject) => {//返回Promise实例
        // 从26行开始为异步任务，异步任务的特点是非阻塞，异步任务一开，请求还没有成功就立即执行return result，因为不阻塞，这时返回的始终是result
        // 1. new Promise初始化promise实例的状态为pending
        wx.request({//发起 HTTPS 网络请求
            // url: 'http://localhost:3000' + url,//因为这部分url是固定的，所以这样写.这样写不好，如果端口等地方改动，又要在这里改，所以用下一行的代码做
            url: config.host + url,
            // url: config.mobileHost + url,//如果改为真机调试就需要这样改
            data,
            method,//封装的函数既要能发get请求，也能发post请求,所以method也要写成动态的

            // 在发请求的时候需要设置请求头，因为要携带cookie
            header: {
              // cookie: wx.getStorageSync('cookies')[0]//用getStorageSync是用了同步，同步才往下解析，保证不出问题//因为cookie存入的时候是一个对象，所以这里读取的也是对象，是数组
              // 如果indexOf没有解析到这个MUSIC__U字符串，就返回-1，-1转为布尔值也为true，所以就把cookie数组的第一个值拿到了，所以需要判断不等于-1
              //用户在未登录的情况下，cookie为空。wx.getStorageSync('cookies')保证cookies不为空
              // cookies: wx.getStorageSync('cookies')?wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC__U') !== -1): ''//返回指定值的下标
              cookie: wx.getStorageSync('cookies')?wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1):''
            },

            success: (res) => {
              console.log(res);
              if(data.isLogin){//如果isLogin为true，说明为登录请求.
                //将用户的cookie存入至本地
                wx.setStorage({
                  key: 'cookies',
                  data: res.cookies//这里存入的是对象，是数组
                })
              }

            //   console.log('请求成功：', res);
              resolve(res.data);// resolve修改promise的状态为成功状态resolved//其他的数据不用，只把data数据过滤出来
            },
            fail: (err) => {
            //   console.log('请求失败：',err);
              reject(err);// reject修改promise的状态为失败状态 rejected
            }
          })
    })
 }