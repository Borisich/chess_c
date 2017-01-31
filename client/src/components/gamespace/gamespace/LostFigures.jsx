//Компонент для отображения съеденных фигур

var React = require('react');
var socket = require('../../../../services/socket.js');

var LostFigures = React.createClass({
  getInitialState: function () {
    return {
        shown: false,
        lostFigures: []
    };
  },
  componentDidMount: function () {
    var self = this;
    socket.on('game status', function (data) {
      self.setState({
          shown: true,
          lostFigures: data.lostFigures
      });
    });
  },
  render: function(){
    var whatSideIsFigure = function(figure){
      if (figure[figure.length-1] == "w") return "white";
      if (figure[figure.length-1] == "b") return "black";
      return false;
    }

    var reorderedFigures= [];
    if (this.props.side == 'black'){
      var k = 0;
      for (var i=0; i<this.state.lostFigures.length; i++){
        if (whatSideIsFigure(this.state.lostFigures[i]) == "black"){
          if (k < 5) {
            reorderedFigures[3*k+2] = this.state.lostFigures[i];
          }
          if ((k > 4) && (k < 10)) {
            reorderedFigures[3*k-14] = this.state.lostFigures[i];
          }
          if (k > 9) {
            reorderedFigures[3*k-30] = this.state.lostFigures[i];
          }
          k++;
        }
      }
    }

    if (this.props.side == 'white'){
      var k = 0;
      for (var i=0; i<this.state.lostFigures.length; i++){
        if (whatSideIsFigure(this.state.lostFigures[i]) == "white"){
          if (k < 5) {
            reorderedFigures[12-3*k] = this.state.lostFigures[i];
          }
          if ((k > 4) && (k < 10)) {
            reorderedFigures[28-3*k] = this.state.lostFigures[i];
          }
          if (k > 9) {
            reorderedFigures[44-3*k] = this.state.lostFigures[i];
          }
          k++;
        }
      }
    }


    /*var reorderedProps = []
    if (this.props.side == 'black'){
      for (var i=0; i<15; i++){
        if (i < 5) {
          reorderedProps[3*i+2] = this.props.data[i];
        }
        if ((i > 4) && (i < 10)) {
          reorderedProps[3*i-14] = this.props.data[i];
        }
        if (i > 9) {
          reorderedProps[3*i-30] = this.props.data[i];
        }
      }
    }
    else if (this.props.side == 'white'){
      for (var i=0; i<15; i++){
        if (i < 5) {
          reorderedProps[12-3*i] = this.props.data[i];
        }
        if ((i > 4) && (i < 10)) {
          reorderedProps[28-3*i] = this.props.data[i];
        }
        if (i > 9) {
          reorderedProps[44-3*i] = this.props.data[i];
        }
      }
    }

    */

    var divArray = [];
    for (var i=0; i<15; i++){
      var cls = "lostfigureframe "+ reorderedFigures[i]
      divArray.push(
        <div className={cls} key={i}></div>
      );
    }
    return  (
            <div>
              {divArray}
            </div>
          )
  }
});

module.exports = LostFigures;
