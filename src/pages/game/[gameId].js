import React, { useEffect, useRef } from "react";
import { ref, auth, functions } from "lib/firebase";
import DealController from "components/DealController";
import Players from "components/Players";
import Table from "components/Table";
import { useRecoilValue, useRecoilState } from "recoil";
import {
  userState,
  gameState,
  playersState,
  handsState,
  pilesState,
  pileCardsState,
} from "lib/recoil";
import CardsController from "components/CardsController";

const Game = ({ gameId }) => {
  const user = useRecoilValue(userState);

  const [game, setGame] = useRecoilState(gameState);
  const [players, setPlayers] = useRecoilState(playersState);
  const [hands, setHands] = useRecoilState(handsState);
  const [piles, setPiles] = useRecoilState(pilesState);
  const [pileCards, setPileCards] = useRecoilState(pileCardsState);
  const gameRef = useRef(ref(`/games/${gameId}`));
  const playersRef = useRef(ref(`/players/${gameId}`));
  const pilesRef = useRef(ref(`/piles/${gameId}`));
  const handRefs = useRef({});
  const pileCardRefs = useRef({});

  useEffect(() => {
    if (user) {
      attachListeners();
    }
    return () => {
      removeListeners();
    };
  }, [user]);

  const attachListeners = () => {
    listenToGame();
    listenToPlayers();
    listenToPiles();
  };

  const listenToGame = () => {
    gameRef.current.on("child_added", snapshot => {
      setGame(game => ({ ...game, [snapshot.key]: snapshot.val() }));
    });
    gameRef.current.on("child_changed", snapshot => {
      setGame(game => ({ ...game, [snapshot.key]: snapshot.val() }));
    });
    gameRef.current.on("child_removed", snapshot => {
      setGame(game => ({ ...game, [snapshot.key]: null }));
    });
  };

  const listenToPlayers = () => {
    playersRef.current.on("child_added", snapshot => {
      const player = snapshot.val();
      setPlayers(players => [...players, player]);
      listenToCards(player.playerId, "hands", handRefs);
    });

    playersRef.current.on("child_removed", snapshot => {
      const playerId = snapshot.child("playerId").val();
      setPlayers(players => players.filter(p => p.playerId !== playerId));
      handRefs.current[playerId].off();
    });
  };

  const listenToPiles = () => {
    pilesRef.current.on("child_added", snapshot => {
      const pile = snapshot.val();
      setPiles(piles => [...piles, pile]);
      listenToCards(pile.pileId, "pileCards", pileCardRefs);
    });

    pilesRef.current.on("child_removed", snapshot => {
      const pileId = snapshot.child("pileId").val();
      setPiles(piles => piles.filter(p => p.pileId !== pileId));
      pileCardRefs.current[pileId].off();
    });
  };

  const listenToCards = (id, stateKey, refObj) => {
    const stateSetter = stateKey === "hands" ? setHands : setPileCards;
    const { uid } = user;
    refObj.current[id] = ref(`/${stateKey}/${gameId}/${id}`);
    refObj.current[id].on("child_added", snapshot => {
      stateSetter(cards => {
        const card = snapshot.val();
        if (!card.faceUp && id !== uid) {
          delete card.suit;
          delete card.value;
        }
        if (cards[id]) {
          return { ...cards, [id]: [...cards[id], card] };
        } else {
          return { ...cards, [id]: [card] };
        }
      });
    });
    refObj.current[id].on("child_changed", snapshot => {
      stateSetter(cards => {
        return {
          ...cards,
          [id]: cards[id].map(c => {
            if (c.cardId === snapshot.child("cardId").val()) {
              const newCard = { ...c };
              newCard.faceUp = snapshot.child("faceUp").val();
              newCard.onTable = snapshot.child("onTable").val();
              if (newCard.faceUp || id === uid) {
                newCard.suit = snapshot.child("suit").val();
                newCard.value = snapshot.child("value").val();
              } else {
                delete newCard.suit;
                delete newCard.value;
              }
              return newCard;
            }
            return c;
          }),
        };
      });
    });
    refObj.current[id].on("child_removed", snapshot => {
      const cardId = snapshot.child("cardId").val();
      stateSetter(cards => {
        const newCards = { ...cards };
        if (newCards[id]) {
          newCards[id] = newCards[id].filter(c => c.cardId !== cardId);
        }
        return newCards;
      });
    });
  };

  const removeListeners = () => {
    playersRef.current.off();
    gameRef.current.off();
    pilesRef.current.off();
    players.forEach(({ playerId }) => {
      handRefs.current[playerId].off();
    });
    piles.forEach(({ pileId }) => {
      pileCardRefs.current[pileId].off();
    });
  };

  if (!game || !user) {
    return null;
  }
  return (
    <div>
      <h1>{game.gameId}</h1>
      <Players />
      <Table />
      <CardsController />
      <DealController />
    </div>
  );
};

Game.getInitialProps = ({ query: { gameId } }) => ({ gameId });

export default Game;
