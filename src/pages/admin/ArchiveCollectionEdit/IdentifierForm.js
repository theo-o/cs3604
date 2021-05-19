import React, { useEffect, useState } from "react";
import { Form } from "semantic-ui-react";
import ArchiveForm from "./ArchiveForm";
import CollectionForm from "./CollectionForm";
import "../../../css/adminForms.scss";

const IdentifierForm = props => {
  const { type } = props;
  const [enteredIdentifier, setEnteredIdentifier] = useState("");
  const [identifier, setIdentifier] = useState(null);
  const [newCollection, setNewCollection] = useState(false);

  useEffect(() => {
    setEnteredIdentifier("");
    setIdentifier(null);
  }, [type]);

  const submitIdentifierHandler = () => {
    setIdentifier(enteredIdentifier);
  };

  const newCollectionHandler = () => {
    setNewCollection(true);
  };

  const newCollectionButton = () => {
    let collectionButtonSection = null;
    if (props.type === "collection") {
      collectionButtonSection = (
        <div>
          <p>Or:</p>
          <Form.Button onClick={newCollectionHandler}>
            Create Collection
          </Form.Button>
        </div>
      );
    }
    return collectionButtonSection;
  };

  let form = null;
  if (identifier) {
    if (props.type === "archive") {
      form = <ArchiveForm identifier={identifier} />;
    } else if (props.type === "collection") {
      form = <CollectionForm identifier={identifier} />;
    }
  } else if (!identifier && newCollection) {
    form = <CollectionForm identifier={null} newCollection={newCollection} />;
  }

  return (
    <div className="col-lg-9 col-sm-12 admin-content">
      <Form>
        <Form.Field>
          <label>Please enter valid identifier:</label>
          <input
            type="text"
            onChange={event => setEnteredIdentifier(event.target.value)}
            value={enteredIdentifier}
          />
        </Form.Field>
        <Form.Button onClick={submitIdentifierHandler}>Confirm</Form.Button>
        {newCollectionButton()}
      </Form>
      {form}
    </div>
  );
};

export default IdentifierForm;
