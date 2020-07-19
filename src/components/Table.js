import React, { useState } from "react";
import CardsList from "./CardsList";
import { useRecoilValue } from "recoil";
import { pilesState, gameState, userState } from "lib/recoil";

const Table = () => {
  const piles = useRecoilValue(pilesState);
  const { gameId, dealer } = useRecoilValue(gameState);
  const { uid } = useRecoilValue(userState);
  const myDeal = uid === dealer;

  return (
    <div>
      <h2>Table</h2>
      <ul>
        {piles.map(({ pileId, name }, i) => (
          <li key={pileId}>
            <h3>{name}</h3>
            <CardsList
              isDealer={myDeal}
              location={"pile"}
              locationId={pileId}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Table;
