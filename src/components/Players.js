import React, { useState, useEffect } from "react";
import { functions } from "lib/firebase";
import CardsList from "components/CardsList";
import Table from "components/Table";
import Player from "components/Player";
import { handleResponse } from "utils/helpers";
import styles from "styles/players.module.scss";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { connect } from "react-redux";

const Players = ({ userId, playerOrder, players, dealer }) => {
  return (
    <div id={styles.players}>
      <Droppable
        type="player"
        droppableId={"players-row"}
        direction="horizontal"
      >
        {provided => (
          <>
            <div
              className={styles.players_row}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {playerOrder.map((playerId, index) => {
                const player = players[playerId];
                return (
                  player && (
                    <div
                      key={player.playerId}
                      className={styles.player_container}
                    >
                      <Player player={player} index={index} opponent />
                    </div>
                  )
                );
              })}
              {provided.placeholder}
            </div>
          </>
        )}
      </Droppable>
      <Table />

      {players[userId] && (
        <Droppable
          type="player"
          droppableId={"me"}
          direction="horizontal"
          isDropDisabled={true}
        >
          {provided => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={styles.player_container}
            >
              {provided.placeholder}
              <Player index={0} player={players[userId]} myHand />
            </div>
          )}
        </Droppable>
      )}
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
