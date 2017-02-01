//компонент игрового поля.
var React = require('react');

var Chat = require('./gamespace/Chat.jsx');
var LostFigures = require('./gamespace/LostFigures.jsx');
var GameField = require('./gamespace/GameField.jsx');

var GameSpace = React.createClass({
  render: function(){
    var lostFigures = [
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
            ];
    return (
      <div>
        <div id="lostfiguresblack">
          <LostFigures lostFigures={lostFigures} side='black'/>
        </div>
        <div id="field">
          <GameField/>
        </div>
        <div id="chat">
          <Chat/>
        </div>
        <div id="lostfigureswhite">
          <LostFigures lostFigures={lostFigures} side='white'/>
        </div>
      </div>
    )
  }
})


module.exports = GameSpace;
