import React from "react";
import CardsList from "./CardsList";

const Deck = () => {
  return (
    <div>
      <CardsList locationId={"deck"} collapsed={true} />
    </div>
  );
};

export default Deck;
