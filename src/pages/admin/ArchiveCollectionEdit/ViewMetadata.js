import React from "react";

const viewMetadata = React.memo(props => {
  let displayValues = props.values;
  if (props.values && props.isBoolean) {
    displayValues = displayValues.toString();
  }
  if (props.values && props.isMulti) {
    displayValues = (
      <ul>
        {props.values.map((value, index) => (
          <li key={`${props.attribute.field}_${index}`}>{value}</li>
        ))}
      </ul>
    );
  }
  return (
    <div className="view-seciton">
      {props.values && <span className="key">{props.attribute.label}: </span>}
      <span className="wrap-content">{displayValues}</span>
    </div>
  );
});

export default viewMetadata;
