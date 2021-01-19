import React from "react";
import CardsList from "./CardsList";

const Deck = ({ tableRef }) => {
  return (
    <CardsList
      tableRef={tableRef}
      locationId={"deck"}
      collapsed={true}
      canMoveCard={true}
      canSelectCard={true}
      locked={true}
      name="DECK"
      tableSpace
    />
  );
};

export default Deck;
