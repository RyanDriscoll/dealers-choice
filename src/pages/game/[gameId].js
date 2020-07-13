import React, { useEffect } from "react";
import { ref, auth, functions } from "lib/firebase";
import Dealer from "components/Dealer";
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

const Game = ({ gameId }) => {
  const user = useRecoilValue(userState);

  const [game, setGame] = useRecoilState(gameState);
  const [players, setPlayers] = useRecoilState(playersState);
  const [hands, setHands] = useRecoilState(handsState);
  const [piles, setPiles] = useRecoilState(pilesState);
  const [pileCards, setPileCards] = useRecoilState(pileCardsState);
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     game: null,
  //     players: [],
  //     hands: {},
  //     piles: [],
  //     pileCards: {},
  //   };
  const gameRef = ref(`/games/${gameId}`);
  const playersRef = ref(`/players/${gameId}`);
  const pilesRef = ref(`/piles/${gameId}`);
  const playerRefs = {};
  const pileRefs = {};
  // }

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
    gameRef.on("child_added", snapshot => {
      setGame(game => ({ ...game, [snapshot.key]: snapshot.val() }));
    });
    gameRef.on("child_changed", snapshot => {
      setGame(game => ({ ...game, [snapshot.key]: snapshot.val() }));
    });
    gameRef.on("child_removed", snapshot => {
      setGame(game => ({ ...game, [snapshot.key]: null }));
    });
  };

  const listenToPlayers = () => {
    playersRef.on("child_added", snapshot => {
      const player = snapshot.val();
      setPlayers(players => [...players, player]);
      listenToCards(player.playerId, "hands");
    });

    playersRef.on("child_removed", snapshot => {
      const playerId = snapshot.child("playerId").val();
      setPlayers(players => players.filter(p => p.playerId !== playerId));
      playerRefs[playerId].off();
    });
  };

  const listenToPiles = () => {
    pilesRef.on("child_added", snapshot => {
      const pile = snapshot.val();
      setPiles(piles => [...piles, pile]);
      listenToCards(pile.pileId, "pileCards");
    });

    pilesRef.on("child_removed", snapshot => {
      const pileId = snapshot.child("pileId").val();
      setPiles(piles => piles.filter(p => p.pileId !== pileId));
      pileRefs[pileId].off();
    });
  };

  const listenToCards = (id, stateKey) => {
    const stateSetter = stateKey === "hands" ? setHands : setPileCards;
    const { uid } = user;
    playerRefs[id] = ref(`/${stateKey}/${gameId}/${id}`);
    playerRefs[id].on("child_added", snapshot => {
      let newCard = {
        visible: snapshot.child("visible").val(),
        cardId: snapshot.child("cardId").val(),
      };
      if (newCard.visible || id === uid) {
        newCard = snapshot.val();
        if (id === uid) {
          newCard.visible = true;
        }
      }
      stateSetter(cards => {
        const newCards = { ...cards };
        if (newCards[id]) {
          newCards[id] = [...newCards[id], newCard];
        } else {
          newCards[id] = [newCard];
        }
        return newCards;
      });
    });
    playerRefs[id].on("child_changed", snapshot => {
      let newCard = {
        visible: snapshot.child("visible").val(),
        cardId: snapshot.child("cardId").val(),
      };
      if (newCard.visible || id === uid) {
        newCard = snapshot.val();
        if (id === uid) {
          newCard.visible = true;
        }
      }
      stateSetter(cards => {
        const newCards = { ...cards };
        if (newCards[id]) {
          const newHand = [...newCards[id]];
          const index = newHand.findIndex(c => c.cardId === newCard.cardId);
          newHand[index] = newCard;
          newCards[id] = newHand;
        }
        return newCards;
      });
    });
    playerRefs[id].on("child_removed", snapshot => {
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

  const listenToPileCards = () => {
    pilesRef.on("child_added", snapshot => {
      setPiles(piles => [...piles, snapshot.val()]);
    });
    pilesRef.on("child_changed", snapshot => {
      setPiles(piles => {
        const pile = snapshot.val();
        const newPiles = [...piles];
        const index = newPiles.indexOf(p => p.pileId === pile.pileId);
        newPiles[index] = pile;
        return newPiles;
      });
    });
    pilesRef.on("child_removed", snapshot => {
      setPiles(piles => {
        const pileId = snapshot.child("pileId").val();
        return piles.filter(p => p.pileId !== pileId);
      });
    });
  };

  const removeListeners = () => {
    playersRef.off();
    gameRef.off();
    pilesRef.off();
    players.forEach(({ playerId }) => {
      playerRefs[playerId].off();
    });
    piles.forEach(({ pileId }) => {
      pileRefs[pileId].off();
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
      <Dealer />
    </div>
  );
};

Game.getInitialProps = ({ query: { gameId } }) => ({ gameId });

export default Game;
