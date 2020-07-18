import React, { useState } from "react";
import { functions } from "lib/firebase";
import CardsList from "./CardsList";
import { handleResponse } from "utils/helpers";
import { useRecoilValue } from "recoil";
import { userState, gameState, handsState, playersState } from "lib/recoil";

const Players = () => {
  const { uid: userId } = useRecoilValue(userState);
  const { gameId, dealer } = useRecoilValue(gameState);
  // const hands = useRecoilValue(handsState);
  const players = useRecoilValue(playersState);

  return (
    <div>
      <h2>Players</h2>
      <ul>
        {players.map(({ playerId, name }) => (
          <li key={playerId}>
            <h3>{name}</h3>
            {/* {hands[playerId] && ( */}
            <CardsList
              // cards={hands[playerId]}
              readOnly={userId !== playerId}
              isDealer={userId === dealer}
              location={"hands"}
              locationId={playerId}
            />
            {/* )} */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Players;
