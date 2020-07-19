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
            <div style={{ display: "flex" }}>
              <CardsList
                // isDealer={userId === dealer}
                myHand={userId === playerId}
                location={"hand"}
                locationId={playerId}
              />
              <CardsList
                // isDealer={userId === dealer}
                myHand={userId === playerId}
                location={"table"}
                locationId={playerId}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Players;
