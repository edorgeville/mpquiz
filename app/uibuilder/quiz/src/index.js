/* jshint browser: true, esversion: 5, asi: true */
/* globals Vue, uibuilder */
// @ts-nocheck
'use strict'

/** @see https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Front-End-Library---available-properties-and-methods */

// eslint-disable-next-line no-unused-vars
var app1 = new Vue({
  el: '#app',
  data: {
    question: '',
    questionIndex: null,
    answer: 'radio1',
    prompts: [
      { text: 'Standby', value: 'Standby' },
      { text: 'Standby', value: 'Standby' },
      { text: 'Standby', value: 'Standby' },
      { text: 'Standby', value: 'Standby' }
    ],
    timeVariant: 'Standby',
    timeleft: 0,
    scores: {},
    banks: {},
    banksTableFields: [
      { key: 'user', sortable: true },
      { key: 'username', sortable: true },
      { key: 'coins', sortable: true },
      { key: 'stars', sortable: true }
    ],
    sortBy: 'stars',
    sortDesc: true,
    currentModifier: null,
    // currentModifier: { win: {}, lose: {} },
    username: '',
    sent: false,
    currentRightAnswer: null
  },
  computed: {
    canBuyStar: function () {
      return this.myCoins >= 100
    },
    myBank: function () {
      return this.banks[this.userId] || {}
    },
    myCoins: function () {
      return this.myBank.coins || 0
    },
    myStars: function () {
      return this.myBank.stars || 0
    },
    myScore: function () {
      return `💲 ${this.myCoins} ⭐ ${this.myStars}`
    },
    userId: function () {
      function makeId (length) {
        var result = ''
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        var charactersLength = characters.length
        for (var i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength))
        }
        return result
      }
      Vue.$cookies.config('1y')
      var userId = Vue.$cookies.get('userId')
      if (userId == null) {
        userId = makeId(4)
        Vue.$cookies.set('userId', userId)
      }
      return userId
    },
    scoresTable: function () {
      const scoresTable = []
      for (const [user, value] of Object.entries(this.scores)) {
        scoresTable.push({
          ...value,
          user: user
        })
      }
      return scoresTable
    },
    banksTable: function () {
      const banksTable = []
      for (const [user, value] of Object.entries(this.banks)) {
        banksTable.push({
          user: user,
          ...value
        })
      }
      return banksTable
    },
    disabled: function () {
      return this.sent || this.timeleft <= 0
    },
    sendButtonText: function () {
      if (this.sent) {
        return 'Sent ✔'
      } else {
        return 'Send'
      }
    }
  },
  methods: {
    send: function (msg) {
      uibuilder.send({
        ...msg,
        userId: this.userId
      })
    },
    sendAnswer: function (event) {
      console.log('Sending answer')
      this.send({
        topic: 'answer',
        payload: {
          questionIndex: this.questionIndex,
          answer: this.answer
        }
      })
      this.sent = true
    },
    refreshBanks: function (event) {
      console.log('Refreshing banks')
      this.send({
        topic: 'refreshBanks'
      })
    },
    buyStar: function (event) {
      console.log('Buying 1 star')
      this.send({
        topic: 'buyStars',
        payload: 1
      })
      this.$bvToast.toast(`You know have ${this.myStars + 1} stars`, {
        title: 'You bought a star!',
        autoHideDelay: 5000,
        variant: 'success'
      })
    },
    rowClass: function (item, type) {
      if (!item || type !== 'row') return
      if (item.user === this.userId) return 'table-success'
    }
  },

  // Available hooks: init,mounted,updated,destroyed
  mounted: function () {
    // console.debug('[indexjs:Vue.mounted] app mounted - setting up uibuilder watchers')

    /** **REQUIRED** Start uibuilder comms with Node-RED @since v2.0.0-dev3
         * Pass the namespace and ioPath variables if hosting page is not in the instance root folder
         * The namespace is the "url" you put in uibuilder's configuration in the Editor.
         * e.g. If you get continual `uibuilderfe:ioSetup: SOCKET CONNECT ERROR` error messages.
         * e.g. uibuilder.start('uib', '/nr/uibuilder/vendor/socket.io') // change to use your paths/names
         */
    uibuilder.start()

    var vueApp = this

    // Example of retrieving data from uibuilder
    vueApp.feVersion = uibuilder.get('version')

    /** You can use the following to help trace how messages flow back and forth.
         * You can then amend this processing to suite your requirements.
         */

    // #region ---- Trace Received Messages ---- //
    // If msg changes - msg is updated when a standard msg is received from Node-RED over Socket.IO
    // newVal relates to the attribute being listened to.
    uibuilder.onChange('msg', function (msg) {
      // console.info('[indexjs:uibuilder.onChange] msg received from Node-RED server:', newVal)
      vueApp.msgRecvd = msg
      if (msg.topic === 'question') {
        vueApp.answer = null
        vueApp.question = msg.payload.question
        vueApp.questionIndex = msg.payload.index
        vueApp.prompts = msg.payload.prompts
        vueApp.sent = false
        vueApp.currentRightAnswer = null
      }
      if (msg.topic === 'timeleft') {
        vueApp.timeleft = msg.payload
      }
      if (msg.topic === 'timeVariant') {
        vueApp.timeVariant = msg.payload
      }
      if (msg.topic === 'scores') {
        vueApp.scores = msg.payload
      }
      if (msg.topic === 'banks') {
        vueApp.banks = msg.payload
      }
      if (msg.topic === 'currentModifier') {
        vueApp.currentModifier = msg.payload
      }
      if (msg.topic === 'currentRightAnswer') {
        vueApp.currentRightAnswer = msg.payload
      }
    })

    // If Socket.IO connects/disconnects, we get true/false here
    uibuilder.onChange('ioConnected', function (newVal) {
      // console.info('[indexjs:uibuilder.onChange:ioConnected] Socket.IO Connection Status Changed to:', newVal)
      vueApp.socketConnectedState = newVal
      uibuilder.send({
        userId: vueApp.userId,
        payload: {}
      })
      vueApp.refreshBanks()
    })
    // If Server Time Offset changes
    uibuilder.onChange('serverTimeOffset', function (newVal) {
      // console.info('[indexjs:uibuilder.onChange:serverTimeOffset] Offset of time between the browser and the server has changed to:', newVal)
      vueApp.serverTimeOffset = newVal
    })
  },

  watch: {
    username: function (newValue, oldValue) {
      this.send({
        topic: 'username',
        payload: newValue
      })
    },
    myScore: function (newValue, oldValue) {
      document.title = newValue
    }
  }
})
