import React, { Component } from 'react';
import './App.css';
import { Icon, Header, Segment, Button, Modal, Input, Container, Table } from 'semantic-ui-react'
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
    this.refresh();
  }
  
  refresh = () => {
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
  
  deleteAlbum = (albumName) => {
    const self = this;
    const bucketRegion = config.bucketRegion;
    const IdentityPoolId = config.IdentityPoolId;
  
    AWS.config.update({
      region: bucketRegion,
      credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IdentityPoolId
      })
    });
    
    // Create the DynamoDB service object
    var ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});
    var params = {
      TableName: 'htn2017db',
      Key: {
        'tag' : {S: '0'},
        'name' : {S: albumName}
      }
    };
    
    // Call DynamoDB to add the item to the table
    ddb.deleteItem(params, function(err, data) {
      if (err) {
        alert(err);
      } else {
        self.refresh();
      }
    });
  }
  
  render() {
    if (this.state.redirect) {
      return (<Redirect to={'/album/' + this.state.album}/>);
    } else {
      return (
        <div style={{ fontSize:'20px', textAlign:'center'}}>
        <Container text>
        <Table  basic='very' verticalAlign="middle" celled style={{marginTop:'50px', textAlign:'center'}}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Album Name</Table.HeaderCell>
              <Table.HeaderCell>Delete</Table.HeaderCell>
            </Table.Row>
        </Table.Header>
        <Table.Body>
        {
          this.state.albums.map(album => (
          <Table.Row key={album}>
            <Table.Cell><Link to={"/album/"+album} onClick={() => {this.props.albumClick(album)}}>{album}</Link></Table.Cell>
            <Table.Cell><Button as="a"   onClick={() => {this.deleteAlbum(album)}} circular color='red' icon='trash' /></Table.Cell>  
          </Table.Row>
          ))
        }
        </Table.Body>
        </Table>
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

const Download = () => (
  <div>
  <h3 style={{textAlign:'center', lineHeight:'2'}}> To use this application, you must download the .apk and image target. <br/>Click <a href="https://s3-us-west-2.amazonaws.com/htn2017/gallARy.apk">here</a> for the apk and <a href="https://s3-us-west-2.amazonaws.com/htn2017/htn2017Target.jpg">here</a> for the image target.  </h3>
  
  </div>
)

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
            <span style={{float:'left', marginRight:'-30px'}}>
              <Link to="/" onClick={() => this.albumClick("Gall-AR-y")}><Icon inverted color='violet' name='home'/></Link>
              <Link to="/download" onClick={() => this.albumClick("Downloads")}><Icon inverted color='violet' name='download'/></Link>
            </span>
            {this.state.header}
          </Header>
          
        </Segment>
        <Route exact path="/" render={()=>(<Home albumClick={this.albumClick}/>)}/>
        <Route path="/album/:id" component={Album}/>
        <Route path="/download" component={Download}/>
      </div>
      </Router>
    );
  }
}

export default App;
