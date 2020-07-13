import React, { Component } from "react";
import { ref, auth, functions } from "lib/firebase";
import Dealer from "components/Dealer";
import Players from "components/Players";
import Table from "components/Table";

class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      game: null,
      players: [],
      hands: {},
      piles: [],
      pileCards: {},
    };
    this.gameRef = ref(`/games/${props.gameId}`);
    this.playersRef = ref(`/players/${props.gameId}`);
    this.pilesRef = ref(`/piles/${props.gameId}`);
  }

  componentDidMount() {
    this.attachListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  attachListeners = () => {
    this.listenToGame();
    this.listenToPlayers();
    this.listenToPiles();
  };

  listenToGame = () => {
    this.gameRef.on("child_added", snapshot => {
      this.setState(({ game }) => ({
        game: { ...game, [snapshot.key]: snapshot.val() },
      }));
    });

    this.gameRef.on("child_changed", snapshot => {
      this.setState(({ game }) => ({
        game: { ...game, [snapshot.key]: snapshot.val() },
      }));
    });

    this.gameRef.on("child_removed", snapshot => {
      this.setState(({ game }) => ({
        game: { ...game, [snapshot.key]: null },
      }));
    });
  };

  listenToPlayers = () => {
    this.playersRef.on("child_added", snapshot => {
      const player = snapshot.val();
      this.setState(({ players }) => ({
        players: [...players, player],
      }));
      this.listenToCards(player.playerId, "hands");
    });

    this.playersRef.on("child_removed", snapshot => {
      const playerId = snapshot.child("playerId").val();
      this.setState(({ players }) => ({
        players: players.filter(p => p.playerId !== playerId),
      }));
      this[playerId].off();
    });
  };

  listenToPiles = () => {
    this.pilesRef.on("child_added", snapshot => {
      const pile = snapshot.val();
      this.setState(({ piles }) => ({
        piles: [...piles, pile],
      }));
      this.listenToCards(pile.pileId, "pileCards");
    });

    this.pilesRef.on("child_removed", snapshot => {
      const pileId = snapshot.child("pileId").val();
      this.setState(({ piles }) => ({
        piles: piles.filter(p => p.pileId !== pileId),
      }));
      this[pileId].off();
    });
  };

  listenToCards = (id, stateKey) => {
    const {
      gameId,
      user: { uid },
    } = this.props;
    this[id] = ref(`/${stateKey}/${gameId}/${id}`);
    this[id].on("child_added", snapshot => {
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
      this.setState(prevState => {
        const newCards = { ...prevState[stateKey] };
        if (newCards[id]) {
          newCards[id] = [...newCards[id], newCard];
        } else {
          newCards[id] = [newCard];
        }
        return { [stateKey]: newCards };
      });
    });
    this[id].on("child_changed", snapshot => {
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
      this.setState(prevState => {
        const newCards = { ...prevState[stateKey] };
        if (newCards[id]) {
          const newHand = [...newCards[id]];
          const index = newHand.findIndex(c => c.cardId === newCard.cardId);
          newHand[index] = newCard;
          newCards[id] = newHand;
        }
        return { [stateKey]: newCards };
      });
    });
    this[id].on("child_removed", snapshot => {
      const cardId = snapshot.child("cardId").val();
      this.setState(prevState => {
        const newCards = { ...prevState[stateKey] };
        if (newCards[id]) {
          newCards[id] = newCards[id].filter(c => c.cardId !== cardId);
        }
        return { [stateKey]: newCards };
      });
    });
  };

  listenToPileCards = () => {
    this.pilesRef.on("child_added", snapshot => {
      this.setState(({ piles }) => ({
        piles: [...piles, snapshot.val()],
      }));
    });
    this.pilesRef.on("child_changed", snapshot => {
      this.setState(({ piles }) => {
        const pile = snapshot.val();
        const newPiles = [...piles];
        const index = newPiles.indexOf(p => p.pileId === pile.pileId);
        newPiles[index] = pile;
        return {
          piles: newPiles,
        };
      });
    });
    this.pilesRef.on("child_removed", snapshot => {
      this.setState(({ piles }) => {
        const pileId = snapshot.child("pileId").val();
        return {
          piles: piles.filter(p => p.pileId !== pileId),
        };
      });
    });
  };

  removeListeners = () => {
    const { players, piles } = this.state;
    this.playersRef.off();
    this.gameRef.off();
    this.pilesRef.off();
    players.forEach(({ playerId }) => {
      this[playerId].off();
    });
    piles.forEach(({ pileId }) => {
      this[pileId].off();
    });
  };

  render() {
    const { players, game, hands, piles, pileCards } = this.state;
    const { user } = this.props;
    if (!game) {
      return null;
    }
    return (
      <div>
        <h1>{game.gameId}</h1>
        <Players
          players={players}
          userId={user.uid}
          hands={hands}
          gameId={game.gameId}
        />
        <Table
          myDeal={game.dealer === user.uid}
          piles={piles}
          pileCards={pileCards}
          gameId={game.gameId}
        />
        <Dealer players={players} gameId={game.gameId} />
      </div>
    );
  }
}

Game.getInitialProps = ({ query: { gameId } }) => ({ gameId });

export default Game;
