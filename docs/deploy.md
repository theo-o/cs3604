# Steps to Deploy the DLP Access Demo Website using Amplify Console

## Step 1: Deploy the demo website in the Amplify console
* Go to [Launching the app](https://github.com/VTUL/dlp-access#launching-the-app) section and click the `Deploy to Amplify console` button

    [![amplifybutton](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/VTUL/dlp-access)

    *  Note: This one-click button is using the default branch (`dev`) URL. If you prefer to deploy from other branch, simply update the default branch URL to the branch URL. Take `prod` branch for example, the new deploy link will look like below:
    ```
    https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/VTUL/dlp-access/tree/prod
    ```

* Click the `Connect to GitHub` button

<img src="images/connecttogithub.png" width="80%"/>

* Select service role

    If you don't have a service role, click the `Create new role` button.

    <img src="images/servicerole.png" width="80%"/>

    or select the existing service role.

* Specify the `App name` and `Environment variable`

| Key | Value |
|----------|-------------|
| REACT_APP_REP_TYPE | demo |
| USER_DISABLE_TESTS | true |

<img src="images/deployapp.png" width="80%"/>

* Check the status and click the `Save and Deploy` button

<img src="images/creatingapp.png" width="80%"/>

* Check the deployment status

<img src="images/deploydone.png" width="80%"/>

* Update Rewrites and redirects
1. Update `Source address`
```
</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|ttf)$)([^.]+$)/>
```
2. Update `Target address` to `/index.html`
3. Update `Type` to `200 (Rewrite)`

<img src="images/redirect.png" width="80%"/>

* Check the Backend environments

You will see the name of your backend environment for your application. See below, the backend envionment is `devp`

<img src="images/backendenv.png" width="80%"/>

* Check the deployment in the Cloudformation

In the Cloudformation, select `Stacks` and type the name of the backend environment, e.g., `devp`. You will see the stack deployment, e.g. amplify-iawav2-`devp`-162417

<img src="images/stack.png" width="80%"/>


## Step 2: Add the site configuration data

* Tables in the DynamoDB

There are five tables being created after deployment. Find those tables containing the same name, which is the backend environment. You can list all these tables by searching with the backend environment name. See below:

<img src="images/ddbtables.png" width="80%"/>

1. Site table

This table contains the information of the site configuration data. See a demo site configuation in [site.json](../examples/jsons/site.json). You can add this record(item) through the DynamoDB console or AWS CLI

```
aws dynamodb put-item --table-name Site-yourtablename --item file://site.json
```

You site will up with the basic setting. 

2. Collection table

This table contains the information of the collection data. See a demo collection in [democollection.json](../examples/jsons/democollection.json). You can add this record(item) through the DynamoDB console or AWS CLI

```
aws dynamodb put-item --table-name Collection-yourtablename --item file://democollection.json
```

You will see a `Demo collection` in the collection page

<img src="images/democollection.png" width="80%"/>

Note: currenly you need to also add a record in the `Collectionmap` table in order to display folder tree in the collection page. See a demo collectionmap in [democollectionmap.json](../examples/jsons/democollectionmap.json). You can add this record(item) through the DynamoDB console or AWS CLI

```
aws dynamodb put-item --table-name Collectionmap-yourtablename --item file://democollectionmap.json
```

You can see a `Demo collection` page looks like below

<img src="images/democollectionpage.png" width="80%"/>

3. Archive (item) table

This table contains the information of the archive data. There are some sample archive data in the [examples/jsons](../examples/jsons/) folder. Archive sample data filename start with `archive_`. E.g., [archive_item1.json](../examples/jsons/archive_item1.json). You can add this record(item) through the DynamoDB console or AWS CLI

```
aws dynamodb put-item --table-name Archive-yourtablename --item file://archive_item1.json
```

You will see a list of demo items in the `Demo collection` page

<img src="images/democollectionitems.png" width="80%"/>

Currently the file types we support are images, IIIF images, PDFs, audio(mp3, ogg, wav) , video (mp4, mov, VT Kaltura Video), X3D, etc.

<img src="images/iiifdemo.png" width="80%"/>
