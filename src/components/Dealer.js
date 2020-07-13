import React, { useState } from "react";
import { functions } from "lib/firebase";

const Dealer = ({ players, gameId }) => {
  const [numCards, setNumCards] = useState(1);
  const [visible, setVisible] = useState(false);
  const [to, setTo] = useState("allPlayers");

  const callDealCards = async e => {
    e.preventDefault();
    const dealCards = functions.httpsCallable("dealCards");
    const { data } = await dealCards({
      to,
      numCards,
      visible,
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

  const handleChange = e => {
    e.preventDefault();
    const { name, value } = e.target;
    switch (name) {
      case "numCards":
        setNumCards(+value);
        break;
      case "visible":
        setVisible(value === "true");
        break;
      case "to":
        setTo(value);
      default:
        return;
    }
  };

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
          <select name="visible" value={visible} onChange={handleChange}>
            <option value={true}>FACE UP</option>
            <option value={false}>FACE DOWN</option>
          </select>
        </span>{" "}
        to{" "}
        <span>
          <select name="to" value={to} onChange={handleChange}>
            <option value="allPlayers">ALL PLAYERS</option>
            <option value="table">THE TABLE</option>
            {players.map(player => (
              <option key={player.playerId} value={player.playerId}>
                {player.name}
              </option>
            ))}
          </select>
        </span>
        <span>
          <button onClick={callDealCards}>Deal Cards</button>
        </span>
      </h2>
      <button onClick={callShuffleDeck}>Shuffle Deck</button>
    </div>
  );
};

export default Dealer;
