// 恐怖故事数据
const stories = {
  haunted_house: [
    {
      title: "废弃的豪宅",
      content: "深夜，你独自站在一座废弃的豪宅前。传闻这里曾经发生过灭门惨案，每到午夜时分，总能听到女人的哭声和孩子的笑声。\n\n月光透过破碎的窗户洒在地上，形成诡异的光斑。你深吸一口气，推开了那扇吱呀作响的大门...",
      choices: [
        { text: "进入大厅查看", hint: "继续探索", next: 1 },
        { text: "转身离开", hint: "结束探险", next: -1, ending: 'coward' }
      ]
    },
    {
      title: "诡异的大厅",
      content: "大厅里弥漫着一股腐臭的味道。墙上挂着的画像似乎都在盯着你看，画中人的眼睛随着你的移动而转动。\n\n突然，楼上传来一阵脚步声...咚...咚...咚...\n\n声音越来越近，仿佛有什么东西正在下楼。",
      choices: [
        { text: "躲进旁边的房间", hint: "隐藏自己", next: 2 },
        { text: "大声询问是谁", hint: "直面未知", next: 3 },
        { text: "冲向大门逃跑", hint: "逃离此地", next: 4 }
      ]
    },
    {
      title: "狭小的储藏室",
      content: "你躲进了一个狭小的储藏室，透过门缝向外窥视。\n\n一个穿着白色连衣裙的女人缓缓走下楼梯，她的脚...没有着地！\n\n女人停在大厅中央，缓缓转过头，看向你藏身的方向...\n\n她发现你了！",
      scare: true,
      choices: [
        { text: "屏住呼吸", hint: "赌一把", next: 5 },
        { text: "尖叫逃跑", hint: "惊慌失措", next: 6 }
      ]
    },
    {
      title: "错误的决定",
      content: "\"谁在那里？\"你大声问道。\n\n脚步声戛然而止。\n\n下一秒，一张惨白的脸出现在你面前，距离你的脸只有几厘米...\n\n\"你...看到...我...了...吗？\"她的声音像是从地狱传来。",
      scare: true,
      choices: [
        { text: "闭上眼睛", hint: "逃避现实", next: 7 },
        { text: "推开她逃跑", hint: "奋力一搏", next: 8 }
      ]
    },
    {
      title: "无法逃脱",
      content: "你冲向大门，却发现门已经被锁死了！\n\n无论你怎么用力，大门都纹丝不动。\n\n身后的脚步声越来越近...\n\n一只冰冷的手搭在了你的肩膀上...",
      scare: true,
      ending: 'death',
      choices: []
    },
    {
      title: "侥幸逃脱",
      content: "你屏住呼吸，心跳声在耳边如雷贯耳。\n\n女人在门口停留了几秒，然后缓缓转身离开了。\n\n等她走远后，你从另一个出口逃出了豪宅。\n\n但你总觉得，有什么东西跟着你回家了...",
      ending: 'escape',
      choices: []
    },
    {
      title: "恐慌的代价",
      content: "你尖叫着冲了出去，却撞上了那个女人！\n\n她的脸近在咫尺，眼眶里没有眼珠，只有两个黑洞...\n\n\"为什么要...逃跑...\"\",
      scare: true,
      ending: 'death',
      choices: []
    },
    {
      title: "无尽的黑暗",
      content: "你闭上眼睛，祈祷这一切都是梦。\n\n但你能感觉到，有什么东西在靠近...\n\n冰冷的呼吸喷在你的脸上...\n\n当你再次睁开眼睛时，发现自己已经永远留在了这座豪宅里...",
      scare: true,
      ending: 'death',
      choices: []
    },
    {
      title: "徒劳的挣扎",
      content: "你试图推开她，但手穿过了她的身体！\n\n她咯咯地笑了起来：\"你以为...能逃得掉吗？\"\n\n周围的空间开始扭曲，你发现自己被困在了一个无限循环的噩梦中...",
      scare: true,
      ending: 'nightmare',
      choices: []
    }
  ]
}

