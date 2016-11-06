import React, {Component, PropTypes} from 'react';
import {DropTarget} from 'react-dnd';
import Card from './Card';
import style from './kanban.css';
import constants from './constants';


const listTargetSpec = {
  hover(props, monitor){
    const draggedId = monitor.getItem().id;
    props.cardCallbacks.updateStatus(draggedId, props.id)
  }
};

let collect = (connect, monitor)=> {
  return {
    connectDropTarget : connect.dropTarget()
  };
}

class List extends Component {
    render() {
        const {connectDropTarget} = this.props;

        let cards = this.props.cards.map((card, i) => {
            return <Card key={card.id} id={card.id}
            taskCallbacks={this.props.taskCallbacks}
            cardCallbacks={this.props.cardCallbacks}
            color={card.color}
            title={card.title}
            description={card.description}
            tasks={card.tasks}
             />;
        });

        return connectDropTarget(
            <div className={style.list}>
                <h1>{this.props.title}</h1>
                {cards}
            </div>
        );
    }
};

List.propTypes = {
  title: PropTypes.string.isRequired,
  cards : PropTypes.arrayOf(PropTypes.object),
  taskCallbacks:PropTypes.object,
  cardCallbacks : PropTypes.object,
  connectDropTarget:PropTypes.func.isRequired
};

export default DropTarget(constants.CARD, listTargetSpec, collect)(List);
