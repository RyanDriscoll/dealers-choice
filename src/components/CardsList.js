import React, { useState, useEffect } from "react";
import classnames from "classnames";
import styles from "styles/cards-list.module.scss";

import { Droppable, Draggable } from "react-beautiful-dnd";
import { ref } from "lib/firebase";
import { connect } from "react-redux";
import { getSelectedCards, getCards } from "store/cards-store";
import Card from "components/Card";

const CardsList = ({
  locationId,
  gameId,
  cards,
  canSelect,
  canMove,
  myHand,
  tableSpace,
  collapsed: initiallyCollapsed,
}) => {
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);
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

  if (!cards) {
    return null;
  }

  return collapsed ? (
    <div className={styles.collapsed}>
      <Droppable
        droppableId={locationId}
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
          </>
        )}
      </Droppable>
    </div>
  ) : (
    <Droppable
      droppableId={locationId}
      type="cards-list"
      direction="horizontal"
    >
      {provided => (
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
      )}
    </Droppable>
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
