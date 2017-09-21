using Amazon;
using Amazon.CognitoIdentity;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class buttonClick : MonoBehaviour {

    private List<string> images;
    private int index = 0;
    private int totalImages = 0;

    private void Start()
    {
        UnityInitializer.AttachToGameObject(this.gameObject);
    }

    public void onPress()
    {
        index++;
        if (index >= totalImages)
        {
            index = 0;
        }
        StartCoroutine(changePic(images[index]));
    }

    public void onLoadPress(InputField inputField)
    {
        Amazon.AWSConfigs.HttpClient = Amazon.AWSConfigs.HttpClientOption.UnityWebRequest;
        var credentials = new CognitoAWSCredentials("us-west-2:f68b1fc5-4a03-4dfe-9f2d-4ce68308dd9a", RegionEndpoint.USWest2);
        Debug.Log(RegionEndpoint.USWest2);
        AmazonDynamoDBClient client = new AmazonDynamoDBClient(credentials, RegionEndpoint.USWest2);
        DynamoDBContext Context = new DynamoDBContext(client);
        Context.LoadAsync<Album>("0", inputField.text,
            (AmazonDynamoDBResult<Album> result) =>
            {
                if (result.Exception != null)
                {
                    Debug.LogException(result.Exception);
                    return;
                }
                images = result.Result.images;
                index = 0;
                totalImages = images.Count;
                StartCoroutine(changePic(images[index]));
            }, null);
    }

    IEnumerator changePic(string urlEnd)
    {
        string url = "https://s3-us-west-2.amazonaws.com/htn2017/" + urlEnd;
        WWW www = new WWW(url);

        // Wait for download to complete
        yield return www;

        //0.000159 height
        //0.000159 weight

        GameObject pic = GameObject.FindWithTag("pic");
        Debug.Log(www.texture.width + "_" + www.texture.height);

        Vector3 rescale = pic.transform.localScale;

        rescale.x = (float)0.000159 * 3 * www.texture.width;
        rescale.z = (float)0.000159 * 3 * www.texture.height;

        pic.transform.localScale = rescale;

        // assign texture
        pic.GetComponent<Renderer>().material.mainTexture = www.texture;
    }

    [DynamoDBTable("htn2017db")]
    public class Album
    {
        [DynamoDBProperty]
        public string name { get; set; }
        [DynamoDBProperty]
        public string tag { get; set; }
        [DynamoDBProperty("images")]
        public List<string> images { get; set; }
    }

}
