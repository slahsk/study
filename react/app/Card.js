import React,{Component} from 'react';
import CheckList from './CheckList';
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
          {this.props.description}
          <CheckList cardId={this.props.id} tasks={this.props.tasks} />
        </div>
      );
    }

    return (
      <div className={style.card}>
        <div className={style.card_title} onClick = { () => this.setState({showDetails : !this.state.showDetails})}>
          {this.props.title}
        </div>
        {cardDetails}
      </div>
    );
  }
}

export default Card;
