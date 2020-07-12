import React, { Component } from "react";
import { ref, auth, functions } from "lib/firebase";

class Game extends Component {
  constructor(props) {
    super(props);

    this.state = {
      game: null,
      players: [],
    };
  }

  componentDidMount() {
    this.attachListeners();
  }

  attachListeners = () => {
    const { gameId } = this.props;
    this.playersRef = ref(`players/${gameId}`);
    this.playersRef.on("child_added", snapshot => {
      this.setState(({ players }) => ({
        players: [...players, snapshot.val()],
      }));
    });
    this.playersRef.on("child_removed", snapshot => {
      this.setState(({ players }) => ({
        players: players.filter(p => p.playerId !== snapshot.val().playerId),
      }));
    });

    this.gameRef = ref(`games/${gameId}`);
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

  render() {
    return <div>{`GAME ${this.props.gameId}`}</div>;
  }
}

Game.getInitialProps = ({ query: { gameId } }) => ({ gameId });

export default Game;
