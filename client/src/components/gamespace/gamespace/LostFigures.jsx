//Компонент для отображения съеденных фигур

var React = require('react');
var socket = require('../../../../services/socket.js');

var LostFigures = React.createClass({
  getInitialState: function () {
    return {
        shown: false,
        lostFigures: this.props.lostFigures
    };
  },
  componentDidMount: function () {
    var self = this;
    this.setState({
      shown: true,
      lostFigures: this.props.lostFigures
    });

    socket.on('game status', function (data) {
      self.setState({
          shown: true,
          /*lostFigures: data.lostFigures*/
      });
    });
  },
  whatSideIsFigure: function(figure){
    if (figure[figure.length-1] == "w") return "white";
    if (figure[figure.length-1] == "b") return "black";
    return false;
  },
  render: function(){
    console.log("PROPS:");
    console.log(this.props.lostFigures);
    console.log("STATE:");
    console.log(this.state.lostFigures);

    if (this.state.shown){
      var reorderedFigures= [];
      if (this.props.side == 'black'){
        var k = 0;
        for (var i=0; i<this.state.lostFigures.length; i++){
          if (this.whatSideIsFigure(this.state.lostFigures[i]) == "black"){
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
          if (this.whatSideIsFigure(this.state.lostFigures[i]) == "white"){
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
    else return null;
  }
});

module.exports = LostFigures;
