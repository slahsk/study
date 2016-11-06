import React, {Component, PropTypes} from 'react';
import Card from './Card';
import style from './kanban.css';

class List extends Component {
    render() {
        let cards = this.props.cards.map((card, i) => {
            return <Card key={card.id} id={card.id} taskCallbacks={this.props.taskCallbacks} color={card.color} title={card.title} description={card.description} tasks={card.tasks}/>;
        });

        return (
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
  taskCallbacks:PropTypes.object
};

export default List;
