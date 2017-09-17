import React, { Component } from 'react';
import './App.css';
import { Icon, Header, Segment, List, Button, Modal, Input, Container } from 'semantic-ui-react'
import AWS from 'aws-sdk';
import Album from './Album';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect
} from 'react-router-dom'
import config from './awsconfig';

class Home extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
        albums: [],
        popup: false,
        redirect: false
    };
  }
  
  componentWillMount() {
    const self = this;
    //get albums
    const bucketRegion = config.bucketRegion;
    const IdentityPoolId = config.IdentityPoolId;
    AWS.config.update({
      region: bucketRegion,
      credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IdentityPoolId
      })
    });
    var ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});
    var params = {
      TableName : 'htn2017db',
      KeyConditionExpression: "tag = :y",
      ExpressionAttributeValues: {
          ":y": {S: "0" }
      }
    };
    
    // Call DynamoDB to get the item from the table
    ddb.query(params, function(err, data) {
      if (err) {
        alert(err);
      } else {
        console.log("Success", data);
        var array = [];
        data.Items.forEach(function(item) { array.push(item.name.S)});
        self.setState({albums: array});
      }
    });
  }
  
  newAlbum = () => {
    this.setState({popup: true});
  }
  
  cancel = () => {
    this.setState({popup: false});
  }
  
  submit = () => {
    const input = document.getElementById('newAlbumName').value;
    if ( this.state.albums.indexOf(input) > -1) {
      alert("Album already exists!");
    } else if(/^[a-zA-Z0-9]*$/.test(input) === false) {
      alert("Special characters are not allowed!");
    } else {
      this.setState({redirect: true, album: input});
    }
  }
  
  render() {
    if (this.state.redirect) {
      return (<Redirect to={'/album/' + this.state.album}/>);
    } else {
      return (
        <div style={{ fontSize:'20px', textAlign:'center'}}>
        <Container text>
        <h2>Your Albums</h2>
        {
          this.state.albums.map(album => (
          <List key={album} >
            <List.Item style={{display:'inline', float:'left'}}>
              <List.Icon name='book'/>
              <List.Content><Link to={"/album/"+album} onClick={() => {this.props.albumClick(album)}}>{album}</Link>
              </List.Content>
              <span style={{float:'right'}}><Button as="a" onClick circular color='red' icon='trash' /></span>
            </List.Item>
          </List>
          ))
        }
        <Button color='green' as='a' size='large' onClick={this.newAlbum}>New Album</Button>
        <Modal open={this.state.popup} size='small'>
          <Header content='Create a new album' />
          <Modal.Content>
            <Input id="newAlbumName" fluid placeholder='Enter a new album name'/>
          </Modal.Content>
          <Modal.Actions>
            <Button as="a" color='red' inverted onClick={this.cancel}>
              <Icon name='remove' /> Cancel
            </Button>
            <Button as="a" color='green' inverted onClick={this.submit}>
              <Icon name='checkmark' /> Submit
            </Button>
          </Modal.Actions>
        </Modal>
        </Container>
        </div>
      )
    }
  }
}

class App extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
        header: "Gall-AR-y",
    };
  }
  
  albumClick = (album) => {
    this.setState({header: album});
  }

  render() {
    return (
      <Router>
      <div>
        <Segment inverted>
          <Header as='h2' inverted color='violet' textAlign='center'>
            <span style={{float:'left', marginRight:'-30px'}}><Link to="/" onClick={() => this.albumClick("Gall-AR-y")}><Icon inverted color='violet' name='home'/></Link></span>
            {this.state.header}
          </Header>
          
        </Segment>
        <Route exact path="/" render={()=>(<Home albumClick={this.albumClick}/>)}/>
        <Route path="/album/:id" component={Album}/>
      </div>
      </Router>
    );
  }
}


export default App;
