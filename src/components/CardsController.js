import React, { useState } from "react";
import { functions } from "lib/firebase";
import { useRecoilValue, useResetRecoilState } from "recoil";
import {
  playersState,
  gameState,
  selectedCardsState,
  userState,
  pilesState,
} from "lib/recoil";

const CardsController = () => {
  const players = useRecoilValue(playersState);
  const piles = useRecoilValue(pilesState);
  const { uid: userId } = useRecoilValue(userState);
  const { gameId } = useRecoilValue(gameState);
  const selectedCards = useRecoilValue(selectedCardsState);
  const resetSelectedCards = useResetRecoilState(selectedCardsState);
  const [faceUp, setFaceUp] = useState(true);
  const [action, setAction] = useState("play");
  const [onTable, setOnTable] = useState(true);
  const [to, setTo] = useState(`hands+${userId}`);

  const handleChange = e => {
    e.preventDefault();
    const { name, value } = e.target;
    switch (name) {
      case "onTable":
        setOnTable(value === "true");
        break;
      case "to":
        setTo(value);
        break;
      case "faceUp":
        setFaceUp(value === "true");
        break;
      case "action": {
        if (value === "play") {
          setOnTable(true);
        }
        if (value === "move") {
          setFaceUp(false);
          setOnTable(false);
        }
        setAction(value);
        break;
      }
      case "faceUp":
        setFaceUp(value === "true");
        break;
      default:
        break;
    }
  };

  const callUpdateCards = async e => {
    e.preventDefault();
    const updateCards = functions.httpsCallable("updateCards");
    const cards = selectedCards;
    const [nextLocation, nextLocationId] = to.split("+");
    const { data } = await updateCards({
      cards,
      gameId,
      faceUp,
      onTable,
      action,
      nextLocation,
      nextLocationId,
    });
    if (data.error) {
      //TODO handle error
      console.log("ERROR DEALING", data.error);
    }
    if (data.success) {
      const { gameId } = data;
      resetSelectedCards();
      console.log("SUCCESSFULLY DEALT");
    }
  };

  if (!selectedCards.length) {
    return null;
  }

  const selectedCardsText = `selected card${
    selectedCards.length > 1 ? "s" : ""
  }`;

  return (
    <div>
      <h2>
        <span>
          <select name="action" value={action} onChange={handleChange}>
            <option value="play">PLAY</option>
            <option value="move">MOVE</option>
            <option value="discard">DISCARD</option>
          </select>
        </span>{" "}
        {selectedCardsText}{" "}
        {action === "play" && (
          <span>
            <select name="faceUp" value={faceUp} onChange={handleChange}>
              <option value={true}>FACE UP</option>
              <option value={false}>FACE DOWN</option>
            </select>
          </span>
        )}
        {action === "move" && (
          <>
            {" to "}
            <span>
              <select name="to" value={to} onChange={handleChange}>
                <option value={`hands+${userId}`}>MY HAND</option>
                {players
                  .filter(p => p.playerId !== userId)
                  .map(player => (
                    <option
                      key={player.playerId}
                      value={`hands+${player.playerId}`}
                    >
                      {player.name}
                    </option>
                  ))}
                {piles.map((pile, i) => (
                  <option key={pile.pileId} value={`pileCards+${pile.pileId}`}>
                    {`PILE: ${i + 1}`}
                  </option>
                ))}
              </select>
            </span>
            {!to.startsWith("hands") && (
              <>
                {onTable ? " on the " : " in their "}
                <span>
                  <select
                    name="onTable"
                    value={onTable}
                    onChange={handleChange}
                  >
                    <option value={true}>TABLE</option>
                    <option value={false}>HAND</option>
                  </select>
                </span>
                {onTable && (
                  <span>
                    <select
                      name="faceUp"
                      value={faceUp}
                      onChange={handleChange}
                    >
                      <option value={true}>FACE UP</option>
                      <option value={false}>FACE DOWN</option>
                    </select>
                  </span>
                )}
              </>
            )}
          </>
        )}
        <span>
          <button onClick={callUpdateCards}>GO</button>
        </span>
      </h2>
    </div>
  );
};

export default CardsController;
