import React, { useState } from 'react';
import { API, Storage } from "aws-amplify";

export function UploadSection() {

    const [currFile, setCurrFile] = useState();
    const [fileIsSelected, setFileIsSelected] = useState(false);

    const handleChange = (e) => {
        setCurrFile(e.target.files[0]);
        setFileIsSelected(true);
    };

    async function handleSubmit() {
        if (fileIsSelected) {
            try {
                await Storage.put(currFile.name, currFile, {});
            } 
            catch (err) {
                console.log("Error uploading given file: ", err);
            }
            setFileIsSelected(false);
        }

    }

    return (
        <div>
            <input type='file' name='file' onChange={handleChange} />
            <div>
                <button onClick={handleSubmit}>Submit File</button>
            </div>
        </div>
    )
}