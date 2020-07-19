import React, { useState, useEffect } from "react";
import { functions, ref } from "lib/firebase";
import { useRecoilValue, selector } from "recoil";
import { playersState, gameState, userState, pilesState } from "lib/recoil";

const newPileName = selector({
  key: "newPileName",
  get: ({ get }) => `PILE: ${get(pilesState).length + 1}`,
});

const Dealer = () => {
  const { uid } = useRecoilValue(userState);
  const pileName = useRecoilValue(newPileName);
  const players = useRecoilValue(playersState);
  const { gameId, dealer } = useRecoilValue(gameState);
  const [numCards, setNumCards] = useState(5);
  const [faceUp, setFaceUp] = useState(false);
  const [to, setTo] = useState("allPlayers");
  const [location, setLocation] = useState("hand");
  const [selectedDealer, setSelectedDealer] = useState(dealer);

  const callDealCards = async e => {
    e.preventDefault();
    let locationIds = [];
    let newLocation = location;
    if (to === "allPlayers") {
      locationIds = players.map(p => p.playerId);
    } else if (to === "pile") {
      newLocation = to;
      const pileRef = ref(`piles/${gameId}`).push();
      locationIds = [pileRef.key];
      await pileRef.update({
        pileId: pileRef.key,
        name: pileName,
      });
    } else {
      locationIds = [to];
    }
    const dealCards = functions.httpsCallable("dealCards");
    const { data } = await dealCards({
      location: newLocation,
      locationIds,
      numCards,
      faceUp,
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
      console.log("SUCCESSFULLY CHANGED DEALER");
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
      case "location":
        setLocation(value);
        break;
      case "to":
        setTo(value);
      case "selectedDealer":
        setSelectedDealer(value);
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
            <option value="pile">A PILE</option>
            {players.map(player => (
              <option key={player.playerId} value={player.playerId}>
                {player.name}
              </option>
            ))}
          </select>
        </span>
        {to !== "pile" && (
          <>
            {location === "table" ? " on the " : " in their "}
            <span>
              <select name="location" value={location} onChange={handleChange}>
                <option value={"table"}>TABLE</option>
                <option value={"hand"}>HANDS</option>
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
            {players.map(player => (
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
