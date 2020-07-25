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
import { connect } from "react-redux";
// import { useUserState } from "context/userContext";

const Players = ({ userId, playerOrder, players, dealer }) => {
  // const { userId: userId } = useUserState();
  // const { gameId } = useRecoilValue(gameState);
  // const players = useRecoilValue(playersState);

  return (
    <div id={styles.players}>
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
                      dealer={dealer}
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

      <div className={styles.me}>
        {players[userId] && (
          <Player player={players[userId]} dealer={dealer} undraggable />
        )}
      </div>
    </div>
  );
};
const mapStateToProps = ({
  user: { userId },
  game: { dealer },
  players: { playerOrder, players },
}) => ({
  userId,
  playerOrder,
  players,
  dealer,
});
export default connect(mapStateToProps)(Players);
