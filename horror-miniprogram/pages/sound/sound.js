const app = getApp()

Page({
  data: {
    mode: 'list', // 'list' or 'breath'
    playingSound: null,
    volume: 70,
    randomPlay: false,
    isListening: false,
    breathStatus: '准备就绪',
    showBreathWarning: false,
    audioContext: null,
    recorderManager: null,
    randomTimer: null
  },

  onLoad(options) {
    if (options.mode === 'breath') {
      this.setData({ mode: 'breath' })
      this.startBreathDetection()
    }
    
    this.initAudio()
  },

  initAudio() {
    // 创建音频上下文
    this.data.audioContext = wx.createInnerAudioContext()
    this.data.audioContext.volume = this.data.volume / 100
  },

  startBreathDetection() {
    this.setData({ isListening: true, breathStatus: '正在监听...' })

    // 获取录音管理器
    this.data.recorderManager = wx.getRecorderManager()

    this.data.recorderManager.onStart(() => {
      console.log('录音开始')
    })

    this.data.recorderManager.onStop(() => {
      console.log('录音停止')
    })

    this.data.recorderManager.onError((err) => {
      console.error('录音错误', err)
      this.setData({ 
        isListening: false,
        breathStatus: '录音失败'
      })
    })

    // 开始录音
    this.data.recorderManager.start({
      duration: 10000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'wav'
    })

    // 模拟呼吸检测
    this.simulateBreathAnalysis()
  },

  simulateBreathAnalysis() {
    // 模拟分析呼吸频率
    let breathCount = 0
    const interval = setInterval(() => {
      if (!this.data.isListening) {
        clearInterval(interval)
        return
      }

      breathCount++
      
      // 随机触发呼吸警告
      if (Math.random() > 0.7 && breathCount > 3) {
        this.triggerBreathWarning()
      }

      // 更新状态文本
      const statuses = ['正常', '稍快', '保持平静', '听到了...', '别紧张']
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
      this.setData({ breathStatus: `呼吸状态：${randomStatus}` })

    }, 2000)
  },

  triggerBreathWarning() {
    this.setData({ showBreathWarning: true })

    wx.vibrateLong()

    setTimeout(() => {
      this.setData({ showBreathWarning: false })
    }, 3000)
  },

  playSound(e) {
    const soundType = e.currentTarget.dataset.sound
    
    if (this.data.playingSound === soundType) {
      // 如果正在播放，则停止
      this.stopSound()
      return
    }

    this.stopSound()
    this.setData({ playingSound: soundType })

    // 播放对应音效（实际项目中需要添加真实音频文件）
    this.playHorrorSound(soundType)
  },

  playHorrorSound(soundType) {
    const sounds = {
      rain: { duration: 0, loop: true },
      wind: { duration: 0, loop: true },
      creak: { duration: 3000, loop: false },
      whisper: { duration: 5000, loop: false },
      laugh: { duration: 2000, loop: false },
      scream: { duration: 1000, loop: false },
      jumpscare: { duration: 500, loop: false }
    }

    const soundConfig = sounds[soundType]
    
    // 震动反馈
    if (soundType === 'jumpscare' || soundType === 'scream') {
      wx.vibrateLong()
    }

    // 如果是循环音效
    if (soundConfig.loop) {
      this.data.audioContext.loop = true
      // 这里应该设置真实的音频文件路径
      // this.data.audioContext.src = `/audio/${soundType}.mp3`
    } else {
      this.data.audioContext.loop = false
      // this.data.audioContext.src = `/audio/${soundType}.mp3`
      
      // 定时停止
      setTimeout(() => {
        if (this.data.playingSound === soundType) {
          this.stopSound()
        }
      }, soundConfig.duration)
    }

    // 惊吓音效特殊处理
    if (soundType === 'jumpscare') {
      this.triggerJumpScareEffect()
    }
  },

  triggerJumpScareEffect() {
    // 屏幕闪烁效果
    const originalBg = wx.getSystemInfoSync().backgroundColor
    let flashCount = 0
    
    const flashInterval = setInterval(() => {
      flashCount++
      if (flashCount > 5) {
        clearInterval(flashInterval)
        return
      }
      
      // 这里可以通过页面事件触发 UI 变化
      wx.setNavigationBarColor({
        frontColor: flashCount % 2 === 0 ? '#ffffff' : '#ff0000',
        backgroundColor: flashCount % 2 === 0 ? '#000000' : '#8b0000'
      })
    }, 100)
  },

  stopSound() {
    if (this.data.audioContext) {
      this.data.audioContext.stop()
    }
    this.setData({ playingSound: null })
  },

  onVolumeChange(e) {
    const volume = e.detail.value
    this.setData({ volume })
    
    if (this.data.audioContext) {
      this.data.audioContext.volume = volume / 100
    }
  },

  toggleRandomPlay() {
    const randomPlay = !this.data.randomPlay
    this.setData({ randomPlay })

    if (randomPlay) {
      this.startRandomPlayback()
    } else {
      this.stopRandomPlayback()
    }
  },

  startRandomPlayback() {
    const sounds = ['rain', 'wind', 'creak', 'whisper', 'laugh']
    
    const playNext = () => {
      if (!this.data.randomPlay) return
      
      const randomSound = sounds[Math.floor(Math.random() * sounds.length)]
      this.setData({ playingSound: randomSound })
      this.playHorrorSound(randomSound)
      
      // 随机间隔 5-15 秒后播放下一个
      const nextDelay = Math.random() * 10000 + 5000
      this.data.randomTimer = setTimeout(playNext, nextDelay)
    }

    playNext()
  },

  stopRandomPlayback() {
    if (this.data.randomTimer) {
      clearTimeout(this.data.randomTimer)
      this.data.randomTimer = null
    }
    this.stopSound()
  },

  goBack() {
    // 停止所有音频和录音
    this.stopSound()
    this.stopRandomPlayback()
    
    if (this.data.recorderManager) {
      this.data.recorderManager.stop()
    }

    wx.navigateBack()
  },

  onUnload() {
    this.goBack()
    
    if (this.data.audioContext) {
      this.data.audioContext.destroy()
    }
  }
})
