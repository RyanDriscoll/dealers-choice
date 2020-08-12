import React, { useState, useEffect, useRef } from "react";
import classnames from "classnames";
import styles from "styles/cards-list.module.scss";

import { Droppable, Draggable } from "react-beautiful-dnd";
import { ref } from "lib/firebase";
import { connect } from "react-redux";
import { getSelectedCards, getCards } from "store/cards-store";
import Card from "components/Card";
import Target from "./Target";
import { updatePileAction } from "store/piles-store";

const CardsList = ({
  locationId,
  gameId,
  cards,
  canSelectCard,
  canMoveCard,
  myHand,
  tableSpace,
  tableRef,
  name = "",
  locked,
  collapsed: initiallyCollapsed,
}) => {
  const cardListRef = useRef(null);
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);
  const [coordinates, setCoordinates] = useState(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (initiallyCollapsed != null) {
      setCollapsed(initiallyCollapsed);
    }
  }, [initiallyCollapsed]);

  const selectCard = async card => {
    const { cardId } = card;
    if (canSelectCard) {
      await ref(`/cards/${gameId}/${cardId}`).update({
        selected: !card.selected,
      });
    }
  };

  const handleCollapse = async () => {
    setCollapsed(prevCollapsed => !prevCollapsed);
    await ref(`/piles/${gameId}/${locationId}`).update({
      collapsed: !collapsed,
    });
  };

  const handleEditName = async () => {
    const newName = prompt("name this pile");
    await ref(`/piles/${gameId}/${locationId}`).update({ name: newName });
  };

  const handleMouseDown = e => {
    setDragging(true);
  };

  const handleMouseMove = e => {
    if (dragging && tableRef && tableRef.current) {
      // const height = cardListRef.current.getBoundingClientRect().height;
      const newCoords = {
        x: e.clientX - tableRef.current.getBoundingClientRect().left,
        y: e.clientY - tableRef.current.getBoundingClientRect().top,
      };
      if (locationId === "deck") {
      }
      setCoordinates(newCoords);
    }
  };

  const handleMouseUp = async e => {
    setDragging(false);
  };

  const getRange = bool => (bool ? [0, 1] : [0]);

  const coordsStyle = coordinates
    ? {
        position: "absolute",
        left: coordinates.x,
        top: coordinates.y,
        zIndex: 10,
      }
    : {};

  return (
    <div
      ref={cardListRef}
      className={classnames(styles.container, {
        [styles.collapsed]: collapsed,
        [styles.no_margin]: tableSpace,
      })}
      style={coordsStyle}
    >
      <Droppable
        droppableId={JSON.stringify({ locationId, collapsed })}
        type="cards-list"
        direction="horizontal"
      >
        {provided => (
          <>
            {collapsed &&
              cards &&
              cards.slice(1).map((c, i) => (
                <div
                  style={{
                    height: `${75 * (1 - i * 0.006)}px`,

                    top: `${i * 0.3}px`,
                    left: `${i * 0.5}px`,
                  }}
                  key={c.cardId}
                  className={styles.card_edge}
                ></div>
              ))}
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={classnames(styles.cards_list, {
                [styles.table_space]:
                  !collapsed ||
                  cards.length === 0 ||
                  locationId.startsWith("pile"),
              })}
            >
              {!locked && (
                <div
                  onClick={handleCollapse}
                  className={styles.toggle_collapsed}
                >
                  {collapsed ? "\u2192" : "\u2190"}
                </div>
              )}
              {cards.slice(...getRange(collapsed)).map((card, index) => {
                return (
                  <Card
                    key={card.cardId}
                    card={card}
                    index={index}
                    selectCard={selectCard}
                    canMoveCard={canMoveCard}
                    myHand={myHand}
                    collapsed={collapsed}
                  />
                );
              })}
              {provided.placeholder}
            </div>
            {tableRef && (
              <div
                className={styles.drag_handle}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
              >
                <Target color="lightseagreen" />
              </div>
            )}
          </>
        )}
      </Droppable>
      <div className={styles.pile_name}>{name}</div>
    </div>
  );
};

const mapStateToProps = (state, props) => {
  const {
    game: { gameId },
  } = state;
  return {
    gameId,
    cards: getCards(state, props),
  };
};

export default connect(mapStateToProps)(CardsList);
