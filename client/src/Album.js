import React, { Component } from 'react';
import './App.css';
import { Icon, Button, Grid } from 'semantic-ui-react';
import AWS from 'aws-sdk';
import config from './awsconfig';

class Album extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
        images: [],
        albumName: ""
    };
  }
  
  componentWillMount() {
    var Action = window.location.pathname;
    var urlsplit = Action.split("/");
    var albumName = urlsplit[urlsplit.length-1];
    
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
      Key: {
          "tag": {S: "0" },
          "name": {S: albumName }
      }
    };
    // Call DynamoDB to get the item from the table
    ddb.getItem(params, function(err, data) {
      if (err) {
        alert(err);
      } else {
        if (data.Item) { self.setState({albumName:albumName, images: data.Item.images.SS}); }
        else { self.setState({albumName:albumName}) }
      }
    });
  }
  
  chooseImageClick () {
    document.getElementById('input').click();
  }
  
  fileSelect () {
    document.getElementById('filename').innerHTML = document.getElementById('input').files[0].name;
  }
  
  uploadButtonPress = () => {
    const albumBucketName = 'htn2017';
    const bucketRegion = config.bucketRegion;
    const IdentityPoolId = config.IdentityPoolId;
    
    const self = this;
  
    AWS.config.update({
      region: bucketRegion,
      credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IdentityPoolId
      })
    });
    
    var s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      params: {Bucket: albumBucketName}
    });
    
    var file = document.getElementById('input').files[0];
    var fileName = file.name;
    var photoKey = fileName;
    var imageArray = this.state.images;
    imageArray.push(photoKey);
    s3.upload({
      Key: photoKey,
      Body: file,
      ACL: 'public-read'
    }, function(err, data) {
      if (err) {
        return alert('There was an error uploading your photo: ', err.message);
      }
    });
    
    // Create the DynamoDB service object
    var ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});
    var params = {
      TableName: 'htn2017db',
      Item: {
        'tag' : {S: '0'},
        'name' : {S: this.state.albumName},
        'images' : {SS: imageArray}
      }
    };
    
    // Call DynamoDB to add the item to the table
    ddb.putItem(params, function(err, data) {
      if (err) {
        alert(err);
      } else {
        self.setState({images: imageArray});
      }
    });
  }
  
  deleteButtonPress = (imgName) => {
    const bucketRegion = config.bucketRegion;
    const IdentityPoolId = config.IdentityPoolId;
    
    const self = this;
  
    AWS.config.update({
      region: bucketRegion,
      credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IdentityPoolId
      })
    });
    
    var imageArray = this.state.images;
    
    if(imageArray.length <= 1) {
      return alert("There must be at least one image in an album!");
    }
    
    imageArray.splice(imageArray.indexOf(imgName),1);
    
    // Create the DynamoDB service object
    var ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});
    var params = {
      TableName: 'htn2017db',
      Item: {
        'tag' : {S: '0'},
        'name' : {S: this.state.albumName},
        'images' : {SS: imageArray}
      }
    };
    
    // Call DynamoDB to add the item to the table
    ddb.putItem(params, function(err, data) {
      if (err) {
        alert(err);
      } else {
        self.setState({images: imageArray});
      }
    });
    
  }
  
  render() {
    return (
        <div className="App" style={{textAlign: "center"}} >
        <Grid columns={4} container stackable verticalAlign='middle' >
          {
             this.state.images.map(image => (
             <Grid.Column key={image}>
              <Button as="a" style={{position: "absolute", right: 0, bottom: 0, zIndex: 1}} onClick={() => {this.deleteButtonPress(image)}} circular color='red' icon='trash' />
               <p> {image} 
                <div style={{overflow: "hidden", display: 'block', margin: '0 auto', width: 212, height: 212}}>
                  <img alt={image} style={{width: "160%", margin: 'auto'}} src={"https://s3-us-west-2.amazonaws.com/htn2017/"+image}/>
                </div>
               </p>
             </Grid.Column>))
          }
        </Grid>
          <p style={{margin:'25px 0 0 0'}}>
            Upload more images:
          </p>

          <Button color='green' as='a' size='large' onClick={this.chooseImageClick}>Choose an Image</Button>
          <input id='input' type='file' hidden onChange={this.fileSelect}></input>
          <p id='filename'></p>
          <Button basic color='teal' as='a' size='small' onClick={this.uploadButtonPress}><Icon name='upload'/>Upload</Button>
        </div>
    );
  }
}


export default Album;
