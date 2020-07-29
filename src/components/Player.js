import React, { useEffect, useRef } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import CardsList from "components/CardsList";
import styles from "styles/player.module.scss";
import { connect } from "react-redux";
import { ref } from "lib/firebase";
import { getUserIsDealer, getPlayerIsDealer } from "store/game-store";
const Player = ({
  index,
  myHand,
  userIsDealer,
  playerIsDealer,
  player: { playerId, name },
}) => {
  return myHand ? (
    <div id={styles.player}>
      <div className={styles.table_space}>
        <CardsList canMove canSelect locationId={`pile-${playerId}`} />
      </div>
      {/* <Droppable type="cards-list" droppableId={`pile-${playerId}`}>
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={styles.table_space}
          >
            {provided.placeholder}
          </div>
        )}
      </Droppable> */}
      <div>
        <CardsList myHand canMove canSelect locationId={playerId} />
      </div>
      <div className={styles.player_header}>
        <h3>{name}</h3>
        <Droppable type="dealer" droppableId={`dealer-${playerId}`}>
          {provided => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={styles.dealer_spot}
            >
              {userIsDealer && (
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
  ) : (
    <Draggable draggableId={playerId} index={index} type="player">
      {provided => (
        <div
          id={styles.player}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div className={styles.player_header}>
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
                  <div className={styles.placeholder}>
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
            <h3 {...provided.dragHandleProps}>{name}</h3>
          </div>
          <div>
            <CardsList locationId={playerId} />
          </div>
          {/* <Droppable type="cards-list" droppableId={`space-${playerId}`}>
            {provided => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={styles.table_space}
              >
                {provided.placeholder}
              </div>
            )}
          </Droppable> */}
          <div className={styles.table_space}>
            <CardsList
              canSelect={userIsDealer}
              canMove={userIsDealer}
              locationId={`pile-${playerId}`}
            />
          </div>
        </div>
      )}
    </Draggable>
  );
};

const mapStateToProps = (state, props) => ({
  userIsDealer: getUserIsDealer(state),
  playerIsDealer: getPlayerIsDealer(state, props),
});

export default connect(mapStateToProps)(Player);
