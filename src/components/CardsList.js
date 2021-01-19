import React, { useState, useEffect, useRef } from "react";
import classnames from "classnames";
import styles from "styles/cards-list.module.scss";

import { Droppable, Draggable } from "react-beautiful-dnd";
import { ref } from "lib/firebase";
import { connect } from "react-redux";
import { getSelectedCards, getCards } from "store/cards-store";
import { updatePileAction } from "store/piles-store";
import {
  setSelectedPileAction,
  setActionPanelOpenAction,
} from "store/app-store";
import Card from "components/Card";
import Target from "components/Target";

const CardsList = ({
  locationId,
  gameId,
  cards,
  canSelectCard,
  canMoveCard,
  myHand,
  tableRef,
  name,
  locked,
  selectedPile,
  setSelectedPile,
  setActionPanelOpen,
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
      const newCoords = {
        x: e.clientX - tableRef.current.getBoundingClientRect().left - 17,
        y: e.clientY - tableRef.current.getBoundingClientRect().top - 20,
      };
      if (locationId === "deck") {
      }
      setCoordinates(newCoords);
    }
  };

  const handleMouseUp = e => {
    setDragging(false);
  };

  const handleSelectPile = async e => {
    if (selectedPile === locationId) {
      setSelectedPile(null);
    } else {
      setSelectedPile(locationId);
      setActionPanelOpen(true);
    }
  };

  const getRange = bool => (bool ? [0, 1] : [0]);

  const cardListWidth =
    collapsed && cardListRef.current ? 60 + (cards.length - 1) * 0.3 : "auto";

  const coordsStyle = coordinates
    ? {
        position: "absolute",
        left: coordinates.x,
        top: coordinates.y,
        zIndex: 10,
        minWidth: cardListWidth,
      }
    : {
        minWidth: cardListWidth,
      };

  const selected = selectedPile === locationId;

  return (
    <div
      ref={cardListRef}
      className={classnames(styles.container, {
        [styles.collapsed]: collapsed,
        [styles.selected]: selected,
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

                    top: `${i * 0.3 + 6}px`,
                    left: `${i * 0.3 + 6}px`,
                  }}
                  key={c.cardId}
                  className={styles.card_edge}
                ></div>
              ))}
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={classnames(styles.cards_list, {
                // [styles.table_space]: true,
                // !collapsed ||
                // cards.length === 0 ||
                // locationId.startsWith("pile"),
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
      <div onClick={handleSelectPile}>
        {name ? (
          <div className={styles.pile_name}>{name}</div>
        ) : (
          <div style={{ fontSize: 20 }} className={styles.pile_name}>
            &#8230;
          </div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state, props) => {
  const {
    game: { gameId },
    app: { selectedPile },
  } = state;
  return {
    gameId,
    selectedPile,
    cards: getCards(state, props),
  };
};

const mapDispatchToProps = dispatch => ({
  setSelectedPile: pileId => dispatch(setSelectedPileAction(pileId)),
  setActionPanelOpen: pileId => dispatch(setActionPanelOpenAction(pileId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CardsList);
