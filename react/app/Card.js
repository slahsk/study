import React,{Component} from 'react';
import CheckList from './CheckList';
import style from './kanban.css';

class Card extends Component{
  render(){
    return (
      <div className={style.card}>
        <div className={style.card_title}>
          {this.props.title}
        </div>
        <div className={style.card_details}>
          {this.props.description}
          <CheckList cardId={this.props.id} tasks={this.props.tasks} />
        </div>
      </div>
    );
  }
}

export default Card;
