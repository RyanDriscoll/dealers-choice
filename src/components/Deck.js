import React from "react";
import CardsList from "./CardsList";

const Deck = ({ tableRef }) => {
  return (
    <div>
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
    </div>
  );
};

export default Deck;
