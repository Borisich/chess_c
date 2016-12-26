
var React = require('react');
var socket = require('../../services/socket.js');
var soundManager = require('../../sounds/sounds.js');

var StatusBar = require('./StatusBar.jsx');

var GameField = React.createClass({
    getInitialState: function(){
        return {
            shown: false,
            fieldState: ["empty","empty","empty","empty","empty","empty","empty","empty","empty"],
            myTurn: false,
            myNumber: 1,
            statusText: "",
            connectionText: "",
            buttonsDescriptionText: "",
            statusButton1: {
              disabled: true,
              visible: false,
              text: "",
              onClick: function(){}
            },
            statusButton2: {
              disabled: true,
              visible: false,
              text: "",
              onClick: function(){}
            },
        };
    },

    componentDidMount: function () {
        var self = this;
        self.addGameStatusListener();
        socket.on('opponent status', function (data) {
          console.log("opponentOffline: " + data.opponentOffline);
          data.opponentOffline ? self.setState({connectionText: "Соперник не в сети"}) : self.setState({connectionText: ""});
        });

        //Обработка события "конец игры"
        self.addEndGameListenerOnce();
    },
    addEndGameListenerOnce: function(){
      var self = this;
      socket.once('end game', function(data){
          socket.removeAllListeners('game status');
          switch (data){
              case "loose":
                  soundManager.play('loose');
                  self.setState({statusText: "Игра закончилась. Вы проиграли"});
                  console.log("Игра закончилась. Вы проиграли");
                  break;
              case "win":
                  soundManager.play('win');
                  self.setState({statusText: "Игра закончилась. Вы выиграли!! УРАА!"});
                  console.log("Игра закончилась. Вы выиграли!! УРАА!");
                  break;
              case "pat":
                  soundManager.play('pat');
                  self.setState({statusText: "Игра закончилась. Ничья"});
                  console.log("Игра закончилась. Ничья");
                  break;
              case "disconnect":
                  soundManager.play('disconnect');
                  self.setState({statusText: "Игра закончилась. Игрок отключился"});
                  console.log("Дисконнект");
                  break;
              default:
          }
          //Показать кнопку "начать заново" и установить обработчик приема

          self.setState({statusButton1: {
              disabled: false,
              visible: true,
              text: "Начать заново",
              onClick: self.sendRestartRequest
            }
          });
          self.receiveRestartRequest();
      })
    },
    addGameStatusListener: function(){
      var self = this;
      socket.on('game status', function (gameData) {
        //Показать поле
        self.setState({shown: true});
        //отображение текущего положения дел
        self.updateFieldState(gameData.field);
        self.setState({myTurn: gameData.nowTurn, myNumber: gameData.playerNumber});
        if (gameData.nowTurn) {
          soundManager.play('my_turn');
          self.setState({statusText: "Ваш ход!"});
        } else {
          self.setState({statusText: "Ход соперника..."});
        }
      });
    },
    restartGame: function(){
      var self = this;
      socket.removeAllListeners('restart canceled');
      self.addGameStatusListener();
      self.addEndGameListenerOnce();
      self.setState({statusButton1: {
          disabled: false,
          visible: false,
          text: "",
          onClick: function(){}
        }
      });
    },
    sendRestartRequest: function(){
      var self = this;
      console.log('restart request sended');
      self.setState({statusButton1: {
          disabled: true,
          visible: true,
          text: "Ожидание ответа соперника...",
          onClick: self.sendRestartRequest
        },
        buttonsDescriptionText: ""
      });
      socket.removeAllListeners('restart request');
      console.log('restart request listening disabled');
      socket.emit('restart request', this.state.myNumber);
      socket.once('restart accepted', function(){
        self.restartGame();

      });
      socket.on('restart canceled', function(data){
        console.log("Test");
        socket.removeAllListeners('restart accepted');
        self.receiveRestartRequest();
        self.setState({statusButton1: {
            disabled: false,
            visible: true,
            text: "Начать заново",
            onClick: self.sendRestartRequest
          },
          buttonsDescriptionText: "Соперник отклонил приглашение"
        });
      });
    },
    receiveRestartRequest: function(){
      var self = this;
      console.log("Restart requesting enabled");

      socket.on('restart request',function(data){
        console.log("Restart request from opponent getted");
        self.setState({
          statusButton1: {
            disabled: false,
            visible: true,
            text: "Ок",
            onClick: self.restartGameAccepted
          },
          statusButton2: {
              disabled: false,
              visible: true,
              text: "Нет",
              onClick: self.cancelRestart
          },
          buttonsDescriptionText: "Соперник предлагает начать игру заново."
        });
      });
    },
    restartGameAccepted: function(){
      var self = this;
      console.log("RestartGame function running");
      self.setState({
        statusButton1: {
          disabled: false,
          visible: false,
          text: "",
          onClick: function(){}
        },
        statusButton2: {
            disabled: false,
            visible: false,
            text: "",
            onClick: function(){}
        },
        buttonsDescriptionText: ""
      });
      socket.emit('restart accepted');
      self.restartGame();
    },
    cancelRestart: function(){
      var self = this;
      self.setState({
        statusButton1: {
            disabled: false,
            visible: true,
            text: "Начать заново",
            onClick: self.sendRestartRequest
        },
        statusButton2: {
            disabled: false,
            visible: false,
            text: "",
            onClick: function(){}
        },
        buttonsDescriptionText: ""
      });
      socket.emit('restart canceled');
    },
    updateFieldState: function(state){
        var tmp = [];
        for (var i=0; i<state.length; i++){
          if (state[i] == 1){
            tmp[i] = 'x';
          }
          else if (state[i] == -1){
            tmp[i] = 'o';
          }
          else{
              tmp[i] = 'empty';
          }
        }
        this.setState ({fieldState: tmp});
    },

    clickHandler: function(e){
        if (this.state.myTurn){
            var target = e.target;
            if (this.state.fieldState[target.id-1] == "empty"){
                this.setState({myTurn: false});
                //обновить поле
                var tmp = this.state.fieldState;
                if (this.state.myNumber == 1){
                  tmp[target.id-1] = "x";
                }
                else if (this.state.myNumber == 2){
                  tmp[target.id-1] = "o";
                }
                this.setState({fieldState: tmp})
                //отправить свой ход на сервер
                socket.emit('turn done',{playerNumber: this.state.myNumber, targetId: target.id});
                soundManager.play('turn_finished');
            }
        }
        console.log("fieldState: ");
        console.log(this.state.fieldState);
    },

    render: function(){
      if (this.state.shown) {
          return (
              <div>

                <div onClick={this.clickHandler}>

                    <div id='1' className={this.state.fieldState[0]}></div>
                    <div id='2' className={this.state.fieldState[1]}></div>
                    <div id='3' className={this.state.fieldState[2]}></div>
                    <div id='4' className={this.state.fieldState[3]}></div>
                    <div id='5' className={this.state.fieldState[4]}></div>
                    <div id='6' className={this.state.fieldState[5]}></div>
                    <div id='7' className={this.state.fieldState[6]}></div>
                    <div id='8' className={this.state.fieldState[7]}></div>
                    <div id='9' className={this.state.fieldState[8]}></div>
                </div>
                <div>
                  <StatusBar text={this.state.statusText} connectionText={this.state.connectionText} button1={this.state.statusButton1} button2={this.state.statusButton2} buttonsDescriptionText={this.state.buttonsDescriptionText}/>
                </div>
              </div>
          );
      }
      else return <div></div>
  }
});

module.exports = GameField;
