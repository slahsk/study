import React,{Component, PropTypes} from 'react';
import style from './kanban.css';

class CheckList extends Component{

  render(){
    let tasks = this.props.tasks.map((task) => {
      <li key={task.id} className={style.checklist_task}>
        <input type={style.checkbox} defaultChecked={task.done} />
        {task.name}
        <a href="#" className={style.checklist_task} />
      </li>
    });

    return (
      <div className={style.checklist}>
        <ul>{tasks}</ul>
        <input type="text" className={style.checklist_add_task} placeholder="Type then hit Enter to add a task" />
      </div>
    );
  }
};

CheckList.propTypes = {
   cardId : PropTypes.number,
   tasks : PropTypes.arrayOf(PropTypes.object)
};
export default CheckList;
