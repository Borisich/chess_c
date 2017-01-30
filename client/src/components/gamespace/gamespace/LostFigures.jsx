//Компонент для отображения съеденных фигур

var React = require('react');

var LostFigures = React.createClass({
  render: function(){
    var reorderedProps = []
    for (var i=0; i<15; i++){
      if (i < 5) {
        reorderedProps[3*x-2] = this.props.data[i];
      }
      if ((i > 4) && (i < 10)) {
        reorderedProps[3*x-14] = this.props.data[i];
      }
      if (i > 9) {
        reorderedProps[3*x-30] = this.props.data[i];
      }

    }
    var divArray = [];
    for (var i=0; i<15; i++){
      divArray.push(
        <div className="lostfigureframe" key={i}></div>
      );
    }
    return  (
            <div>
              {this.props.data}
              <br/>
              {divArray}
            </div>
          )
  }
});

module.exports = LostFigures;
