import React, {Component} from 'react';
import 'whatwg-fetch';

class RepoDetails extends Component{
  // constructor(){
  //   super(...arguments);
  //   this.state = {
  //     repository : {}
  //   };
  // }

  // fetchData(repo_name){
  //   fetch(`http://api.github.com/repos/pro-react/${repo_name}`)
  //   .then((response) => response.json())
  //   .then((responseData) => {
  //     this.setState({repository : responseData});
  //   })
  // }
  //
  // componentDidMount(){
  //   let repo_name = this.props.params.repo_name;
  //
  //   this.fetchData(repo_name);
  // }
  //
  // componentWillReceiveProps(nextProps){
  //   let repo_name = nextProps.params.repo_name;
  //
  //   this.fetchData(repo_name);
  // }

  renderRepository(){
    let repository = this.props.repositories.find((repo) => repo.name === this.props.params.repo_name);

    let start = [];
    for (var i=0; i < repository.stargazers_count; i++){
      start.push('★');
    }

    return (
      <div>
        <h2>{repository.name}</h2>
        <p>{repository.description}</p>
        <span>{start}</span>
      </div>
    );


  }

  render(){
    if(this.props.repositories.length > 0){
      return this.renderRepository();
    }else{
      return <h4>Loading...</h4>
    }
    // let start = [];
    // for (var i=0; i < this.state.repository.stargazers_count; i++){
    //   start.push('★');
    // }
    //
    // return (
    //   <div>
    //     <h2>{this.state.repository.name}</h2>
    //     <p>{this.state.repository.description}</p>
    //     <span>{start}</span>
    //   </div>
    // );

  }
}

export default RepoDetails;
