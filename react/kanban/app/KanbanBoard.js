import React,{Component, PropTypes} from 'react';
import { Link } from 'react-router';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend'
import List from './List';
import style from './kanban.css';

class KanbanBoard extends Component{
  render(){
    let cardModal = this.props.children && React.cloneElement(this.props.children,{
      cards: this.props.cards,
      cardCallbacks:this.props.cardCallbacks
    })

    return (
      <div className={style.app}>
        <Link to="/new" className={style.floatButton}>+</Link>
        <List id='todo'
        title='To Do'
        taskCallbacks={this.props.taskCallbacks}
        cardCallbacks={this.props.cardCallbacks}
        cards={this.props.cards.filter((card) => card.status === 'todo')} />

        <List id='in-progress'
        title='In Irogress'
        taskCallbacks={this.props.taskCallbacks}
        cardCallbacks={this.props.cardCallbacks}
        cards={this.props.cards.filter((card) => card.status === 'in-progress')} />

        <List id='done'
        title='Done'
        taskCallbacks={this.props.taskCallbacks}
        cardCallbacks={this.props.cardCallbacks}
        cards={this.props.cards.filter((card) => card.status === 'done')} />
      {cardModal}
      </div>
    );
  }
};

KanbanBoard.propTypes = {
  cards :PropTypes.arrayOf(PropTypes.object),
  taskCallbacks:PropTypes.object,
  cardCallbacks : PropTypes.object
}

export default DragDropContext(HTML5Backend)(KanbanBoard);
