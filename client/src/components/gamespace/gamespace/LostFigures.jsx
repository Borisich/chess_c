//Компонент для отображения съеденных фигур

var React = require('react');

var LostFigures = React.createClass({
  render: function(){
    var reorderedProps = []
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

    var divArray = [];
    for (var i=0; i<15; i++){
      var cls = "lostfigureframe "+ reorderedProps[i]
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
