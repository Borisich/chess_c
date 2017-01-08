
var React = require('react');
var socket = require('../../services/socket.js');
var soundManager = require('../../sounds/sounds.js');

var StatusBar = require('./StatusBar.jsx');

var GameField = React.createClass({
    getInitialState: function(){
        function getInitialFieldState(){
          var result = [];
          //середина поля
          for (var i=0; i<8; i++){
            result[i] = [];
            for (var j=2; j<6; j++){
              result[i][j]="empty";
            }
          }
          //расстановка фигур
          result[0][0]="rook_w";
          result[1][0]="knight_w";
          result[2][0]="bishop_w";
          result[3][0]="queen_w";
          result[4][0]="king_w";
          result[5][0]="bishop_w";
          result[6][0]="knight_w";
          result[7][0]="rook_w";
          result[0][1]="pawn_w";
          result[1][1]="pawn_w";
          result[2][1]="pawn_w";
          result[3][1]="pawn_w";
          result[4][1]="pawn_w";
          result[5][1]="pawn_w";
          result[6][1]="pawn_w";
          result[7][1]="pawn_w";

          result[0][6]="pawn_b";
          result[1][6]="pawn_b";
          result[2][6]="pawn_b";
          result[3][6]="pawn_b";
          result[4][6]="pawn_b";
          result[5][6]="pawn_b";
          result[6][6]="pawn_b";
          result[7][6]="pawn_b";
          result[0][7]="rook_b";
          result[1][7]="knight_b";
          result[2][7]="bishop_b";
          result[3][7]="queen_b";
          result[4][7]="king_b";
          result[5][7]="bishop_b";
          result[6][7]="knight_b";
          result[7][7]="rook_b";

          console.log(result);
          return result;
        };
        var fS = getInitialFieldState();
        console.log(fS);
        return {
            shown: true,
            //fieldState: ["empty","empty","empty","empty","empty","empty","empty","empty","empty"],
            fieldState: getInitialFieldState(),
            myTurn: true,
            selectedFigure: {
              selected: false,
              i: undefined,
              j: undefined,
              class: undefined
            },
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
        /*var tmp = [];
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
        }*/
        this.setState ({fieldState: state});
    },
    getFieldStateById: function(id){
      //var self = this;
      var i = (id-1) % 8;
      var jCalc = (64-id+1);
      var jCalc2 = ((jCalc % 8) ? jCalc/8 : (jCalc-1)/8);
      var j = Math.floor(jCalc2);
      var cs = this.state.fieldState[i][j];

      return {
        class: cs,
        i: i,
        j: j
      }
    },
    isMyFigure: function(cl){
      var result = false;
      if (this.state.myNumber == 1){
        switch (cl) {
          case "rook_w":
          case "knight_w":
          case "bishop_w":
          case "king_w":
          case "queen_w":
          case "pawn_w":
            result = true;
            break;
          default:
            result = false;
        }
      }
      if (this.state.myNumber == 2){
        switch (cl) {
          case "rook_b":
          case "knight_b":
          case "bishop_b":
          case "king_b":
          case "queen_b":
          case "pawn_b":
            result = true;
            break;
          default:
            result = false;
        }
      }
      return result;
    },
    clickHandler: function(e){
        //var self = this;
        if (this.state.myTurn){
          if (!this.state.selectedFigure.selected){ //Выделяем фигуру
            var target = e.target;
            var selectedFigure = this.getFieldStateById(target.id);
            //alert (selectedFigure.class + " " + selectedFigure.i + " " + selectedFigure.j)
            if (this.isMyFigure(selectedFigure.class)){
              this.setState({
                selectedFigure: {
                  selected: true,
                  i: selectedFigure.i,
                  j: selectedFigure.j,
                  class: selectedFigure.class
                }
              });
            }
          }
          else{ //перемещаем фигуру
            var target = e.target;
            var placeToMove = this.getFieldStateById(target.id);
            //проверка возможности хода
              var tmp = this.state.fieldState;
              tmp[this.state.selectedFigure.i][this.state.selectedFigure.j] = "empty";
              tmp[placeToMove.i][placeToMove.j] = this.state.selectedFigure.class;
              if ((this.state.selectedFigure.i != placeToMove.i) || (this.state.selectedFigure.j != placeToMove.j)){
                this.setState({
                  myTurn: false
                });
                //отправить свой ход на сервер
                socket.emit('turn done',{playerNumber: this.state.myNumber, field: this.state.fieldState});
                soundManager.play('turn_finished');
                //alert ("not my turn");
              }
              this.setState({
                fieldState: tmp,
                selectedFigure: {
                  selected: false,
                  i: undefined,
                  j: undefined,
                  class: undefined
                }
              })

          }




            /*if (this.state.fieldState[target.id-1] == "empty"){
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
            }*/
        }
        console.log("fieldState: ");
        console.log(this.state.fieldState);
    },

    render: function(){
      var self = this;
      function htmlField(){
        console.log("FIELD STATE:");
        console.log(self.state.fieldState);
        var result = [];
        var cnt=1;
        var framecnt=100;
        function horizontalFrame(){
          for (var i=0; i<self.state.fieldState[0].length; i++){
            result.push(<div id={framecnt} className="horizontframe" key={framecnt}>{String.fromCharCode(i+65)}</div>);
            framecnt++;
          }
        };
        function verticalFrame(j){
          result.push(<div id={framecnt} className="verticalframe" key={framecnt}>{j}</div>);
          framecnt++;
        };
        function cornerFrame(){
          result.push(<div id={framecnt} className="cornerframe" key={framecnt}></div>);
          framecnt++;
        };
        var selected = "";
        //верхняя рамка
        cornerFrame()
        horizontalFrame();
        cornerFrame()
        //поле
        for (var j=self.state.fieldState.length-1; j>-1; j--){
          //боковая рамка
          verticalFrame(j+1);
          for(var i=0; i<self.state.fieldState[j].length; i++){
            if (self.state.selectedFigure.selected){
              if ((self.state.selectedFigure.i == i) && (self.state.selectedFigure.j == j)){
                selected = "selected";
              }
            };
            result.push(<div id={cnt} className={self.state.fieldState[i][j]+" "+((i+j) % 2 ? "white" : "black") + " " + selected} key={cnt}></div>);
            cnt++;
            selected = "";
          }
          //боковая рамка
          verticalFrame(j+1);
        }
        //нижняя рамка
        cornerFrame()
        horizontalFrame();
        cornerFrame()
        return result;
      };
      if (this.state.shown) {

          return (
              <div>

                <div onClick={this.clickHandler}>
                  {htmlField()}
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
