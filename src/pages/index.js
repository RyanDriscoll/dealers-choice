import React, { Component } from "react";
import Head from "next/head";
import { withRouter } from "next/router";
import { ref, auth, functions } from "lib/firebase";

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      gameName: "",
      gameId: "",
      newPlayer: "",
    };
  }
  callCreateGame = async e => {
    e.preventDefault();
    const {
      user: { uid },
    } = this.props;
    const { name, gameName } = this.state;
    const createGame = functions.httpsCallable("createGame");
    const { data } = await createGame({
      name,
      gameName,
    });
    if (data.error) {
      //TODO handle error
    }
    if (data.success) {
      const { gameId } = data;
      this.props.router.push("/game/[gameId]", `/game/${gameId}`);
    }
  };

  callJoinGame = async e => {
    e.preventDefault();
    const {
      user: { uid },
    } = this.props;
    const { newPlayer: name, gameId } = this.state;
    const joinGame = functions.httpsCallable("joinGame");
    const { data } = await joinGame({
      name,
      gameId,
    });
    if (data.error) {
      //TODO handle error
    }
    if (data.success) {
      const { gameId } = data;
      this.props.router.push("/game/[gameId]", `/game/${gameId}`);
    }
  };

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  render() {
    const { name, gameName, gameId, newPlayer } = this.state;
    return (
      <>
        <Head>
          <title>Dealer's Choice</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
          <h1>Dealer's Choice</h1>
          <form>
            <h2>Create Game</h2>
            <div>
              <label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={this.handleChange}
                />
                Player
              </label>
            </div>
            <div>
              <label>
                <input
                  type="text"
                  name="gameName"
                  value={gameName}
                  onChange={this.handleChange}
                />
                Game
              </label>
            </div>
            <div>
              <button onClick={this.callCreateGame}>create game</button>
            </div>
          </form>
          <form>
            <h2>Join Game</h2>
            <div>
              <label>
                <input
                  type="text"
                  name="newPlayer"
                  value={newPlayer}
                  onChange={this.handleChange}
                />
                Player
              </label>
            </div>
            <div>
              <label>
                <input
                  type="text"
                  name="gameId"
                  value={gameId}
                  onChange={this.handleChange}
                />
                Game Id
              </label>
            </div>
            <div>
              <button onClick={this.callJoinGame}>join game</button>
            </div>
          </form>
        </main>

        <footer></footer>
      </>
    );
  }
}

export default withRouter(Home);
