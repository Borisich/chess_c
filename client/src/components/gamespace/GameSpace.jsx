//компонент игрового поля.
var React = require('react');

var Chat = require('./gamespace/Chat.jsx');
var LostFigures = require('./gamespace/LostFigures.jsx');
var GameField = require('./gamespace/GameField.jsx');

var GameSpace = React.createClass({
  render: function(){
    return (
      <div>
        <div id="lostfiguresblack">
          <LostFigures data="left"/>
        </div>
        <div id="field">
          <GameField/>
        </div>
        <div id="chat">
          <Chat/>
        </div>
        <div id="lostfigureswhite">
          <LostFigures data="right"/>
        </div>
      </div>
    )
  }
})


module.exports = GameSpace;