Page({
  data: {
    currentChapterIndex: 0,
    currentChapter: null,
    displayedText: '',
    isTyping: false,
    choices: [],
    hasNextChapter: false,
    progress: 0,
    showJumpScare: false,
    scareMessage: '',
    storyKey: 'haunted_house'
  },

  onLoad() {
    this.loadChapter(0)
  },

  loadChapter(index) {
    const story = stories[this.data.storyKey]
    if (index < 0 || index >= story.length) {
      this.showEnding()
      return
    }

    const chapter = story[index]
    
    this.setData({
      currentChapterIndex: index,
      currentChapter: chapter,
      displayedText: '',
      isTyping: true,
      choices: [],
      hasNextChapter: false,
      progress: ((index + 1) / story.length) * 100
    })

    // 打字机效果
    this.typeWriterEffect(chapter.content)

    // 如果有惊吓效果，延迟触发
    if (chapter.scare) {
      setTimeout(() => {
        this.triggerJumpScare()
      }, chapter.content.length * 50 + 1000)
    }
  },

  typeWriterEffect(text) {
    let index = 0
    const interval = setInterval(() => {
      if (index < text.length) {
        this.setData({
          displayedText: text.substring(0, index + 1)
        })
        index++
        
        // 随机停顿增加恐怖感
        if (Math.random() > 0.95) {
          clearInterval(interval)
          setTimeout(() => {
            this.typeWriterEffectContinued(text, index, interval)
          }, 200)
          return
        }
      } else {
        clearInterval(interval)
        this.setData({ 
          isTyping: false,
          choices: this.data.currentChapter.choices || []
        })
        
        // 检查是否有下一章
        if (this.data.currentChapter.choices && this.data.currentChapter.choices.length > 0) {
          const hasValidNext = this.data.currentChapter.choices.some(c => c.next && c.next > 0)
          this.setData({ hasNextChapter: hasValidNext })
        }
      }
    }, 50)
  },

  typeWriterEffectContinued(text, startIndex, oldInterval) {
    let index = startIndex
    const interval = setInterval(() => {
      if (index < text.length) {
        this.setData({
          displayedText: text.substring(0, index + 1)
        })
        index++
      } else {
        clearInterval(interval)
        this.setData({ 
          isTyping: false,
          choices: this.data.currentChapter.choices || []
        })
      }
    }, 50)
  },

  triggerJumpScare() {
    const scares = ['它在这里！', '快跑！', '看着你...', '逃不掉的', '找到你了']
    const randomScare = scares[Math.floor(Math.random() * scares.length)]
    
    this.setData({
      showJumpScare: true,
      scareMessage: randomScare
    })

    wx.vibrateLong()

    setTimeout(() => {
      this.setData({
        showJumpScare: false
      })
    }, 1500)
  },

  selectChoice(e) {
    if (this.data.isTyping) return
    
    const index = e.currentTarget.dataset.index
    const choice = this.data.choices[index]
    
    if (choice.disabled) return

    if (choice.next === -1) {
      this.showEnding(choice.ending)
    } else if (choice.next >= 0) {
      this.loadChapter(choice.next)
    }
  },

  nextChapter() {
    if (this.data.isTyping) return
    
    // 寻找第一个有效的下一个章节
    const story = stories[this.data.storyKey]
    const currentChoices = story[this.data.currentChapterIndex].choices
    
    if (currentChoices && currentChoices.length > 0) {
      const validChoice = currentChoices.find(c => c.next && c.next > 0)
      if (validChoice) {
        this.loadChapter(validChoice.next)
      }
    }
  },

  showEnding(endingType) {
    const endings = {
      coward: {
        title: '懦弱的逃脱',
        message: '你选择了逃离，活了下来，但每当夜深人静时，你总会想起那座豪宅...'
      },
      death: {
        title: '死亡结局',
        message: '你成为了这座豪宅的新居民，永远无法离开...'
      },
      escape: {
        title: '一线生机',
        message: '你成功逃脱了，但真的结束了吗？'
      },
      nightmare: {
        title: '无尽噩梦',
        message: '你陷入了永恒的噩梦，再也无法醒来...'
      }
    }

    const ending = endings[endingType] || endings.death

    wx.showModal({
      title: ending.title,
      content: ending.message,
      showCancel: false,
      confirmText: '重新开始',
      success: () => {
        this.loadChapter(0)
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '你敢挑战这个恐怖故事吗？',
      path: '/pages/story/story'
    }
  }
})
