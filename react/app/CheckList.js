import React,{Component, PropTypes} from 'react';
import style from './kanban.css';

class CheckList extends Component{
  checkInputKeyPress(e){
    if(e.key === 'Enter'){
      this.props.taskCallbacks.add(this.props.cardId, e.target.value);
      e.target.value='';
    }
  }


  render(){
    let tasks = this.props.tasks.map((task) => {
      <li key={task.id} className={style.checklist_task}>
        <input type={style.checkbox} defaultChecked={task.done} onChange={
          this.props.taskCallbacks.toggle.bind(null, this.props.cardId, task.id, task.Index)
        } />
        {task.name}{' '}
        <a href="#" className = {style.checklist_task_remove} onChange={
          this.props.taskCallbacks.delete.bind(null, this.props.cardId, task.id, task.Index)
        } />
      </li>
    });

    return (
      <div className={style.checklist}>
        <ul>{tasks}</ul>
        <input type="text" className={style.checklist_add_task} placeholder="Type then hit Enter to add a task" onKeyPress={this.checkInputKeyPress.bind(this)} />
      </div>
    );
  }
};

CheckList.propTypes = {
   cardId : PropTypes.number,
   tasks : PropTypes.arrayOf(PropTypes.object),
   taskCallbacks:PropTypes.object
};
export default CheckList;
