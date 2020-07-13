import React, { useState } from "react";
import { functions } from "lib/firebase";
import CardsList from "./CardsList";
import { useRecoilValue } from "recoil";
import { pilesState, pileCardsState, gameState, userState } from "lib/recoil";

const Table = () => {
  const piles = useRecoilValue(pilesState);
  const pileCards = useRecoilValue(pileCardsState);
  const { gameId, dealer } = useRecoilValue(gameState);
  const { uid } = useRecoilValue(userState);
  const myDeal = uid === dealer;

  const callData = {
    gameId,
    location: "pileCards",
  };

  const play = async (pileId, cardId) => {
    try {
      const revealCard = functions.httpsCallable("revealCard");
      const { data } = await revealCard({
        ...callData,
        cardId,
        locationId: pileId,
        play: action === "play",
      });
      handleResponse(data);
    } catch (error) {
      console.error(error);
    }
  };

  const discard = async (pileId, cardId) => {
    try {
      const discardCard = functions.httpsCallable("discardCard");
      const { data } = await discardCard({
        ...callData,
        locationId: pileId,
        cardId,
      });
      handleResponse(data);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div>
      <h2>Table</h2>
      <ul>
        {piles.map(({ pileId }, i) => (
          <li key={pileId}>
            <h3>{`PILE: ${i + 1}`}</h3>
            {pileCards[pileId] && (
              <CardsList
                play={play.bind(null, pileId)}
                discard={discard.bind(null, pileId)}
                cards={pileCards[pileId]}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Table;
