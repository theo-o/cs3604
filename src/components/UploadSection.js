import React, { useState, useEffect } from 'react';
import { API, Storage, Auth } from "aws-amplify";
import {withAuthenticator} from "@aws-amplify/ui-react";

function UploadSection() {

    const [currFile, setCurrFile] = useState();
    const [fileIsSelected, setFileIsSelected] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [content, setContent] = useState();
    // const [groups, setGroups] = useState();
    const [errorContent, setErrorContent] = useState();
    const [titleTextValue, setTitleTextValue] = useState("");
    const [descriptionTextValue, setDescriptionTextValue] = useState("");
    const [parentCollectionValue, setParentCollectionValue] = useState("");

    const COURSE_TOPICS = [
        "Intellectual Property", 
        "Privacy", 
        "Commerce", 
        "Internet (ICT)", 
        "Artificial Intelligence"
    ];



    const titleError = (
        <h3>Error: No title specified</h3>
    );

    const noParentCollectionError = (
        <h3>Error: No course topic selected</h3>
    );

    const noFileError = (
        <h3>Error: No file selected</h3>
    );

    const invalidFileError = (
        <h3>Error: Invalid file type</h3>
    );

    const handleFileChange = (e) => {
        setCurrFile(e.target.files[0]);
        setFileIsSelected(true);
    };

    const handleTitleChange = (e) => {
        setTitleTextValue(e.target.value);
    };

    const handleDescriptionChange = (e) => {
        setDescriptionTextValue(e.target.value);
    };

    const handleParentCollectionChange = (e) => {
        setParentCollectionValue(e.target.value);
    };

    function resetFields() {
        setTitleTextValue("");
        setDescriptionTextValue("");
        setParentCollectionValue("");
        setCurrFile(null);
        setFileIsSelected(false);
    }

    function isInvalidFileType(fileName) {
        // TODO: Implement based on file types that can be displayed
        return false;
    }

    async function handleSubmit() {
        var containsError = false;
        setErrorContent();
        if (titleTextValue === "") {
            containsError = true;
            errorContent.push(titleError);
        }
        if (parentCollectionValue === "") {
            containsError = true;
            errorContent.push(noParentCollectionError);
        }
        if (!fileIsSelected) {
            containsError = true;
            errorContent.push(noFileError);
        }
        else if (isInvalidFileType(currFile.name)) {
            containsError = true;
            errorContent.push(invalidFileError);
        }
        if (!containsError) {
            try {
                Storage.configure({
                    customPrefix: {
                        public: 'public/casestudies/'
                    }
                });
                await Storage.put(currFile.name, currFile, {
                    contentType: currFile.type, 
                    completeCallback: (e) => {
                        console.log(e);

                    }, 
                    errorCallback: (err) => {
                        // Alert user of error
                    }
                });
            } 
            catch (err) {
                console.log("Error uploading given file: ", err);
            }

            resetFields();
        }

    }

    async function authUser() {
        try {
            const data = await Auth.currentUserPoolUser();
            const g = data.signInUserSession.accessToken.payload["cognito:groups"];
            const type = 'students';
            if (g && g.indexOf(type) !== -1) {
                console.log("auth!");
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }

        } catch (err) {
            console.log("error: ", err);
            setIsAuthorized(false);
        }
    }

    useEffect(() => {
        authUser();
    }, [])

    useEffect(() => {
        if (isAuthorized) {
            setContent((
                <div>
                    <label htmlFor='casestudy-title'>Title:</label> 
                    <input id ='casestudy-title' type='text' onChange={(e) => handleTitleChange(e)}/>
                    <label htmlFor='casestudy-desc'>Description:</label>
                    <input id='casestudy-desc' type='text' onChange={(e) => handleDescriptionChange(e)}/>
                    <label htmlFor='course-topic-select'>Course Topic:</label>
                    <select id='course-topic-select' onChange={(e) => handleParentCollectionChange(e)}>
                        {COURSE_TOPICS.map(
                            (topic) => <option value={topic}>{topic}</option>
                        )}
                    </select>
                    <label htmlFor='casestudy-file-select'>File:</label>
                    <input id='casestudy-file-select' type='file' name='file' onChange={handleFileChange} />
                    <div>
                        <button onClick={handleSubmit}>Submit Case Study</button>
                    </div>
                </div>
                ))
        } else {
            setContent((
            <div>
                <h1>You are not authorized to access this page.</h1>
            </div>))
        }
    }, [isAuthorized]);

    return (
        <div>
            <div>
                {content}
            </div>
            <div>
                {errorContent}
            </div>
        </div>
    )
}

export default withAuthenticator(UploadSection);