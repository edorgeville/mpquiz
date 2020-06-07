/* jshint browser: true, esversion: 5, asi: true */
/* globals Vue, uibuilder */
// @ts-nocheck
'use strict'

/** @see https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Front-End-Library---available-properties-and-methods */

// eslint-disable-next-line no-unused-vars
var app1 = new Vue({
  el: '#app',
  data: {
    question: 'No question yet',
    questionIndex: null,
    answer: 'radio1',
    prompts: [
      // { text: 'Radio 1', value: 'radio1' },
      // { text: 'Radio 2', value: 'radio2' },
      // { text: 'Radio 3 (disabled)', value: 'radio3', disabled: true },
      // { text: 'Radio 4', value: 'radio4' }
    ],
    timeMessage: 'Standby',
    timeleft: 0,
    scores: {}
  },
  computed: {
    questionLabel: function () {
      return `Question ${this.questionIndex}: ${this.question}`
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
      Object.entries(this.scores)
      return scoresTable
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
      }
      if (msg.topic === 'timeleft') {
        vueApp.timeleft = msg.payload
      }
      if (msg.topic === 'timeMessage') {
        vueApp.timeMessage = msg.payload
      }
      if (msg.topic === 'scores') {
        vueApp.scores = msg.payload
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
    })
    // If Server Time Offset changes
    uibuilder.onChange('serverTimeOffset', function (newVal) {
      // console.info('[indexjs:uibuilder.onChange:serverTimeOffset] Offset of time between the browser and the server has changed to:', newVal)
      vueApp.serverTimeOffset = newVal
    })
  }
})
