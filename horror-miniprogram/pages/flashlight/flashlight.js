const app = getApp()

Page({
  data: {
    gameStarted: false,
    lightX: 0,
    lightY: 0,
    itemX: 0,
    itemY: 0,
    currentItem: { icon: '', text: '' },
    isRevealed: false,
    showScareElement: false,
    scareX: 0,
    scareY: 0,
    scareIcon: '👻',
    hintText: '在黑暗中寻找线索...',
    batteryLevel: 100,
    foundItems: [],
    scareTimer: null,
    batteryTimer: null
  },

  onLoad() {
    this.getSystemInfo()
  },

  getSystemInfo() {
    const systemInfo = wx.getSystemInfoSync()
    this.setData({
      lightX: systemInfo.windowWidth / 2,
      lightY: systemInfo.windowHeight / 2
    })
  },

  startGame() {
    this.setData({ 
      gameStarted: true,
      batteryLevel: 100
    })
    
    this.placeRandomItem()
    this.startBatteryDrain()
    this.scheduleRandomScare()
  },

  onTouchMove(e) {
    if (!this.data.gameStarted) return
    
    const touch = e.touches[0]
    this.setData({
      lightX: touch.clientX,
      lightY: touch.clientY
    })

    // 检查是否照到物品
    this.checkItemReveal(touch.clientX, touch.clientY)
  },

  placeRandomItem() {
    const systemInfo = wx.getSystemInfoSync()
    const padding = 100
    
    const itemX = Math.random() * (systemInfo.windowWidth - padding * 2) + padding
    const itemY = Math.random() * (systemInfo.windowHeight - padding * 2) + padding

    const items = [
      { icon: '🗝️', text: '古老的钥匙' },
      { icon: '📜', text: '泛黄的信纸' },
      { icon: '💀', text: '人类头骨' },
      { icon: '🕯️', text: '熄灭的蜡烛' },
      { icon: '🩸', text: '血迹斑斑的布' },
      { icon: '📷', text: '老式相机' },
      { icon: '🎭', text: '破碎的面具' },
      { icon: '⚰️', text: '迷你棺材' }
    ]

    const randomItem = items[Math.floor(Math.random() * items.length)]

    this.setData({
      itemX,
      itemY,
      currentItem: randomItem,
      isRevealed: false
    })
  },

  checkItemReveal(lightX, lightY) {
    const { itemX, itemY, isRevealed } = this.data
    const revealDistance = 150 // 揭示距离（像素）

    const distance = Math.sqrt(
      Math.pow(lightX - itemX, 2) + Math.pow(lightY - itemY, 2)
    )

    if (distance < revealDistance && !isRevealed) {
      this.revealItem()
    }
  },

  revealItem() {
    this.setData({ isRevealed: true })
    
    wx.vibrateShort({
      type: 'medium'
    })

    // 添加到已发现列表
    const foundItems = [...this.data.foundItems, this.data.currentItem]
    this.setData({ foundItems })

    // 更新提示
    const hints = [
      '继续探索...',
      '还有更多东西...',
      '别停下来...',
      '它在看你...',
      '快离开这里...'
    ]
    const randomHint = hints[Math.floor(Math.random() * hints.length)]
    this.setData({ hintText: randomHint })

    // 2 秒后放置新物品
    setTimeout(() => {
      if (this.data.gameStarted) {
        this.placeRandomItem()
      }
    }, 2000)
  },

  scheduleRandomScare() {
    // 随机在 10-30 秒后触发惊吓
    const randomTime = Math.random() * 20000 + 10000
    
    this.data.scareTimer = setTimeout(() => {
      this.triggerScare()
    }, randomTime)
  },

  triggerScare() {
    if (!this.data.gameStarted) return

    const systemInfo = wx.getSystemInfoSync()
    const scareIcons = ['👻', '💀', '😱', '👹', '🤡', '🧟']
    const randomIcon = scareIcons[Math.floor(Math.random() * scareIcons.length)]
    
    // 随机位置，但远离手电筒光束
    let scareX, scareY
    let tooClose = true
    
    while (tooClose) {
      scareX = Math.random() * systemInfo.windowWidth
      scareY = Math.random() * systemInfo.windowHeight
      
      const distance = Math.sqrt(
        Math.pow(scareX - this.data.lightX, 2) + Math.pow(scareY - this.data.lightY, 2)
      )
      
      if (distance > 200) {
        tooClose = false
      }
    }

    this.setData({
      showScareElement: true,
      scareX,
      scareY,
      scareIcon: randomIcon
    })

    wx.vibrateLong()

    // 0.5 秒后消失
    setTimeout(() => {
      this.setData({
        showScareElement: false
      })
      
      // 重新安排惊吓
      this.scheduleRandomScare()
    }, 500)
  },

  startBatteryDrain() {
    this.data.batteryTimer = setInterval(() => {
      if (!this.data.gameStarted) return
      
      const currentBattery = this.data.batteryLevel
      const drainRate = Math.random() * 2 + 0.5 // 随机消耗速度
      
      const newBattery = Math.max(0, currentBattery - drainRate)
      
      this.setData({
        batteryLevel: Math.floor(newBattery)
      })

      // 低电量警告
      if (newBattery < 20 && newBattery > 15) {
        this.setData({
          hintText: '⚠️ 手电筒电量不足！'
        })
        wx.vibrateShort({ type: 'heavy' })
      }

      // 电量耗尽
      if (newBattery <= 0) {
        this.gameOver('battery')
      }
    }, 1000)
  },

  gameOver(reason) {
    this.setData({ gameStarted: false })
    
    clearInterval(this.data.batteryTimer)
    clearTimeout(this.data.scareTimer)

    const endings = {
      battery: {
        title: '黑暗降临',
        message: `你的手电筒熄灭了...\n\n在完全陷入黑暗之前，你听到了脚步声...\n\n找到了 ${this.data.foundItems.length} 个物品`
      },
      scared: {
        title: '被吓跑了',
        message: '你被吓得丢下手电筒逃跑了...\n\n但总觉得有什么东西跟着你...\n\n找到了 ${this.data.foundItems.length} 个物品'
      }
    }

    const ending = endings[reason] || endings.battery

    wx.showModal({
      title: ending.title,
      content: ending.message,
      showCancel: false,
      confirmText: '再玩一次',
      success: () => {
        this.resetGame()
      }
    })
  },

  resetGame() {
    this.setData({
      gameStarted: false,
      batteryLevel: 100,
      foundItems: [],
      isRevealed: false,
      showScareElement: false,
      hintText: '在黑暗中寻找线索...',
      currentItem: { icon: '', text: '' }
    })

    clearInterval(this.data.batteryTimer)
    clearTimeout(this.data.scareTimer)
  },

  onUnload() {
    this.resetGame()
  },

  onShareAppMessage() {
    return {
      title: '你敢在黑暗中待多久？',
      path: '/pages/flashlight/flashlight'
    }
  }
})
