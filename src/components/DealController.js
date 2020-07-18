import React, { useState, useEffect } from "react";
import { functions } from "lib/firebase";
import { useRecoilValue } from "recoil";
import { playersState, gameState, userState } from "lib/recoil";

const Dealer = () => {
  const { uid } = useRecoilValue(userState);
  const players = useRecoilValue(playersState);
  const { gameId, dealer } = useRecoilValue(gameState);
  const [numCards, setNumCards] = useState(5);
  const [faceUp, setFaceUp] = useState(false);
  const [onTable, setOnTable] = useState(false);
  const [to, setTo] = useState("allPlayers");
  const [selectedDealer, setSelectedDealer] = useState("");

  // useEffect(() => {
  //   // const otherPlayers = players.filter(p => p.playerId !== uid);
  //   // if (otherPlayers.length && !selectedDealer) {
  //   //   setSelectedDealer(otherPlayers[0].playerId);
  //   // }
  //   if (players.length) {
  //     setSelectedDealer(players[0].playerId);
  //   }
  // }, [players]);

  const callDealCards = async e => {
    e.preventDefault();
    const dealCards = functions.httpsCallable("dealCards");
    const { data } = await dealCards({
      to,
      numCards,
      faceUp,
      onTable,
      gameId,
    });
    if (data.error) {
      //TODO handle error
      console.log("ERROR DEALING", data.error);
    }
    if (data.success) {
      const { gameId } = data;
      console.log("SUCCESSFULLY DEALT");
    }
  };

  const callChangeDealer = async e => {
    e.preventDefault();
    const changeDealer = functions.httpsCallable("changeDealer");
    console.log(`$$>>>>: selectedDealer`, selectedDealer);
    const { data } = await changeDealer({
      gameId,
      dealer: selectedDealer,
    });
    if (data.error) {
      //TODO handle error
      console.log("ERROR DEALING");
    }
    if (data.success) {
      const { gameId } = data;
      console.log("SUCCESSFULLY SHUFFLED");
    }
  };

  const callShuffleDeck = async e => {
    e.preventDefault();
    const shuffleDeck = functions.httpsCallable("shuffleDeck");
    const { data } = await shuffleDeck({
      gameId,
    });
    if (data.error) {
      //TODO handle error
      console.log("ERROR DEALING");
    }
    if (data.success) {
      const { gameId } = data;
      console.log("SUCCESSFULLY SHUFFLED");
    }
  };

  const callClearPlayedCards = async e => {
    e.preventDefault();
    const clearPlayedCards = functions.httpsCallable("clearPlayedCards");
    const { data } = await clearPlayedCards({
      gameId,
    });
    if (data.error) {
      //TODO handle error
      console.log("ERROR DEALING");
    }
    if (data.success) {
      const { gameId } = data;
      console.log("SUCCESSFULLY CLEARED");
    }
  };

  const handleChange = e => {
    e.preventDefault();
    const { name, value } = e.target;
    switch (name) {
      case "numCards":
        setNumCards(+value);
        break;
      case "faceUp":
        setFaceUp(value === "true");
        break;
      case "onTable":
        setOnTable(value === "true");
        break;
      case "to":
        setTo(value);
      default:
        return;
    }
  };

  if (dealer !== uid) {
    return null;
  }

  return (
    <div>
      <h2>
        Deal{" "}
        <span>
          <input
            type="number"
            name="numCards"
            value={numCards}
            min="1"
            onChange={handleChange}
          />
        </span>{" "}
        {numCards > 1 ? "cards" : "card"}{" "}
        <span>
          <select name="faceUp" value={faceUp} onChange={handleChange}>
            <option value={true}>FACE UP</option>
            <option value={false}>FACE DOWN</option>
          </select>
        </span>{" "}
        to{" "}
        <span>
          <select name="to" value={to} onChange={handleChange}>
            <option value="allPlayers">ALL THE PLAYERS</option>
            <option value="table">A PILE</option>
            {players.map(player => (
              <option key={player.playerId} value={player.playerId}>
                {player.name}
              </option>
            ))}
          </select>
        </span>
        {to !== "table" && (
          <>
            {onTable ? " on the " : " in their "}
            <span>
              <select name="onTable" value={onTable} onChange={handleChange}>
                <option value={true}>TABLE</option>
                <option value={false}>HANDS</option>
              </select>
            </span>
          </>
        )}
        <span>
          <button onClick={callDealCards}>GO</button>
        </span>
      </h2>
      <h2>
        Pass deal to{" "}
        <span>
          <select
            name="selectedDealer"
            value={selectedDealer}
            onChange={handleChange}
          >
            {players
              .filter(p => p.playerId !== uid)
              .map(player => (
                <option key={player.playerId} value={player.playerId}>
                  {player.name}
                </option>
              ))}
          </select>
        </span>
        <span>
          <button onClick={callChangeDealer}>GO</button>
        </span>
      </h2>
      <button onClick={callShuffleDeck}>Shuffle Deck</button>
      <button onClick={callClearPlayedCards}>Clear Played Cards</button>
    </div>
  );
};

export default Dealer;
