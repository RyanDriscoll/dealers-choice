import React, { useEffect, useRef } from "react";
import { ref, auth, functions } from "lib/firebase";
import DealController from "components/DealController";
import Players from "components/Players";
import Table from "components/Table";
import { useRecoilValue, useRecoilState, useSetRecoilState } from "recoil";
import {
  userState,
  gameState,
  playersState,
  cardsState,
  pilesState,
} from "lib/recoil";
import CardsController from "components/CardsController";
import { useRouter } from "next/router";

const Game = () => {
  const user = useRecoilValue(userState);
  const router = useRouter();
  const { gameId } = router.query;
  const [game, setGame] = useRecoilState(gameState);
  const setPlayers = useSetRecoilState(playersState);
  const setPiles = useSetRecoilState(pilesState);
  const setCards = useSetRecoilState(cardsState);
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
    listenToCards();
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
      setPlayers(players => [...players, snapshot.val()]);
    });

    playersRef.current.on("child_changed", snapshot => {
      const player = snapshot.val();
      setPlayers(players =>
        players.map(p =>
          p.playerId === player.playerId ? { ...p, ...player } : p
        )
      );
    });

    playersRef.current.on("child_removed", snapshot => {
      const playerId = snapshot.child("playerId").val();
      setPlayers(players => players.filter(p => p.playerId !== playerId));
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
      setCards(cards => [...cards, card]);
    });

    cardsRef.current.on("child_changed", snapshot => {
      const card = snapshot.val();
      setCards(cards =>
        cards.map(c => (c.cardId === card.cardId ? { ...c, ...card } : c))
      );
    });

    cardsRef.current.on("child_removed", snapshot => {
      const cardId = snapshot.child("cardId").val();
      setCards(cards => cards.filter(c => c.cardId !== cardId));
    });
  };

  // const listenToPiles = () => {
  //   pilesRef.current.on("child_added", snapshot => {
  //     const pile = snapshot.val();
  //     setPiles(piles => [...piles, pile]);
  //     listenToCards(pile.pileId, "pileCards", pileCardRefs);
  //   });

  //   pilesRef.current.on("child_removed", snapshot => {
  //     const pileId = snapshot.child("pileId").val();
  //     setPiles(piles => piles.filter(p => p.pileId !== pileId));
  //     pileCardRefs.current[pileId].off();
  //   });
  // };

  // const listenToCards = (id, stateKey, refObj) => {
  //   const stateSetter = stateKey === "hands" ? setHands : setPileCards;
  //   const { uid } = user;
  //   refObj.current[id] = ref(`/${stateKey}/${gameId}/${id}`);
  //   refObj.current[id].on("child_added", snapshot => {
  //     stateSetter(cards => {
  //       const card = snapshot.val();
  //       if (!card.faceUp && id !== uid) {
  //         delete card.suit;
  //         delete card.value;
  //       }
  //       if (cards[id]) {
  //         return { ...cards, [id]: [...cards[id], card] };
  //       } else {
  //         return { ...cards, [id]: [card] };
  //       }
  //     });
  //   });
  //   refObj.current[id].on("child_changed", snapshot => {
  //     stateSetter(cards => {
  //       return {
  //         ...cards,
  //         [id]: cards[id].map(c => {
  //           if (c.cardId === snapshot.child("cardId").val()) {
  //             const newCard = { ...c };
  //             newCard.faceUp = snapshot.child("faceUp").val();
  //             newCard.onTable = snapshot.child("onTable").val();
  //             if (newCard.faceUp || id === uid) {
  //               newCard.suit = snapshot.child("suit").val();
  //               newCard.value = snapshot.child("value").val();
  //             } else {
  //               delete newCard.suit;
  //               delete newCard.value;
  //             }
  //             return newCard;
  //           }
  //           return c;
  //         }),
  //       };
  //     });
  //   });
  //   refObj.current[id].on("child_removed", snapshot => {
  //     const cardId = snapshot.child("cardId").val();
  //     stateSetter(cards => {
  //       const newCards = { ...cards };
  //       if (newCards[id]) {
  //         newCards[id] = newCards[id].filter(c => c.cardId !== cardId);
  //       }
  //       return newCards;
  //     });
  //   });
  // };

  const removeListeners = () => {
    if (playersRef.current) playersRef.current.off();
    if (gameRef.current) gameRef.current.off();
    if (cardsRef.current) cardsRef.current.off();
    // players.forEach(({ playerId }) => {
    //   handRefs.current[playerId].off();
    // });
    // piles.forEach(({ pileId }) => {
    //   pileCardRefs.current[pileId].off();
    // });
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

export default Game;
