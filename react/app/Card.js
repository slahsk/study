import React,{Component} from 'react';
import CheckList from './CheckList';
import marked from 'marked';
import style from './kanban.css';

class Card extends Component{
  constructor(){
    super(...arguments);
    this.state = {
      showDetails : false
    };
  }

  render(){
    let cardDetails;
    if(this.state.showDetails){
      cardDetails = (
        <div className={style.card_details}>
          <span dangerouslySetInnerHTML = {{__html : marked(this.props.description)}} />
          <CheckList cardId={this.props.id} tasks={this.props.tasks} />
        </div>
      );
    }

    let sideColor = {
      position:'absolute',
      zIndex : -1,
      top : 0,
      bottom : 9,
      left : 0,
      width : 7,
      backgroundColor : this.props.color
    };

    return (
      <div className={style.card}>
        <div style={sideColor} />
        <div
          className={  this.state.showDetails? style.card_title && style.card_title_is_open : style.card_title}
          onClick = { () => this.setState({showDetails : !this.state.showDetails})}>
          {this.props.title}
        </div>
        {cardDetails}
      </div>
    );
  }
}

export default Card;
