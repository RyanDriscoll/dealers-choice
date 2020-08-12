import React, {
  createRef,
  useEffect,
  useRef,
  useState,
  Component,
} from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { ref, auth, functions } from "lib/firebase";
import DealController from "components/DealController";
import Players from "components/Players";

import {
  addPlayerAction,
  removePlayerAction,
  updatePlayerAction,
  updatePlayerOrderAction,
} from "store/players-store";
import CardsController from "components/CardsController";
import { useRouter } from "next/router";
import { connect } from "react-redux";
import { updateGameAction } from "store/game-store";
import {
  addCardAction,
  updateCardLocationAction,
  removeCardAction,
  updateCardAction,
} from "store/cards-store";
import {
  addPileAction,
  updatePileLocationAction,
  removePileAction,
  updatePileAction,
} from "store/piles-store";
import { setDraggingAction } from "store/app-store";
import Deck from "components/Deck";

const Game = ({
  user,
  game,
  cardData,
  pileData,
  playerOrder,
  coordinates,
  addPlayer,
  removePlayer,
  updatePlayer,
  updatePlayerOrder,
  updateGame,
  addCard,
  updateCard,
  updateCardLocation,
  removeCard,
  addPile,
  updatePile,
  removePile,
  resetState,
}) => {
  const router = useRouter();
  const { gameId } = router.query;
  const [dealer, setDealer] = useState("");
  const [initialized, setInitialized] = useState(false);
  const gameRef = useRef(null);
  const playersRef = useRef(null);
  const cardsRef = useRef(null);
  const pilesRef = useRef(null);

  useEffect(() => {
    window.addEventListener("beforeunload", onUnmount, false);
    return () => {
      window.removeEventListener("beforeunload", onUnmount, false);
      onUnmount();
    };
  }, []);

  useEffect(() => {
    if (gameId && !initialized) {
      setInitialized(true);
      attachListeners(gameId);
    }
  }, [gameId]);

  const onUnmount = async () => {
    removeListeners();
    await callLeaveGame();
    resetState();
  };

  const callJoinGame = async () => {
    const joinGame = functions.httpsCallable("joinGame");
    const { data } = await joinGame({
      name: "",
      gameId,
    });
    if (data.error) {
      //TODO handle error
    }
    if (data.success) {
      console.log("JOIN SUCCESS!!");
    }
  };

  const callLeaveGame = async () => {
    try {
      if (gameId && user.userId) {
        await ref(`/players/${gameId}/${user.userId}`).update({
          present: false,
        });
      }
    } catch (error) {
      //TODO handle error
      console.log(`$$>>>>: callLeaveGame -> error`, error);
    }
  };

  const attachListeners = id => {
    gameRef.current = ref(`/games/${id}`);
    playersRef.current = ref(`/players/${id}`);
    cardsRef.current = ref(`/cards/${id}`).orderByKey();
    pilesRef.current = ref(`/piles/${id}`).orderByChild("pileId");
    listenToGame();
    listenToPlayers();
    listenToPiles();
    listenToCards();
  };

  const listenToGame = () => {
    gameRef.current.on("child_added", snapshot => {
      updateGame({ key: snapshot.key, value: snapshot.val() });
    });
    gameRef.current.on("child_changed", snapshot => {
      updateGame({ key: snapshot.key, value: snapshot.val() });
    });
    gameRef.current.on("child_removed", snapshot => {
      updateGame({ key: snapshot.key, value: null });
    });
  };

  const listenToPlayers = () => {
    playersRef.current.on("child_added", snapshot => {
      const player = snapshot.val();
      addPlayer(player);
    });

    playersRef.current.on("child_changed", snapshot => {
      const player = snapshot.val();
      updatePlayer(player);
    });

    playersRef.current.on("child_removed", snapshot => {
      const playerId = snapshot.child("playerId").val();
      removePlayer(playerId);
    });
  };

  const listenToPiles = () => {
    pilesRef.current.on("child_added", snapshot => {
      const pile = snapshot.val();
      if (!pileData[pile.pileId]) {
        addPile(pile);
      }
    });

    pilesRef.current.on("child_changed", snapshot => {
      const pile = snapshot.val();
      updatePile(pile);
    });

    pilesRef.current.on("child_removed", snapshot => {
      const pileId = snapshot.child("pileId").val();
      removePile(pileId);
    });
  };

  const listenToCards = () => {
    cardsRef.current.on("child_added", snapshot => {
      const card = snapshot.val();
      if (!cardData[card.cardId]) {
        addCard(card);
      }
    });

    cardsRef.current.on("child_changed", snapshot => {
      const card = snapshot.val();
      updateCard(card);
    });

    cardsRef.current.on("child_removed", snapshot => {
      const cardId = snapshot.child("cardId").val();
      removeCard(cardId);
    });
  };

  const removeListeners = () => {
    if (playersRef.current) playersRef.current.off();
    if (gameRef.current) gameRef.current.off();
    if (cardsRef.current) cardsRef.current.off();
    if (pilesRef.current) pilesRef.current.off();
  };

  const onDragEnd = async ({ draggableId, source, destination, type }) => {
    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "player") {
      const userIndex = playerOrder.indexOf(user.userId);
      let allPlayers = [
        ...playerOrder.slice(userIndex + 1),
        ...playerOrder.slice(0, userIndex),
      ];
      const [toInsert] = allPlayers.splice(source.index, 1);
      allPlayers.splice(destination.index, 0, toInsert);
      allPlayers.push(user.userId);
      const firstPlayerIndex = allPlayers.indexOf(playerOrder[0]);
      allPlayers = [
        ...allPlayers.slice(firstPlayerIndex),
        ...allPlayers.slice(0, firstPlayerIndex),
      ].join(",");
      updateGame({ key: "playerOrder", value: allPlayers });
      await ref(`/games/${gameId}/playerOrder`).set(allPlayers);
    }

    if (type === "dealer") {
      const dealer = destination.droppableId.replace("dealer-", "");
      updateGame({ dealer });
      await ref(`/games/${gameId}/dealer`).set(dealer);
    }

    if (type === "cards-list") {
      let { index } = destination;
      const { locationId, collapsed } = JSON.parse(destination.droppableId);
      if (collapsed) {
        index = 0;
      }
      const updateObj = {
        [`/cards/${gameId}/${draggableId}/locationId`]: locationId,
      };
      if (locationId === user.userId) {
        updateObj[`/cards/${gameId}/${draggableId}/faceUp`] = false;
      }
      updateCardLocation({
        cardId: draggableId,
        locationId,
        index,
      });

      await ref().update(updateObj);
    }
  };

  if (!game || !user) {
    return null;
  }
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!playerOrder.includes(user.userId) && (
          <button onClick={callJoinGame}>JOIN</button>
        )}
        <Players />
        <CardsController />
        <DealController />
      </div>
    </DragDropContext>
  );
};

const mapStateToProps = ({
  user,
  game,
  cards: { cardData },
  piles: { pileData },
}) => ({
  user,
  game,
  playerOrder: game.playerOrder,
  cardData,
  pileData,
});

const mapDispatchToProps = dispatch => ({
  addPlayer: player => dispatch(addPlayerAction(player)),
  removePlayer: playerId => dispatch(removePlayerAction(playerId)),
  updatePlayer: player => dispatch(updatePlayerAction(player)),

  updateGame: data => dispatch(updateGameAction(data)),

  addCard: card => dispatch(addCardAction(card)),
  updateCard: cardData => dispatch(updateCardAction(cardData)),
  updateCardLocation: ({ cardId, locationId, index }) =>
    dispatch(updateCardLocationAction({ cardId, locationId, index })),
  removeCard: cardId => dispatch(removeCardAction(cardId)),

  addPile: pile => dispatch(addPileAction(pile)),
  updatePile: pile => dispatch(updatePileAction(pile)),
  removePile: pileId => dispatch(removePileAction(pileId)),
  resetState: () => dispatch({ type: "RESET_STATE" }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Game);
