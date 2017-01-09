
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
          result[0][0].moved = false;
          result[1][0]="knight_w";
          result[2][0]="bishop_w";
          result[3][0]="queen_w";
          /*result[1][0]="empty";
          result[2][0]="empty";
          result[3][0]="empty";*/
          result[4][0]="king_w";
          result[4][0].moved = false;
          result[5][0]="bishop_w";
          result[6][0]="knight_w";
          /*result[5][0]="empty";
          result[6][0]="empty";*/
          result[7][0]="rook_w";
          result[7][0].moved = false;
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
          result[0][7].moved = false;
          result[1][7]="knight_b";
          result[2][7]="bishop_b";
          result[3][7]="queen_b";
          /*result[1][7]="empty";
          result[2][7]="empty";
          result[3][7]="empty";*/
          result[4][7]="king_b";
          result[4][7].moved = false;
          result[5][7]="bishop_b";
          result[6][7]="knight_b";
          /*result[5][7]="empty";
          result[6][7]="empty";*/
          result[7][7]="rook_b";
          result[7][7].moved = false;

          console.log(result);
          return result;
        };
        var fS = getInitialFieldState();
        console.log(fS);
        return {
            shown: false,
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
    /*getFigureByCoords: function(i,j){

    },*/
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
    isTurnPossible: function(selectedFigure, placeToMove){
      var result = false;
      var opponentAttacked = function(){
        var s = selectedFigure.class[selectedFigure.class.length-1];
        if (s == "b"){
          if (whiteFigures.indexOf(placeToMove.class) != -1){
            result = true
          }
          else {
            result = false
          }
        }
        if (s == "w"){
          if (blackFigures.indexOf(placeToMove.class) != -1){
            result = true
          }
          else {
            result = false
          }
        }
        return result;
      };
      var blackFigures = ["rook_b","knight_b","bishop_b","king_b","queen_b","pawn_b"];
      var whiteFigures = ["rook_w","knight_w","bishop_w","king_w","queen_w","pawn_w"];
      switch (selectedFigure.class) {
        case "pawn_w":
          if ((selectedFigure.i == placeToMove.i) && (selectedFigure.j == placeToMove.j-1) && (placeToMove.class == "empty")){
            result = true;
          };
          if ((selectedFigure.i == placeToMove.i) && (selectedFigure.j == placeToMove.j-2) && (placeToMove.class == "empty") && (selectedFigure.j == 1)){
            result = true;
          };
          //поедание
          if (((selectedFigure.i == placeToMove.i+1) || (selectedFigure.i == placeToMove.i-1)) && (selectedFigure.j == placeToMove.j-1) && opponentAttacked()){
            result = true;
          };
          break;
        case "pawn_b":
          if ((selectedFigure.i == placeToMove.i) && (selectedFigure.j == placeToMove.j+1) && (placeToMove.class == "empty")){
            result = true;
          };
          if ((selectedFigure.i == placeToMove.i) && (selectedFigure.j == placeToMove.j+2) && (placeToMove.class == "empty") && (selectedFigure.j == 1)){
            result = true;
          };
          //поедание
          if (((selectedFigure.i == placeToMove.i+1) || (selectedFigure.i == placeToMove.i-1)) && (selectedFigure.j == placeToMove.j+1) && opponentAttacked()){
            result = true;
          };
          break;
        case "rook_b":
        case "rook_w":
          var f = true;
          if(selectedFigure.i == placeToMove.i){
            var minJ = Math.min(selectedFigure.j, placeToMove.j);
            var maxJ = Math.max(selectedFigure.j, placeToMove.j);
            if (minJ == maxJ) {
              break;
            }
            for (var j = minJ+1; j < maxJ; j++) {
              if (this.state.fieldState[selectedFigure.i][j] != "empty"){
                f = false;
                break;
              }
            }
          }
          else if(selectedFigure.j == placeToMove.j){
            var minI = Math.min(selectedFigure.i, placeToMove.i);
            var maxI = Math.max(selectedFigure.i, placeToMove.i);
            if (minI == maxI) {
              break;
            }
            for (var i = minI+1; i < maxI; i++) {
              if (this.state.fieldState[i][selectedFigure.j] != "empty"){
                f = false;
                break;
              }
            }
          }
          else {
            f = false;
          }
          if (f){
            if ((placeToMove.class == "empty") || opponentAttacked()){
              result = true;
            };
          }
          break;
        case "knight_b":
        case "knight_w":
          var f = false;
          if(Math.abs(placeToMove.i-selectedFigure.i) == 1){
            if(Math.abs(placeToMove.j-selectedFigure.j) == 2){
              f = true;
            }
          }
          if(Math.abs(placeToMove.i-selectedFigure.i) == 2){
            if(Math.abs(placeToMove.j-selectedFigure.j) == 1){
              f = true;
            }
          }
          if (f){
            if ((placeToMove.class == "empty") || opponentAttacked()){
              result = true;
            };
          }
          break;
        case "bishop_b":
        case "bishop_w":
          var f = true;
          if (Math.abs(placeToMove.i-selectedFigure.i) == Math.abs(placeToMove.j-selectedFigure.j)){
            var minJ = Math.min(selectedFigure.j, placeToMove.j);
            var maxJ = Math.max(selectedFigure.j, placeToMove.j);
            var minI = Math.min(selectedFigure.i, placeToMove.i);
            var maxI = Math.max(selectedFigure.i, placeToMove.i);
            for (var j = minJ+1, i = minI+1; j < maxJ; j++, i++) {
              if (this.state.fieldState[i][j] != "empty"){
                f = false;
                break;
              }
            }
            if (f){
              if ((placeToMove.class == "empty") || opponentAttacked()){
                result = true;
              };
            }
          }
          break;
        case "queen_b":
        case "queen_w":
          var f = true;
          //Объединяем ладью и слона
          //Слон
          if (Math.abs(placeToMove.i-selectedFigure.i) == Math.abs(placeToMove.j-selectedFigure.j)){
            var minJ = Math.min(selectedFigure.j, placeToMove.j);
            var maxJ = Math.max(selectedFigure.j, placeToMove.j);
            var minI = Math.min(selectedFigure.i, placeToMove.i);
            var maxI = Math.max(selectedFigure.i, placeToMove.i);
            for (var j = minJ+1, i = minI+1; j < maxJ; j++, i++) {
              if (this.state.fieldState[i][j] != "empty"){
                f = false;
                break;
              }
            }
          }
          //Ладья
          if(selectedFigure.i == placeToMove.i){
            var minJ = Math.min(selectedFigure.j, placeToMove.j);
            var maxJ = Math.max(selectedFigure.j, placeToMove.j);
            if (minJ == maxJ) {
              break;
            }
            for (var j = minJ+1; j < maxJ; j++) {
              if (this.state.fieldState[selectedFigure.i][j] != "empty"){
                f = false;
                break;
              }
            }
          } else if(selectedFigure.j == placeToMove.j){
            var minI = Math.min(selectedFigure.i, placeToMove.i);
            var maxI = Math.max(selectedFigure.i, placeToMove.i);
            if (minI == maxI) {
              break;
            }
            for (var i = minI+1; i < maxI; i++) {
              if (this.state.fieldState[i][selectedFigure.j] != "empty"){
                f = false;
                break;
              }
            }
          } else {
            f = false;
          }
          if (f){
            if ((placeToMove.class == "empty") || opponentAttacked()){
              result = true;
            };
          }
          break;
        case "king_b":
        case "king_w":
          if((Math.abs(placeToMove.i-selectedFigure.i) <= 1) && (Math.abs(placeToMove.j-selectedFigure.j) <= 1)){
            if ((placeToMove.i == selectedFigure.i) && (placeToMove.j == selectedFigure.j)){
              break;
            }
            if ((placeToMove.class == "empty") || opponentAttacked()){
              result = true;
            };
          }
          //Рокировка
          var f = true;
          if((Math.abs(placeToMove.i-selectedFigure.i) == 2) && (Math.abs(placeToMove.j-selectedFigure.j) == 0)){
            if (((placeToMove.i == 6) && (placeToMove.j == 0)) && !this.state.fieldState[4][0].moved && !this.state.fieldState[7][0].moved){
              for (var i=5; i<7; i++){
                if(this.state.fieldState[i][0] != "empty"){
                  f = false;
                }
              }
              if (f){
                result = {
                  i: 6,
                  j: 0
                }
              }
            }
            if (((placeToMove.i == 2) && (placeToMove.j == 0)) && !this.state.fieldState[4][0].moved && !this.state.fieldState[0][0].moved){
              for (var i=1; i<4; i++){
                if(this.state.fieldState[i][0] != "empty"){
                  f = false;
                }
              }
              if (f){
                result = {
                  i: 2,
                  j: 0
                }
              }
            }


            if (((placeToMove.i == 6) && (placeToMove.j == 7)) && !this.state.fieldState[4][7].moved && !this.state.fieldState[7][7].moved){
              for (var i=5; i<7; i++){
                if(this.state.fieldState[i][7] != "empty"){
                  f = false;
                }
              }
              if (f){
                result = {
                  i: 6,
                  j: 7
                }
              }
            }
            if (((placeToMove.i == 2) && (placeToMove.j == 7)) && !this.state.fieldState[4][7].moved && !this.state.fieldState[0][7].moved){
              for (var i=1; i<4; i++){
                if(this.state.fieldState[i][7] != "empty"){
                  f = false;
                }
              }
              if (f){
                result = {
                  i: 2,
                  j: 7
                }
              }
            }

          }
          break;

        default:
         result = false;
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
            if (this.isTurnPossible(this.state.selectedFigure, placeToMove)){
              if (typeof(this.isTurnPossible(this.state.selectedFigure, placeToMove) == 'object')){
                //рокировка. Передвинем ладью
                var rock = this.isTurnPossible(this.state.selectedFigure, placeToMove);
                if ((rock.i == 6) && ((rock.j == 0))){
                  //белая правая
                  var tmp = this.state.fieldState;
                  tmp[7][0] = "empty";
                  tmp[5][0] = "rook_w";
                }
                if ((rock.i == 2) && ((rock.j == 0))){
                  //белая левая
                  var tmp = this.state.fieldState;
                  tmp[0][0] = "empty";
                  tmp[3][0] = "rook_w";
                }
                if ((rock.i == 6) && ((rock.j == 7))){
                  //белая левая
                  var tmp = this.state.fieldState;
                  tmp[7][7] = "empty";
                  tmp[5][7] = "rook_b";
                }
                if ((rock.i == 2) && ((rock.j == 7))){
                  //белая левая
                  var tmp = this.state.fieldState;
                  tmp[0][7] = "empty";
                  tmp[3][7] = "rook_b";
                }
              }
              var tmp = this.state.fieldState;
              tmp[this.state.selectedFigure.i][this.state.selectedFigure.j] = "empty";
              tmp[placeToMove.i][placeToMove.j] = this.state.selectedFigure.class;
              var i = this.state.selectedFigure.i;
              var j = this.state.selectedFigure.j;
              if(((i==0) && (j==0)) || ((i==4) && (j==0)) || ((i==7) && (j==0)) || ((i==0) && (j==7)) || ((i==4) && (j==7)) || ((i==7) && (j==7))){
                tmp[i][j].moved == true;
              }
              this.setState({
                myTurn: false,
                fieldState: tmp,
                selectedFigure: {
                  selected: false,
                  i: undefined,
                  j: undefined,
                  class: undefined
                }
              });
              //отправить свой ход на сервер
              socket.emit('turn done',{playerNumber: this.state.myNumber, field: this.state.fieldState});
              soundManager.play('turn_finished');
            }
            else{
              //Снять выделение
              if ((this.state.selectedFigure.i == placeToMove.i) && (this.state.selectedFigure.j == placeToMove.j)){
                this.setState({
                  selectedFigure: {
                    selected: false,
                    i: undefined,
                    j: undefined,
                    class: undefined
                  }
                })
              }
            }
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
