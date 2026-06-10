const app = getApp()

Page({
  data: {
    showWarning: true,
    currentTime: '',
    showScare: false,
    scareTimer: null
  },

  onLoad() {
    this.updateTime()
    this.scheduleRandomScare()
  },

  onShow() {
    this.updateTime()
    // 重置惊吓计时器
    if (this.data.scareTimer) {
      clearTimeout(this.data.scareTimer)
    }
    this.scheduleRandomScare()
  },

  onHide() {
    if (this.data.scareTimer) {
      clearTimeout(this.data.scareTimer)
    }
  },

  updateTime() {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    this.setData({
      currentTime: `当前时间：${hours}:${minutes}`
    })
  },

  scheduleRandomScare() {
    // 随机在 30-120 秒后触发惊吓
    const randomTime = Math.random() * 90000 + 30000
    this.data.scareTimer = setTimeout(() => {
      this.triggerScare()
    }, randomTime)
  },

  triggerScare() {
    // 只在小程序在前台时触发
    if (this.data.showScare) return
    
    this.setData({ showScare: true })
    
    // 播放惊吓音效
    this.playScareSound()
    
    // 震动反馈
    wx.vibrateLong({
      type: 'heavy'
    })

    // 200ms 后关闭
    setTimeout(() => {
      this.setData({ showScare: false })
      // 重新安排下一次惊吓
      this.scheduleRandomScare()
    }, 200)
  },

  playScareSound() {
    // 创建音频上下文
    const audioContext = wx.createInnerAudioContext()
    audioContext.src = '' // 可以添加实际的惊吓音效文件
    audioContext.play()
  },

  hideScare() {
    this.setData({ showScare: false })
  },

  goToStory() {
    wx.navigateTo({
      url: '/pages/story/story'
    })
  },

  goToSound() {
    wx.navigateTo({
      url: '/pages/sound/sound'
    })
  },

  goToFlashlight() {
    wx.navigateTo({
      url: '/pages/flashlight/flashlight'
    })
  },

  startBreathTest() {
    wx.showModal({
      title: '呼吸检测',
      content: '此功能需要麦克风权限来检测您的呼吸声。\n\n请确保周围环境安静，将手机靠近嘴边。\n\n您准备好了吗？',
      confirmText: '开始',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.requestMicrophonePermission()
        }
      }
    })
  },

  requestMicrophonePermission() {
    wx.authorize({
      scope: 'scope.record',
      success: () => {
        wx.navigateTo({
          url: '/pages/sound/sound?mode=breath'
        })
      },
      fail: () => {
        wx.showModal({
          title: '权限被拒绝',
          content: '需要麦克风权限才能进行呼吸检测',
          showCancel: false
        })
      }
    })
  },

  onUnload() {
    if (this.data.scareTimer) {
      clearTimeout(this.data.scareTimer)
    }
  }
})
