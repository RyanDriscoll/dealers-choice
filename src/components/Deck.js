import React from "react";
import CardsList from "./CardsList";

const Deck = ({ tableRef }) => {
  return (
    <div>
      <CardsList
        tableRef={tableRef}
        locationId={"deck"}
        collapsed={true}
        name="DECK"
      />
    </div>
  );
};

export default Deck;
