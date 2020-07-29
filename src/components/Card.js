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
  canMove,
  selectCard,
  updateCard,
  updateCardLocation,
}) => {
  const { faceUp, suit, value, cardId, locationId, selected } = card;
  const cardRef = useRef();
  const locationRef = useRef();
  useEffect(() => {
    cardRef.current = ref(`/cards/${gameId}/${cardId}`);
    locationRef.current = ref(`/cards/${gameId}/${cardId}/locationId`);
    cardRef.current.on("child_changed", snapshot => {
      if (snapshot.key !== "locationId") {
        updateCard({
          [snapshot.key]: snapshot.val(),
          cardId,
        });
      }
    });

    locationRef.current.on("value", snapshot => {
      if (card.locationId !== snapshot.val()) {
        updateCardLocation({
          cardId,
          locationId: snapshot.val(),
          index: 0,
        });
      }
    });
    return () => {
      cardRef.current.off();
      locationRef.current.off();
    };
  }, []);

  return (
    <Draggable
      key={cardId}
      draggableId={cardId}
      index={index}
      isDragDisabled={!canMove}
    >
      {provided => {
        return (
          <li
            ref={provided.innerRef}
            onClick={() => selectCard(card)}
            className={classnames(styles.card, {
              [styles.selected]: selected,
            })}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div className={styles.card_face}>
              <p style={{ color: getColor(suit) }}>
                {faceUp || myHand ? `${value} ${getEmoji(suit)}` : ""}
              </p>
            </div>
          </li>
        );
      }}
    </Draggable>
  );
};

const mapStateToProps = (state, props) => ({
  gameId: state.game.gameId,
});

const mapDispatchToProps = dispatch => ({
  updateCard: data => dispatch(updateCardAction(data)),
  updateCardLocation: data => dispatch(updateCardLocationAction(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Card);
