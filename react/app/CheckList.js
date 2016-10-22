import React,{Component} from 'react';
import style from './kanban.css';

class CheckList extends Component{
  render(){
    let tasks = this.props.tasks.map((task) => {
      <li className={style.checklist_task}>
        <input type={style.checkbox} defaultChecked={task.done} />
        {task.name}
        <a href="#" className={style.checklist_task} />
      </li>
    });

    return (
      <div className={style.checklist}>
        <ul>{tasks}</ul>
      </div>
    );
  }

}
export default CheckList;
