import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import CardsList from "components/CardsList";
import styles from "styles/player.module.scss";
import { useRecoilValue, useRecoilState } from "recoil";
import { userState, isDealerSelector } from "lib/recoil";
const Player = ({ index, dragDisabled, player: { playerId, name } }) => {
  const { uid } = useRecoilValue(userState);
  const isDealer = useRecoilValue(isDealerSelector(playerId));
  return (
    // uid === playerId ? (
    //   <li id={styles.player}>
    //     <div className={styles.player_header}>
    //       <h3>{name}</h3>
    //       <Droppable type="dealer" droppableId={`dealer-${playerId}`}>
    //         {provided => (
    //           <div
    //             ref={provided.innerRef}
    //             {...provided.droppableProps}
    //             className={styles.dealer_spot}
    //           >
    //             {isDealer && (
    //               <Draggable index={0} draggableId={`dealer-button`}>
    //                 {provided => (
    //                   <div
    //                     className={styles.dealer_button}
    //                     ref={provided.innerRef}
    //                     {...provided.draggableProps}
    //                     {...provided.dragHandleProps}
    //                   >
    //                     DEALER
    //                   </div>
    //                 )}
    //               </Draggable>
    //             )}
    //             {provided.placeholder}
    //           </div>
    //         )}
    //       </Droppable>
    //     </div>
    //     <div>
    //       <CardsList location={"hand"} locationId={playerId} />
    //       <CardsList location={"table"} locationId={playerId} />
    //     </div>
    //   </li>
    // ) :
    <Draggable
      draggableId={playerId}
      index={index}
      // isDragDisabled={index === 0}
      type="player"
    >
      {provided => (
        <li
          id={styles.player}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div className={styles.player_header}>
            {/* <Droppable type="dealer" droppableId={`dealer-${playerId}`}>
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
            </Droppable> */}
            <h3 {...provided.dragHandleProps}>{name}</h3>
          </div>
          <div>
            <CardsList location={"hand"} locationId={playerId} />
            <CardsList location={"table"} locationId={playerId} />
          </div>
        </li>
      )}
    </Draggable>
  );
};

export default Player;
