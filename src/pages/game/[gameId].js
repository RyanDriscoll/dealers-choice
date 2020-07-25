import React, { useEffect, useRef, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { ref, auth, functions } from "lib/firebase";
import DealController from "components/DealController";
import Players from "components/Players";
import { useRecoilValue, useRecoilState, useSetRecoilState } from "recoil";
import {
  userState,
  gameState,
  playersState,
  cardsState,
  pilesState,
  playerOrderState,
  otherPlayerOrderSelector,
  selectedCardsState,
} from "lib/recoil";
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
  updateCardAction,
  removeCardAction,
} from "store/cards-store";
// import { useUserState } from "context/userContext";

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
  updateCard,
  removeCard,
}) => {
  // const user = useUserState();
  const router = useRouter();
  const { gameId } = router.query;
  // const [game, setGame] = useRecoilState(gameState);
  // const setPlayers = useSetRecoilState(playersState);
  const setPiles = useSetRecoilState(pilesState);
  // const setCards = useSetRecoilState(cardsState);
  // const setSelectedCards = useSetRecoilState(selectedCardsState);

  const [dealer, setDealer] = useState("");
  // const [playerOrder, setPlayerOrder] = useState([]);
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
      const index = po.indexOf(user.userId);
      const newOrder = [...po.slice(index + 1), ...po.slice(0, index)];
      updatePlayerOrder(newOrder);
      // setPlayerOrder(newOrder);
    }
  };

  // const handleDealer = snapshot => {
  //   if (snapshot.exists() && snapshot.key === "dealer") {
  //     setDealer(snapshot.val());
  //   }
  // };

  const listenToGame = () => {
    gameRef.current.on("child_added", snapshot => {
      updateGame({ key: snapshot.key, value: snapshot.val() });
      // setGame(game => ({ ...game, [snapshot.key]: snapshot.val() }));
      handlePlayerOrder(snapshot);
      // handleDealer(snapshot);
    });
    gameRef.current.on("child_changed", snapshot => {
      updateGame({ key: snapshot.key, value: snapshot.val() });
      // setGame(game => ({ ...game, [snapshot.key]: snapshot.val() }));
      handlePlayerOrder(snapshot);
      // handleDealer(snapshot);
    });
    gameRef.current.on("child_removed", snapshot => {
      updateGame({ key: snapshot.key, value: null });
      // setGame(game => ({ ...game, [snapshot.key]: null }));
    });
  };

  const listenToPlayers = () => {
    playersRef.current.on("child_added", snapshot => {
      const player = snapshot.val();
      addPlayer(player);
      // setPlayers(players => ({ ...players, [player.playerId]: player }));
    });

    playersRef.current.on("child_changed", snapshot => {
      const player = snapshot.val();
      updatePlayer(player);
      // setPlayers(players => ({
      //   ...players,
      //   [player.playerId]: { ...players[player.playerId], ...player },
      // }));
    });

    playersRef.current.on("child_removed", snapshot => {
      const playerId = snapshot.child("playerId").val();
      removePlayer(playerId);
      // setPlayers(players => ({ ...players, [playerId]: null }));
    });
  };

  const listenToPiles = () => {
    pilesRef.current.on("child_added", snapshot => {
      setPiles(piles => [...piles, snapshot.val()]);
    });

    pilesRef.current.on("child_changed", snapshot => {
      const pile = snapshot.val();
      setPiles(piles =>
        piles.map(p => (p.pileId === pile.pileId ? { ...p, ...pile } : p))
      );
    });

    pilesRef.current.on("child_removed", snapshot => {
      const pileId = snapshot.child("pileId").val();
      setPiles(piles => piles.filter(p => p.pileId !== pileId));
    });
  };

  const listenToCards = () => {
    cardsRef.current.on("child_added", snapshot => {
      const card = snapshot.val();
      addCard(card);
      // setCards(cards => {
      //   const cardSet = new Set();
      //   cards.forEach(card => cardSet.add(card));
      //   cardSet.add(card);
      //   return Array.from(cardSet);
      // });
    });

    cardsRef.current.on("child_changed", snapshot => {
      const card = snapshot.val();
      updateCard(card);
      // setCards(cards =>
      //   cards.map(c => (c.cardId === card.cardId ? { ...c, ...card } : c))
      // );
    });

    cardsRef.current.on("child_removed", snapshot => {
      const cardId = snapshot.child("cardId").val();
      removeCard(cardId);
      // setCards(cards => cards.filter(c => c.cardId !== cardId));
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
      // setDealer(dealer);
      await ref(`/games/${gameId}/dealer`).set(dealer);
    }

    if (type === "cards-list") {
      const [location, locationId] = destination.droppableId.split("+");
      const card = cards.cardData[draggableId];
      const updatedCard = { ...card, location, locationId };
      updateCard(updatedCard);

      // setCards(cards =>
      //   cards.map(card =>
      //     card.cardId === draggableId ? { ...card, location, locationId } : card
      //   )
      // );
      await ref(`/cards/${gameId}/${draggableId}`).update({
        location,
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
  updateCard: card => dispatch(updateCardAction(card)),
  removeCard: card => dispatch(removeCardAction(card)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Game);
