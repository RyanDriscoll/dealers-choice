import React, { useState } from "react";
import CardsList from "./CardsList";
import { useRecoilValue } from "recoil";
import { pilesState, pileCardsState, gameState, userState } from "lib/recoil";

const Table = () => {
  const piles = useRecoilValue(pilesState);
  const pileCards = useRecoilValue(pileCardsState);

  const { gameId, dealer } = useRecoilValue(gameState);
  const { uid } = useRecoilValue(userState);
  const myDeal = uid === dealer;

  return (
    <div>
      <h2>Table</h2>
      <ul>
        {piles.map(({ pileId }, i) => (
          <li key={pileId}>
            <h3>{`PILE: ${i + 1}`}</h3>
            {pileCards[pileId] && (
              <CardsList
                cards={pileCards[pileId]}
                readOnly={!myDeal}
                isDealer={myDeal}
                location={"pileCards"}
                locationId={pileId}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Table;
