import React, { useState, useEffect } from 'react';
import { API, Storage, Auth } from "aws-amplify";
import {withAuthenticator} from "@aws-amplify/ui-react";

function UploadSection() {

    const [currFile, setCurrFile] = useState();
    const [fileIsSelected, setFileIsSelected] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(true);
    // const [groups, setGroups] = useState();

    const handleChange = (e) => {
        setCurrFile(e.target.files[0]);
        setFileIsSelected(true);
    };

    async function handleSubmit() {
        if (fileIsSelected) {
            try {
                Storage.configure({
                    customPrefix: {
                        public: 'public/casestudies/'
                    }
                });
                await Storage.put(currFile.name, currFile, {
                    contentType: currFile.type
                });
            } 
            catch (err) {
                console.log("Error uploading given file: ", err);
            }
            // TODO: Update archives
            setFileIsSelected(false);
        }

    }

    // async function authUser() {
    //     try {
    //         const data = await Auth.currentUserPoolUser();
    //         const g = data.signInUserSession.accessToken.payload["cognito:groups"];
    //         setGroups(g);
    //         const type = process.env.STUDENT_AUTH;
    //         if (g && g.indexOf(type) !== -1) {
    //             setIsAuthorized(true);
    //         } else {
    //             setIsAuthorized(false);
    //         }

    //     } catch (err) {
    //         console.log("error: ", err);
    //         setIsAuthorized(false);
    //     }
    // }

    // useEffect(() => {
    //     authUser();
    // }, [])

    return (
        <div>
        {isAuthorized ? (
            <div>
                <input type='file' name='file' onChange={handleChange} />
                <div>
                    <button onClick={handleSubmit}>Submit File</button>
                </div>
            </div>
            ) : (
                <div>
                    <h1>You are not authorized to access this page.</h1>
                </div>
            )}
        </div>
    )
}

export default withAuthenticator(UploadSection);