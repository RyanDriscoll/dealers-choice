import React, { useState, useEffect } from "react";
import { functions } from "lib/firebase";
import CardsList from "components/CardsList";
import Table from "components/Table";
import Player from "components/Player";
import { handleResponse } from "utils/helpers";
import { useRecoilValue } from "recoil";
import styles from "styles/players.module.scss";
import {
  userState,
  gameState,
  handsState,
  playersState,
  playerOrderState,
  otherPlayerOrderSelector,
} from "lib/recoil";
import { Droppable, Draggable } from "react-beautiful-dnd";

const Players = ({ playerOrder }) => {
  const { uid: userId } = useRecoilValue(userState);
  const { gameId, dealer } = useRecoilValue(gameState);
  // const hands = useRecoilValue(handsState);
  const players = useRecoilValue(playersState);
  // const [reordered, setReordered] = useState([]);
  // const playerOrder = useRecoilValue(playerOrderState);
  // const otherPlayerIds = useRecoilValue(otherPlayerOrderSelector(userId));

  // useEffect(() => {
  //   if (userId && playerOrder.length) {
  //     let newOrder = [...playerOrder];
  //     const index = newOrder.indexOf(id => id === userId);
  //     newOrder = [
  //       userId,
  //       ...newOrder.slice(0, index - 1),
  //       ...newOrder.slice(index),
  //     ];
  //     console.log(`$$>>>>: Players -> newOrder`, newOrder);
  //     setReordered(newOrder);
  //   }
  // }, [playerOrder, userId]);

  return (
    <div id={styles.players}>
      <h2>Players</h2>
      <Droppable
        type="player"
        droppableId={"players-row"}
        direction="horizontal"
      >
        {provided => (
          <>
            <ul ref={provided.innerRef} {...provided.droppableProps}>
              {playerOrder.map((playerId, index) => {
                const player = players[playerId];
                return (
                  player && (
                    <Player
                      key={player.playerId}
                      player={player}
                      index={index}
                      // dragDisabled={userId !== dealer}
                    />
                  )
                );
              })}
              {provided.placeholder}
            </ul>
          </>
        )}
      </Droppable>
      <Table />
      {/* <div className={styles.me}>
        {players[userId] && (
          <Player
            index={0}
            player={players[userId]}
            dragDisabled={userId !== dealer}
          />
        )}
      </div> */}
    </div>
  );
};

export default Players;
