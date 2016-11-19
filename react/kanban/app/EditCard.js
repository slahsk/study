import React, {Component, PropTypes} from 'react';
import CardForm from './CardForm';

class EditCard extends Component{
  componentWillMount() {
    let card = this.props.cards.find((card)=> card.id == this.props.params.card_id);

    //this.setState([...card]);
    this.state = card;
console.log(card);
  }

  handleChange(field,value){
    this.setState({[field]:value});
  }

  handleSubmit(e){
    e.preventDefault();
    console.log(this.state);
    this.props.cardCallbacks.updateCard(this.state);
    this.props.router.push('/');
  }

  handleClose(e){
    this.props.router.push('/');
  }

  render(){
console.log(this)

    return(
      <CardForm draftCard={this.state}
        buttonLabel="Edit card"
        handleChange={this.handleChange.bind(this)}
        handleSubmit={this.handleSubmit.bind(this)}
        handleClose={this.handleClose.bind(this)} />
    );
  }
}

EditCard.propTypes={
  cardCallbacks:PropTypes.object
};

export default EditCard;
