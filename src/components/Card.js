import React, { useRef, useEffect } from "react";
import { Draggable } from "react-beautiful-dnd";
import { connect } from "react-redux";
import {
  getSelectedCards,
  isCardSelected,
  updateCardAction,
  updateCardLocationAction,
} from "store/cards-store";
import classnames from "classnames";
import styles from "styles/card.module.scss";
import { ref } from "lib/firebase";

const getColor = suit => (suit === "H" || suit === "D" ? "red" : "black");
const getEmoji = suit => {
  switch (suit) {
    case "H":
      return "♥";
    case "D":
      return "♦";
    case "S":
      return "♠";
    case "C":
      return "♣";
  }
};

const Card = ({
  card,
  index,
  gameId,
  myHand,
  canMoveCard,
  selectCard,
  collapsed,
}) => {
  const { faceUp, suit, value, cardId, locationId, selected } = card;

  return (
    <Draggable
      key={cardId}
      draggableId={cardId}
      index={index}
      isDragDisabled={!canMoveCard}
    >
      {provided => {
        return (
          <div
            ref={provided.innerRef}
            onClick={() => selectCard(card)}
            className={classnames(styles.card, {
              [styles.selected]: selected,
              [styles.collapsed]: collapsed,
            })}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div className={styles.card_face}>
              <p style={{ color: getColor(suit) }}>
                {faceUp || myHand ? `${value} ${getEmoji(suit)}` : ""}
              </p>
            </div>
          </div>
        );
      }}
    </Draggable>
  );
};

const mapStateToProps = (state, props) => ({
  gameId: state.game.gameId,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Card);
