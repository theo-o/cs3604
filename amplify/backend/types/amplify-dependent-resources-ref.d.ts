export type AmplifyDependentResourcesAttributes = {
    "api": {
        "collectionarchives": {
            "GraphQLAPIIdOutput": "string",
            "GraphQLAPIEndpointOutput": "string"
        }
    },
    "function": {
        "iawav2658176f3PostConfirmation": {
            "Name": "string",
            "Arn": "string",
            "LambdaExecutionRole": "string",
            "Region": "string"
        }
    },
    "auth": {
        "iawav2658176f3": {
            "IdentityPoolId": "string",
            "IdentityPoolName": "string",
            "UserPoolId": "string",
            "UserPoolName": "string",
            "AppClientIDWeb": "string",
            "AppClientID": "string",
            "AppClientSecret": "string"
        },
        "userPoolGroups": {
            "AdminGroupRole": "string",
            "EditorGroupRole": "string",
            "SiteAdminGroupRole": "string",
            "IAWAGroupRole": "string",
            "hokiesGroupRole": "string",
            "SWVAGroupRole": "string",
            "podcastsGroupRole": "string",
            "DefaultGroupRole": "string",
            "federatedGroupRole": "string",
            "testGroupRole": "string"
        }
    },
    "storage": {
        "Collectionmap": {
            "BucketName": "string",
            "Region": "string"
        }
    }
}