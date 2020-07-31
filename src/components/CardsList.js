import React, { useState, useEffect } from "react";
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
  canSelect,
  canMove,
  myHand,
  tableSpace,
  coordinates: pileCoords,
  updatePile,
  tableRef,
  name = "",
  collapsed: initiallyCollapsed,
}) => {
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);
  const [coordinates, setCoordinates] = useState(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (pileCoords) {
      setCoordinates(pileCoords);
    }
  }, [pileCoords]);
  const selectCard = async card => {
    const { cardId } = card;
    if (canSelect) {
      await ref(`/cards/${gameId}/${cardId}`).update({
        selected: !card.selected,
      });
    }
  };

  const handleCollapse = () => {
    setCollapsed(prevCollapsed => !prevCollapsed);
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
      const newCoords = {
        x: e.clientX - tableRef.current.getBoundingClientRect().left,
        y: e.clientY - tableRef.current.getBoundingClientRect().top - 85,
      };
      setCoordinates(newCoords);
    }
  };
  const handleMouseUp = async e => {
    setDragging(false);
  };

  if (!cards) {
    return null;
  }

  const coordsStyle = coordinates
    ? {
        position: "absolute",
        left: coordinates.x,
        top: coordinates.y,
        zIndex: 10,
      }
    : {};

  return collapsed ? (
    <div
      className={classnames(styles.collapsed, styles.container)}
      style={coordsStyle}
    >
      <Droppable
        droppableId={JSON.stringify({ locationId, collapsed })}
        type="cards-list"
        direction="horizontal"
      >
        {provided => (
          <>
            {cards &&
              cards
                .slice(1)
                .map((c, i) => (
                  <div
                    style={{ top: `${i * 0.3}px`, left: `${i * 0.3}px` }}
                    key={c.cardId}
                    className={styles.card_edge}
                  ></div>
                ))}
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={classnames(styles.cards_list, {
                [styles.table_space]: tableSpace,
              })}
            >
              <div onClick={handleCollapse} className={styles.toggle_collapsed}>
                {"\u2190 \u2192"}
              </div>

              <div className={styles.toggle_collapsed}></div>
              {cards[0] && (
                <Card
                  key={cards[0].cardId}
                  card={cards[0]}
                  index={0}
                  selectCard={selectCard}
                  canMove={true}
                  canSelect={true}
                  myHand={myHand}
                  collapsed={collapsed}
                />
              )}
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
    </div>
  ) : (
    <div className={styles.container} style={coordsStyle}>
      <Droppable
        droppableId={JSON.stringify({ locationId })}
        type="cards-list"
        direction="horizontal"
      >
        {provided => (
          <>
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={classnames(styles.cards_list, {
                [styles.table_space]: tableSpace,
              })}
            >
              <div onClick={handleCollapse} className={styles.toggle_collapsed}>
                {"\u2192 \u2190"}
              </div>
              <div className={styles.toggle_collapsed}></div>
              {cards.map((card, index) => {
                return (
                  <Card
                    key={card.cardId}
                    card={card}
                    index={index}
                    selectCard={selectCard}
                    canMove={canMove}
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
    </div>
  );
};

const mapStateToProps = (state, props) => {
  const {
    game: { gameId },
    app: { coordinates: mouseCoords },
  } = state;
  return {
    gameId,
    cards: getCards(state, props),
    mouseCoords,
  };
};

const mapDispatchToProps = dispatch => ({
  updatePile: pile => dispatch(updatePileAction(pile)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CardsList);
