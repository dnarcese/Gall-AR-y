import React, { Component } from 'react';
import './App.css';
import { Button } from 'semantic-ui-react';
import { Icon } from 'semantic-ui-react';
import AWS from 'aws-sdk'

class App extends Component {
  chooseImageClick () {
    document.getElementById('input').click();
  }
  fileSelect () {
    document.getElementById('filename').innerHTML = document.getElementById('input').files[0].name;
  }
  uploadButtonPress () {
    const albumBucketName = 'htn2017';
    const bucketRegion = 'us-west-2';
    const IdentityPoolId = 'us-west-2:f68b1fc5-4a03-4dfe-9f2d-4ce68308dd9a';
  
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
    s3.upload({
      Key: photoKey,
      Body: file,
      ACL: 'public-read'
    }, function(err, data) {
      if (err) {
        return alert('There was an error uploading your photo: ', err.message);
      }
      alert('Successfully uploaded photo.');
    });
 
  
  }
  render() {
    return (
      <div className="App">
        <p className="App-intro">
          To get started, upload an image.
        </p>
        <Button color='green' as='a' size='massive' onClick={this.chooseImageClick}>Choose an Image</Button>
        <input id='input' type='file' hidden onChange={this.fileSelect}></input>
        <p id='filename'></p>
        <Button basic color='teal' as='a' size='large' onClick={this.uploadButtonPress}><Icon name='upload'/>Upload</Button>
      </div>
    );
  }
}

export default App;
