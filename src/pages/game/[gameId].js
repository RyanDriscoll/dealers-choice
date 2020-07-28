import React, { useEffect, useRef, useState } from "react";
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
} from "store/cards-store";

const Game = ({
  user,
  game,
  cards,
  addPlayer,
  removePlayer,
  updatePlayer,
  updatePlayerOrder,
  updateGame,
  addCard,
  updateCardLocation,
  removeCard,
}) => {
  const router = useRouter();
  const { gameId } = router.query;
  const [dealer, setDealer] = useState("");
  const gameRef = useRef(null);
  const playersRef = useRef(null);
  const cardsRef = useRef(null);
  const pilesRef = useRef(null);

  useEffect(() => {
    if (user && gameId) {
      attachListeners(gameId);
    }
    return () => {
      removeListeners();
    };
  }, [user, gameId]);

  const attachListeners = id => {
    gameRef.current = ref(`/games/${id}`);
    playersRef.current = ref(`/players/${id}`).orderByKey();
    cardsRef.current = ref(`/cards/${id}`).orderByChild("locationId");
    pilesRef.current = ref(`/piles/${id}`).orderByChild("pileId");
    listenToGame();
    listenToPlayers();
    listenToPiles();
    listenToCards();
  };

  const handlePlayerOrder = snapshot => {
    if (snapshot.exists() && snapshot.key === "playerOrder") {
      const po = snapshot.val().split(",");
      updatePlayerOrder(po.filter(id => id !== user.userId));
    }
  };

  const listenToGame = () => {
    gameRef.current.on("child_added", snapshot => {
      updateGame({ key: snapshot.key, value: snapshot.val() });
      handlePlayerOrder(snapshot);
    });
    gameRef.current.on("child_changed", snapshot => {
      updateGame({ key: snapshot.key, value: snapshot.val() });
      handlePlayerOrder(snapshot);
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
      // setPiles(piles => [...piles, snapshot.val()]);
    });

    pilesRef.current.on("child_changed", snapshot => {
      const pile = snapshot.val();
      // setPiles(piles =>
      //   piles.map(p => (p.pileId === pile.pileId ? { ...p, ...pile } : p))
      // );
    });

    pilesRef.current.on("child_removed", snapshot => {
      const pileId = snapshot.child("pileId").val();
      // setPiles(piles => piles.filter(p => p.pileId !== pileId));
    });
  };

  const listenToCards = () => {
    cardsRef.current.on("child_added", snapshot => {
      const card = snapshot.val();
      addCard(card);
    });

    // cardsRef.current.on("child_changed", snapshot => {
    //   const card = snapshot.val();
    //   updateCardLocation({ card });
    // });

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
      let newOrder = game.playerOrder.split(",");
      newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, draggableId);
      updatePlayerOrder(newOrder);
      newOrder.push(user.userId);
      await ref(`/games/${gameId}/playerOrder`).set(newOrder.join(","));
    }

    if (type === "dealer") {
      const dealer = destination.droppableId.replace("dealer-", "");
      updateGame({ dealer });
      await ref(`/games/${gameId}/dealer`).set(dealer);
    }

    if (type === "cards-list") {
      const { index } = destination;
      const locationId = destination.droppableId;
      const card = cards.cardData[draggableId];
      const updatedCard = { ...card, locationId };
      updateCardLocation({ cardId: draggableId, locationId, index });

      await ref(`/cards/${gameId}/${draggableId}`).update({
        locationId,
      });
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
        <h1>{game.gameId}</h1>
        <Players />
        <CardsController />
        <DealController />
      </div>
    </DragDropContext>
  );
};

const mapStateToProps = ({ user, game, cards }) => ({ user, game, cards });

const mapDispatchToProps = dispatch => ({
  addPlayer: player => dispatch(addPlayerAction(player)),
  removePlayer: playerId => dispatch(removePlayerAction(playerId)),
  updatePlayer: player => dispatch(updatePlayerAction(player)),
  updatePlayerOrder: playerOrder =>
    dispatch(updatePlayerOrderAction(playerOrder)),

  updateGame: data => dispatch(updateGameAction(data)),

  addCard: card => dispatch(addCardAction(card)),
  updateCardLocation: ({ cardId, locationId, index }) =>
    dispatch(updateCardLocationAction({ cardId, locationId, index })),
  removeCard: card => dispatch(removeCardAction(card)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Game);
