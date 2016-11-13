import React from 'react';
import {render} from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
//import KanbanBoard from './KanbanBoard';
import KanBanBoardContainer from './KanBanBoardContainer';
import KanBanBoard from './KanBanBoard';
import EditCard from './EditCard';
import NewCard from './NewCard';

import './kanban.css';
// let cardList = [
//   {
//     id : 1,
//     title : "Read the Book",
//     description : "I should read the whole book",
//     color : "#BD8D31",
//     status : "in-progress",
//     tasks : []
//   },
//   {
//     id : 2,
//     title : "Write some code",
//     description : "Code along with the samples in the book",
//     color : "#4A7E28",
//     status : "todo",
//     tasks : [
//       {
//         id :1,
//         name :"ContactList Example",
//         done : true
//       },
//       {
//         id :2,
//         name :"Kanban Example",
//         done : false
//       },
//       {
//         id :3,
//         name :"My own expreiments",
//         done : false
//       }
//     ]
//   }
// ];

render((
  <Router history={browserHistory}>
    <Route component={KanBanBoardContainer}>
      <Route path="/" component = {KanBanBoard} />
      <Route path="new" component = {NewCard} />
      <Route path="edit/:card_id" component = {EditCard} />
    </Route>
</Router>), document.getElementById('root'));
//render(<KanbanBoard cards = {cardList} />, document.getElementById('root'));
