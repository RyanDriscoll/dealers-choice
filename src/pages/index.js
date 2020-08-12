import React, { useState } from "react";
import { useRouter } from "next/router";
import { functions, ref } from "lib/firebase";
import { connect } from "react-redux";

const Home = ({ userId }) => {
  const [name, setName] = useState("");
  const [gameName, setGameName] = useState("");
  const [gameId, setGameId] = useState("");
  const [newPlayer, setNewPlayer] = useState("");
  const router = useRouter();

  // const callCreateGame = async e => {
  //   e.preventDefault();
  //   const createGame = functions.httpsCallable("createGame");
  //   const { data } = await createGame({
  //     name,
  //     gameName,
  //   });
  //   if (data.error) {
  //     //TODO handle error
  //   }
  //   if (data.success) {
  //     const { gameId } = data;
  //     console.log(`$$>>>>: Home -> gameId`, gameId);
  //     router.push("/game/[gameId]", `/game/${gameId}`);
  //   }
  // };

  const callJoinGame = async e => {
    e.preventDefault();
    console.log(`$$>>>>: userId`, userId);
    console.log(`$$>>>>: name`, name);
    if (name && userId) {
      await ref(`/users/${userId}`).update({ name });
    }
    router.push("/game/[gameId]", `/game/${gameId}`);
    // const joinGame = functions.httpsCallable("joinGame");
    // const { data } = await joinGame({
    //   name: newPlayer,
    //   gameId,
    // });
    // if (data.error) {
    //   //TODO handle error
    // }
    // if (data.success) {
    //   const { gameId } = data;
    //   router.push("/game/[gameId]", `/game/${gameId}`);
    // }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    switch (name) {
      case "name":
        setName(value);
        break;
      case "gameName":
        setGameName(value);
        break;
      case "gameId":
        setGameId(value);
        break;
      case "newPlayer":
        setNewPlayer(value);
        break;
    }
  };

  return (
    <main>
      <h1>Dealer's Choice</h1>
      {/* <form>
        <h2>Create Game</h2>
        <div>
          <label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleChange}
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
              onChange={handleChange}
            />
            Game
          </label>
        </div>
        <div>
          <button onClick={callCreateGame}>create game</button>
        </div>
      </form> */}
      <form>
        <h2>Join Game</h2>
        <div>
          <label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleChange}
            />
            Name
          </label>
        </div>
        <div>
          <label>
            <input
              type="text"
              name="gameId"
              value={gameId}
              onChange={handleChange}
            />
            Game
          </label>
        </div>
        <div>
          <button onClick={callJoinGame}>join game</button>
        </div>
      </form>
    </main>
  );
};

const mapStateToProps = ({ user: { userId } }) => ({ userId });

export default connect(mapStateToProps)(Home);
