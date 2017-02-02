//компонент игрового поля.
var React = require('react');

var Chat = require('./gamespace/Chat.jsx');
var LostFigures = require('./gamespace/LostFigures.jsx');
var GameField = require('./gamespace/GameField.jsx');

var GameSpace = React.createClass({
  getInitialState: function () {
      return {
        lostFigures: [
                'pawn_b',
                'rook_b',
                'pawn_b',
                'pawn_b',
                'pawn_b',
                'pawn_b',
                'pawn_b',
                'pawn_b',
                'pawn_b',
                'pawn_b',
                'pawn_b',
                'pawn_b',
                'pawn_b',
                'pawn_b',
                'pawn_w',
                'pawn_w',
                'pawn_w',
                'pawn_w',
                ]
      };
  },
  componentDidMount: function () {
      var self = this;
      console.log("STATE SETTED");
      console.log(self.state.lostFigures);
  },
  addLostFigure: function (figure){
    var tmp = this.state.lostFigures;
    tmp.push(figure);
    this.setState({
      lostFigures: tmp
    });
  },
  render: function(){
    return (
      <div>
        <div id="lostfiguresblack">
          <LostFigures  lostFigures={this.state.lostFigures} side='black'/>
        </div>
        <div id="field">
          <GameField addLostFigure={this.addLostFigure}/>
        </div>
        <div id="chat">
          <Chat/>
        </div>
        <div id="lostfigureswhite">
          <LostFigures lostFigures={this.state.lostFigures} side='white'/>
        </div>
      </div>
    )
  }
})


module.exports = GameSpace;
