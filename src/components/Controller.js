import React, { useState, useEffect } from "react";
import { functions, ref } from "lib/firebase";
import cn from "classnames";
import { connect } from "react-redux";
import { Collapse, Button, CardBody, Card, Input } from "reactstrap";
import { setActionPanelOpenAction } from "store/app-store";
import styles from "styles/controller.module.scss";

const Controller = ({
  userId,
  players,
  playerOrder,
  gameId,
  dealer,
  actionPanelOpen,
  setActionPanelOpen,
}) => {
  const [numCards, setNumCards] = useState(5);
  const [faceUp, setFaceUp] = useState(false);
  const [to, setTo] = useState("allPlayers");
  const [location, setLocation] = useState("hand");

  const callDealCards = async e => {
    e.preventDefault();
    let locationIds = [];
    if (to === "allPlayers") {
      locationIds = playerOrder;
    } else if (to === "pile") {
      const pileRef = ref(`piles/${gameId}`).push();
      locationIds = [pileRef.key];
      await pileRef.update({
        pileId: pileRef.key,
        name: "PILE",
      });
    } else {
      locationIds = [to];
    }
    const dealCards = functions.httpsCallable("dealCards");
    const { data } = await dealCards({
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

  const callAddPile = async e => {
    e.preventDefault();

    const addPile = functions.httpsCallable("addPile");
    const { data } = await addPile({
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
      default:
        return;
    }
  };

  // if (dealer !== userId) {
  //   return null;
  // }

  return (
    <div
      id={styles.deal_controller}
      className={cn({
        [styles.hidden]: dealer !== userId,
      })}
    >
      <Button
        color="primary"
        onClick={() => {
          setActionPanelOpen(!actionPanelOpen);
        }}
        style={{ marginBottom: "1rem" }}
      >
        {actionPanelOpen ? "HIDE" : "ACTIONS"}
      </Button>
      <Collapse isOpen={actionPanelOpen}>
        <Card>
          <CardBody>
            <div>
              <h2>
                Deal{" "}
                <span>
                  <Input
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
                    {playerOrder.map(playerId => {
                      const player = players[playerId];
                      return (
                        player && (
                          <option key={playerId} value={playerId}>
                            {player.name}
                          </option>
                        )
                      );
                    })}
                  </select>
                </span>
                {to !== "pile" && (
                  <>
                    {location === "table" ? " on the " : " in their "}
                    <span>
                      <select
                        name="location"
                        value={location}
                        onChange={handleChange}
                      >
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

              <Button onClick={callAddPile}>Add Pile</Button>
              <Button onClick={callShuffleDeck}>Shuffle Deck</Button>
              <Button onClick={callClearPlayedCards}>Clear Played Cards</Button>
            </div>
          </CardBody>
        </Card>
      </Collapse>
    </div>
  );
};

const mapStateToProps = ({
  user: { userId },
  game: { gameId, dealer, playerOrder },
  players,
  app: { actionPanelOpen },
}) => ({
  userId,
  playerOrder,
  players,
  dealer,
  gameId,
  actionPanelOpen,
});

const mapDispatchToProps = dispatch => ({
  setActionPanelOpen: bool => dispatch(setActionPanelOpenAction(bool)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Controller);
