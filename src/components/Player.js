import React, { useEffect, useRef } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import cn from "classnames";
import CardsList from "components/CardsList";
import styles from "styles/player.module.scss";
import { connect } from "react-redux";
import { ref } from "lib/firebase";
import { getUserIsDealer, getPlayerIsDealer } from "store/game-store";
import { getPlayersPile } from "store/piles-store";
const Player = ({
  index,
  myHand,
  userIsDealer,
  playerIsDealer,
  playersPile,
  opponent,
  player: { playerId, name },
}) => (
  <Draggable
    isDragDisabled={myHand || !userIsDealer}
    draggableId={playerId}
    index={index}
    type="player"
  >
    {provided => (
      <div
        ref={provided.innerRef}
        id={styles.player}
        {...provided.draggableProps}
        className={cn({
          [styles.other_player]: !myHand,
        })}
      >
        <CardsList
          collapsed={playersPile ? playersPile.collapsed : false}
          canMoveCard
          canSelectCard
          tableSpace
          locationId={`pile-${playerId}`}
          name={`${name}'s space`}
        />
        <div>
          <CardsList
            locked
            collapsed={opponent}
            myHand={myHand}
            canMoveCard={myHand}
            canSelectCard={myHand}
            locationId={playerId}
            name={`${name}'s hand`}
          />
        </div>
        <div className={styles.player_header}>
          <h3 {...provided.dragHandleProps}>{name}</h3>
          <Droppable type="dealer" droppableId={`dealer-${playerId}`}>
            {provided => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={styles.dealer_spot}
              >
                {playerIsDealer && (
                  <Draggable index={0} draggableId={`dealer-button`}>
                    {provided => (
                      <div
                        className={styles.dealer_button}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        DEALER
                      </div>
                    )}
                  </Draggable>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </div>
    )}
  </Draggable>
);

const mapStateToProps = (state, props) => ({
  userIsDealer: getUserIsDealer(state),
  playerIsDealer: getPlayerIsDealer(state, props),
  playersPile: getPlayersPile(state, props),
});

export default connect(mapStateToProps)(Player);
