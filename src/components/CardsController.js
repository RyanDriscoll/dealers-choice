import React, { useState, useEffect } from "react";
import { functions, ref } from "lib/firebase";
import { connect } from "react-redux";
import { getSelectedCards } from "store/cards-store";

const CardsController = ({
  userId,
  playerOrder,
  players,
  gameId,
  selectedCards,
}) => {
  const [faceUp, setFaceUp] = useState(true);
  const [action, setAction] = useState("flip");
  const [onTable, setOnTable] = useState(true);
  const [to, setTo] = useState(userId);

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
        if (value === "flip") {
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
    const updateObj = {};
    const locationId = to;
    selectedCards.forEach(cardId => {
      switch (action) {
        case "flip":
          {
            updateObj[`/cards/${gameId}/${cardId}/faceUp`] = faceUp;
            updateObj[`/cards/${gameId}/${cardId}/selected`] = false;
          }
          break;

        case "discard":
          {
            updateObj[`/cards/${gameId}/${cardId}`] = null;
          }
          break;
        // still some messed up logic. going to try to fix with drag/drop
        // case "move":
        //   {
        //     updateObj[`/cards/${gameId}/${cardId}/location`] = onTable
        //       ? "table"
        //       : location;
        //     updateObj[
        //       `/cards/${gameId}/${cardId}/locationId`
        //     ] = locationId;
        //     updateObj[`/cards/${gameId}/${cardId}/faceUp`] = faceUp;
        //   }
        //   break;
        default:
          break;
      }
    });
    await ref().update(updateObj);
    // const updateCards = functions.httpsCallable("updateCards");
    // const cards = selectedCards;
    // const [nextLocation, nextLocationId] = to.split("+");
    // const { data } = await updateCards({
    //   cards,
    //   gameId,
    //   faceUp,
    //   onTable,
    //   action,
    //   nextLocation,
    //   nextLocationId,
    // });
    // if (data.error) {
    //   //TODO handle error
    //   console.log("ERROR DEALING", data.error);
    // }
    // if (data.success) {
    //   const { gameId } = data;
    //   resetSelectedCards();
    //   console.log("SUCCESSFULLY DEALT");
    // }
  };

  if (!selectedCards.length) {
    return null;
  }

  const selectedCardsText = () => {
    return `selected card${selectedCards.length > 1 ? "s" : ""}`;
  };

  return (
    <div>
      <h2>
        <span>
          <select name="action" value={action} onChange={handleChange}>
            <option value="flip">FLIP</option>
            {/* <option value="move">MOVE</option> */}
            <option value="discard">DISCARD</option>
          </select>
        </span>{" "}
        {selectedCardsText()}{" "}
        {action === "flip" && (
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
                <option value={`hand+${userId}`}>MY HAND</option>
                {playerOrder &&
                  playerOrder.map(playerId => {
                    const player = players[playerId];
                    return (
                      <option
                        key={player.playerId}
                        value={`hand+${player.playerId}`}
                      >
                        {player.name}
                      </option>
                    );
                  })}
                {piles.map((pile, i) => (
                  <option key={pile.pileId} value={`pile+${pile.pileId}`}>
                    {`PILE: ${i + 1}`}
                  </option>
                ))}
              </select>
            </span>
            {/* {!to.startsWith("hand") && ( */}
            <>
              {onTable ? " on the " : " in their "}
              <span>
                <select name="onTable" value={onTable} onChange={handleChange}>
                  <option value={true}>TABLE</option>
                  <option value={false}>HAND</option>
                </select>
              </span>
            </>
            {/* )} */}
            {/* {onTable && ( */}
            <span>
              <select name="faceUp" value={faceUp} onChange={handleChange}>
                <option value={true}>FACE UP</option>
                <option value={false}>FACE DOWN</option>
              </select>
            </span>
            {/* )} */}
          </>
        )}
        <span>
          <button onClick={callUpdateCards}>GO</button>
        </span>
      </h2>
    </div>
  );
};

const mapStateToProps = state => {
  const {
    players,
    user: { userId },
    game: { gameId, playerOrder },
  } = state;
  return {
    userId,
    gameId,
    playerOrder,
    players,
    selectedCards: getSelectedCards(state),
  };
};

export default connect(mapStateToProps)(CardsController);
