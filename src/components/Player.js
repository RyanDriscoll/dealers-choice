import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import CardsList from "components/CardsList";
import styles from "styles/player.module.scss";
import { connect } from "react-redux";
const Player = ({
  userId,
  index,
  undraggable,
  dealer,
  player: { playerId, name },
}) => {
  const isDealer = dealer === playerId;
  const iAmDealer = dealer === userId;
  return undraggable ? (
    <li id={styles.player}>
      <div>
        {/* <CardsList location={"table"} locationId={playerId} /> */}
        <CardsList locationId={playerId} />
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
              {isDealer && (
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
    </li>
  ) : (
    <Draggable draggableId={playerId} index={index} type="player">
      {provided => (
        <li
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
                  {isDealer && (
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
            {/* <CardsList location={"table"} locationId={playerId} /> */}
          </div>
        </li>
      )}
    </Draggable>
  );
};

const mapStateToProps = ({ user: { userId } }) => ({ userId });

export default connect(mapStateToProps)(Player);
