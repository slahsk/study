import React,{Component, PropTypes} from 'react';
import List from './List';
import style from './kanban.css';

class KanbanBoard extends Component{
  render(){
    return (
      <div className={style.app}>
        <List id='todo' taskCallbacks={this.props.taskCallbacks} title='To Do' cards={this.props.cards.filter((card) => card.status === 'todo')} />
        <List id='in-progress' taskCallbacks={this.props.taskCallbacks} title='In Irogress' cards={this.props.cards.filter((card) => card.status === 'in-progress')} />
        <List id='done' taskCallbacks={this.props.taskCallbacks} title='Done' cards={this.props.cards.filter((card) => card.status === 'done')} />
      </div>
    );
  }
};

KanbanBoard.propTypes = {
  cards :PropTypes.arrayOf(PropTypes.object),
  taskCallbacks:PropTypes.object
}

export default KanbanBoard;
