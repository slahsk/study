import React, {Component} from 'react';
import KanBanBoard from './KanBanBoard';
import update from 'react-addons-update';
import 'whatwg-fetch';
import 'babel-polyfill';


const API_URL = 'http://kanbanapi.pro-react.com';
const API_HEADER = {
  'Content-Type' : 'application/json',
  Authorization : 'any-u-you-like'
};


class KanBanBoardContainer extends Component{
  constructor(){
    super(...arguments);
    this.state = {
      cards : []
    };
  }

  componentDidMount(){
    fetch(API_URL+'/cards',{headers : API_HEADER})
    .then((response) => response.json())
    .then((resoibseData) => {
      this.setState({cards:resoibseData});
      window.state =  this.state;
    })
    .catch((error) => {
      console.log('Error',error);
    })
  }

  addTask(cardId, taskName){
    let cardIndex = this.state.cards.findIndex((card) => card.id === cardId);

    let newTask = {id:Date.now(), name : taskName, done :false};

    let nextState = update(this.state.cards,{
      [cardIndex]:{
        tasks:{$push:[newTask]}
      }
    });

    let prevState = this.state;

    fetch(`${API_URL}/cards/${cardId}/tasks`,{
      method :'post',
      headers:API_HEADER,
      body : JSON.stringify(newTask)
    })
    .then((response) => {
      if(response.ok){
        return response.json();
      }else{
        throw new Error("Server response wann't OK");
      }
    })
    .then((resoibseData) => {
      newTask.id = resoibseData.id;
      this.setState({cards:nextState});
    })
    .catch((error)=>{
      this.setState(prevState)
    });

  }

  deleteTask(cardI, taskId, taskName){
    let nextState = update(this.state.cards,{
      [cardIndex]:{
        task : {$splice : [[taskIndex,1]]}
      }
    });

    let cardIndex = this.state.cards.findIndex((card) => card.id === cardId);

    let prevState = this.state;


    this.setState({cards : nextSate});

    fetch(`${API_URL}/cards/${cardId}/tasks/${taskId}`,{
      method:'delete',
      headers : API_HEADER
    })
    .then((response)=>{
      if(!response.ok){
          throw new Error("Server response wann't OK");
      }
    })
    .catch((error)=>{
      console.log("Fetch error:",error);
      this.setState(prevState);
    })
  }

  toogleTask(cardId, taskId, taskIndex){
    let cardIndex = this.state.cards.findIndex((card)=>card.id == cardId);

    let newDonevalue;

    let nextState = update(this.state.cards,{
      [cardIndex]:{
        tasks : {
          [taskIndex]:{
            done:{
              $apply : (done) => {
                newDonevalue = !done;

                return newDonevalue;

              }
            }

          }
        }
      }
    });

    this.setState({cards:nextState});

    fetch(`${API_URL}/cards/${cardId}/tasks/${taskId}`,{
      method:'put',
      headers : API_HEADER,
      body : JSON.stringify({done:newDonevalue})
    })
  }


  updateCardStatus(cardId, listId){
    let cardIndex = this.state.cards.findIndex((card)=>card.id == cardId);

    let card = this.state.cards[cardIndex];

    if(card.status != listId){
      this.setState(update(this.state,{
        cards : {
          [cardIndex] : {
            status: {$set : listId}
          }
        }
      }));
    }
  }

  updateCardPosition(cardId, afterId){

    if(cardId !== afterId){

      let cardIndex = this.sate.cards.findIndex((card)=>card.id == cardI);

      let card = this.state.cards[cardIndex];

      let afterIndex = this.state.cards.findIndex((card)=> card.id == afterId);

      this.setState(update(this.state,{
        cards:{
          $splice : [
            [cardIndex,1],
            [afterIndex, 0, card]
          ]
        }
      }));

    }

  }

  render(){
    return <KanBanBoard cards = {this.state.cards}
      taskCallbacks={{
        toggle : this.toogleTask.bind(this),
        delete : this.deleteTask.bind(this),
        add : this.addTask.bind(this)
      }}
      cardCallbacks ={{
        updateStatus : this.updateCardStatus.bind(this),
        updatePosition :this.updateCardPosition.bind(this)
      }}

      />
  }
}

export default KanBanBoardContainer;
