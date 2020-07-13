import React, { useState } from "react";
import { functions } from "lib/firebase";
import CardsList from "./CardsList";
import { handleResponse } from "utils/helpers";

const Players = ({ players, hands, gameId, userId }) => {
  const callData = {
    gameId,
    location: "hands",
    locationId: userId,
  };

  const play = async (playerId, cardId) => {
    try {
      const revealCard = functions.httpsCallable("revealCard");
      const { data } = await revealCard({
        ...callData,
        cardId,
        play: action === "play",
      });
      handleResponse(data);
    } catch (error) {
      console.error(error);
    }
  };

  const discard = async (playerId, cardId) => {
    try {
      const discardCard = functions.httpsCallable("discardCard");
      const { data } = await discardCard({
        ...callData,
        cardId,
      });
      handleResponse(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Players</h2>
      <ul>
        {players.map(({ playerId, name }) => (
          <li key={playerId}>
            <h3>{name}</h3>
            {hands[playerId] && (
              <CardsList
                discard={discard.bind(null, playerId)}
                play={play.bind(null, playerId)}
                cards={hands[playerId]}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Players;
