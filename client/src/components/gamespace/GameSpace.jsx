//компонент игрового поля.
var React = require('react');

var Chat = require('./gamespace/Chat.jsx');
var LostFigures = require('./gamespace/LostFigures.jsx');
var GameField = require('./gamespace/GameField.jsx');

var GameSpace = React.createClass({
  render: function(){
    var LostFiguresDataBlack = {
      side: 'black',
      data: [
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
            '',
            '',
            ]
    };
    var LostFiguresDataWhite = {
      side: 'white',
      data: [
            'pawn_w',
            'rook_w',
            'pawn_w',
            'pawn_w',
            'pawn_w',
            'pawn_w',
            'pawn_w',
            'pawn_w',
            'pawn_w',
            'pawn_w',
            'pawn_w',
            'pawn_w',
            'pawn_w',
            '',
            '',
            ]
    };
    return (
      <div>
        <div id="lostfiguresblack">
          <LostFigures data={LostFiguresDataBlack.data} side={LostFiguresDataBlack.side}/>
        </div>
        <div id="field">
          <GameField/>
        </div>
        <div id="chat">
          <Chat/>
        </div>
        <div id="lostfigureswhite">
          <LostFigures data={LostFiguresDataWhite.data} side={LostFiguresDataWhite.side}/>
        </div>
      </div>
    )
  }
})


module.exports = GameSpace;
