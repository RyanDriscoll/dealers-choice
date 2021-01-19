import React from "react";
import CardsList from "./CardsList";

const Discard = ({ tableRef }) => {
  return (
    <CardsList
      tableRef={tableRef}
      locationId={"discard"}
      collapsed={true}
      canMoveCard={true}
      canSelectCard={true}
      locked={true}
      name="DISCARD"
      tableSpace
    />
  );
};

export default Discard;
