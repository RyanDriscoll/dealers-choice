const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Deck = require("./deck");

admin.initializeApp();

const ref = path =>
  path ? admin.database().ref(path) : admin.database().ref();

exports.createGame = functions.https.onCall(async (data, context) => {
  try {
    const { name, gameName } = data;
    const { uid: playerId } = context.auth;
    const gameRef = ref("/games").push();
    const gameId = gameRef.key;
    await ref().update({
      [`/games/${gameId}/gameId`]: gameId,
      [`/games/${gameId}/name`]: gameName,
      [`/games/${gameId}/dealer`]: playerId,
      [`/players/${gameId}/${playerId}/playerId`]: playerId,
      [`/players/${gameId}/${playerId}/name`]: name,
    });
    return { success: true, gameId };
  } catch (error) {
    console.error(error);
    return { error: true };
  }
});

exports.joinGame = functions.https.onCall(async (data, context) => {
  try {
    const { name, gameId } = data;
    const { uid: playerId } = context.auth;
    const gameSnap = await ref(`/games/${gameId}`).once("value");
    if (gameSnap.exists()) {
      await ref(`/players/${gameId}/${playerId}`).update({
        playerId,
        name,
      });
      return { success: true, gameId };
    } else {
      return { error: "game does not exist" };
    }
  } catch (error) {
    console.error(error);
    return { error: true };
  }
});

exports.dealCards = functions.https.onCall(async (data, context) => {
  try {
    const { locationIds, numCards, faceUp, location, gameId } = data;
    const { uid: playerId } = context.auth;
    const [gameSnap, deckSnap] = await Promise.all([
      ref(`/games/${gameId}`).once("value"),
      ref(`/decks/${gameId}`).orderByKey().once("value"),
    ]);
    if (gameSnap.exists()) {
      const deck = [];
      deckSnap.forEach(cardSnap => {
        deck.push(cardSnap.val());
      });
      const updateObj = {};
      for (let num = numCards; num > 0; num--) {
        locationIds.forEach(locationId => {
          const card = deck.shift();
          if (!card) {
            throw new Error("no cards remaining");
          }
          updateObj[`/cards/${gameId}/${card.cardId}`] = {
            ...card,
            location,
            locationId,
            faceUp,
          };
          updateObj[`/decks/${gameId}/${card.cardId}`] = null;
        });
      }
      // switch (to) {
      //   case "allPlayers":
      //     const playersSnap = await ref(`/players/${gameId}`).once("value");
      //     for (let i = numCards; i > 0; i--) {
      //       playersSnap.forEach(playerSnap => {
      //         const { playerId } = playerSnap.val();
      //         const card = deck.shift();
      //         if (!card) {
      //           throw new Error("no cards remaining");
      //         }
      //         updateObj[`/hands/${gameId}/${playerId}/${card.cardId}`] = {
      //           ...card,
      //           faceUp,
      //           onTable,
      //         };
      //         updateObj[`/decks/${gameId}/${card.cardId}`] = null;
      //       });
      //     }
      //     break;

      //   case "table":
      //     const pileRef = ref(`/piles/${gameId}`).push();
      //     const pileId = pileRef.key;
      //     updateObj[`/piles/${gameId}/${pileId}`] = { gameId, pileId };
      //     for (let i = numCards; i > 0; i--) {
      //       const card = deck.shift();
      //       if (!card) {
      //         throw new Error("no cards remaining");
      //       }
      //       updateObj[`/pileCards/${gameId}/${pileId}/${card.cardId}`] = {
      //         ...card,
      //         faceUp,
      //         onTable,
      //       };
      //       updateObj[`/decks/${gameId}/${card.cardId}`] = null;
      //     }
      //     break;

      //   default:
      //     for (let i = numCards; i > 0; i--) {
      //       const card = deck.shift();
      //       if (!card) {
      //         throw new Error("no cards remaining");
      //       }
      //       updateObj[`/hands/${gameId}/${to}/${card.cardId}`] = {
      //         ...card,
      //         faceUp,
      //         onTable,
      //       };
      //       updateObj[`/decks/${gameId}/${card.cardId}`] = null;
      //     }
      // }
      await ref().update(updateObj);
      return { success: true, gameId };
    } else {
      return { error: "game does not exist" };
    }
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
});

// actions: play, discard, move
exports.updateCards = functions.https.onCall(async (data, context) => {
  try {
    const {
      cards,
      gameId,
      faceUp,
      onTable,
      action,
      nextLocation,
      nextLocationId,
    } = data;
    const { uid: playerId } = context.auth;
    const updateObj = {};
    switch (action) {
      case "discard":
        cards.forEach(({ cardId, location, locationId }) => {
          updateObj[`${location}/${gameId}/${locationId}/${cardId}`] = null;
        });
        break;

      case "play":
        cards.forEach(({ cardId, location, locationId }) => {
          updateObj[
            `${location}/${gameId}/${locationId}/${cardId}/onTable`
          ] = onTable;
          updateObj[
            `${location}/${gameId}/${locationId}/${cardId}/faceUp`
          ] = !onTable ? false : faceUp;
        });
        break;

      case "move":
        const cardSnaps = await Promise.all(
          cards.map(({ cardId, location, locationId }) =>
            ref(`${location}/${gameId}/${locationId}/${cardId}`).once("value")
          )
        );
        cardSnaps.forEach((oldCardSnap, i) => {
          const card = { ...oldCardSnap.val() };
          const { location, locationId, cardId } = cards[i];
          card.onTable = onTable;
          card.faceUp = faceUp;
          updateObj[`${location}/${gameId}/${locationId}/${cardId}`] = null;
          updateObj[
            `${nextLocation}/${gameId}/${nextLocationId}/${cardId}`
          ] = card;
        });
        break;

      default:
        break;
    }
    await ref().update(updateObj);
    return { success: true, gameId };
  } catch (error) {
    console.error(error);
    return { error: true };
  }
});

exports.changeDealer = functions.https.onCall(async (data, context) => {
  try {
    const { gameId, dealer } = data;
    await ref(`/games/${gameId}`).update({ dealer });
    return { success: true, gameId };
  } catch (error) {
    console.error(error);
    return { error: true };
  }
});

exports.shuffleDeck = functions.https.onCall(async (data, context) => {
  try {
    const { gameId } = data;
    // const playersSnap = await ref(`players/${gameId}`).once("value");

    // let updateObj = {
    //   [`cards/${gameId}`]: null,
    //   [`piles/${gameId}`]: null,
    //   [`pileCards/${gameId}`]: null,
    // };
    // playersSnap.forEach(playerSnap => {
    //   const playerId = playerSnap.child("playerId").val();
    //   updateObj[`hands/${gameId}/${playerId}`] = null;
    // });
    await ref().update({
      [`/cards/${gameId}`]: null,
      [`/decks/${gameId}`]: null,
    });
    const updateObj = {};
    const deck = new Deck();
    const deckRef = ref(`decks/${gameId}`);
    deck.cards.forEach(card => {
      const cardRef = deckRef.push();
      const cardId = cardRef.key;
      updateObj[`decks/${gameId}/${cardId}`] = {
        ...card,
        cardId,
      };
    });
    await ref().update(updateObj);
    return { success: true, gameId };
  } catch (error) {
    console.error(error);
    return { error: true };
  }
});

exports.clearPlayedCards = functions.https.onCall(async (data, context) => {
  try {
    const { gameId } = data;
    const [table, pile] = await Promise.all([
      ref(`/cards/${gameId}`)
        .orderByChild("location")
        .equalTo("table")
        .once("value"),
      ref(`/cards/${gameId}`)
        .orderByChild("location")
        .equalTo("pile")
        .once("value"),
    ]);
    const updateObj = {};
    table.forEach(cardSnap => {
      const cardId = cardSnap.child("cardId").val();
      updateObj[`/cards/${gameId}/${cardId}`] = null;
    });
    pile.forEach(cardSnap => {
      const cardId = cardSnap.child("cardId").val();
      updateObj[`/cards/${gameId}/${cardId}`] = null;
    });
    await ref().update(updateObj);
    // const [pilesSnap, handsSnap] = await Promise.all([
    //   ref(`pileCards/${gameId}`).once("value"),
    //   ref(`hands/${gameId}`).once("value"),
    // ]);

    // const updateObj = {};
    // pilesSnap.forEach(pileSnap => {
    //   const pileId = pileSnap.key;
    //   pileSnap.forEach(cardSnap => {
    //     if (cardSnap.child("onTable").val()) {
    //       const cardId = cardSnap.key;
    //       updateObj[`pileCards/${gameId}/${pileId}/${cardId}`] = null;
    //     }
    //   });
    // });
    // handsSnap.forEach(handSnap => {
    //   const playerId = handSnap.key;
    //   handSnap.forEach(cardSnap => {
    //     if (cardSnap.child("onTable").val()) {
    //       const cardId = cardSnap.key;
    //       updateObj[`hands/${gameId}/${playerId}/${cardId}`] = null;
    //     }
    //   });
    // });

    // await ref().update(updateObj);
    return { success: true, gameId };
  } catch (error) {
    console.error(error);
    return { error: true };
  }
});

exports.onCreateGame = functions.database
  .ref("/games/{gameId}")
  .onCreate((snapshot, context) => {
    try {
      const { gameId } = context.params;
      const deck = new Deck();
      const deckRef = ref(`cards/${gameId}`);
      const updateObj = {};
      deck.cards.forEach(card => {
        const cardRef = deckRef.push();
        const cardId = cardRef.key;
        updateObj[`decks/${gameId}/${cardId}`] = {
          ...card,
          cardId,
        };
      });
      return ref().update(updateObj);
    } catch (error) {
      console.error(error);
    }
  });

// exports.onEmptyPile = functions.database
//   .ref("/pileCards/{gameId}/{pileId}")
//   .onDelete(async (snapshot, context) => {
//     try {
//       const { gameId, pileId } = context.params;
//       return ref(`piles/${gameId}/${pileId}`).remove();
//     } catch (error) {
//       console.error(error);
//     }
//   });

// exports.onJoinGame = functions.database
//   .ref("/players/{gameId}")
//   .onWrite(async ({ before, after }, context) => {
//     try {
//       const { gameId } = context.params;
//       const afterNumChildren = after.numChildren();
//       const beforeNumChildren = before.numChildren();
//       if (
//         after.exists() &&
//         afterNumChildren > 1 &&
//         afterNumChildren !== beforeNumChildren
//       ) {
//         const players = [];
//         Object.values(after.val()).forEach((originalPlayer, i) => {
//           const player = { ...originalPlayer };
//           players.push(player);
//           if (i > 0) {
//             const prevPlayer = players[i - 1];
//             prevPlayer.next = player.playerId;
//             player.prev = prevPlayer.playerId;
//           }
//           if (i === afterNumChildren - 1) {
//             const firstPlayer = players[0];
//             firstPlayer.prev = player.playerId;
//             player.next = firstPlayer.playerId;
//           }
//         });
//         const updateObj = {};
//         players.forEach(p => {
//           updateObj[`/players/${gameId}/${p.playerId}/next`] = p.next;
//           updateObj[`/players/${gameId}/${p.playerId}/prev`] = p.prev;
//         });
//         return ref().update(updateObj);
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   });

const game = {
  id: "123",
  dealer: "playerId",
  deck: "deckId",
  name: "Championship",
};

const players = {
  abc: {
    gameId: "123",
    nextPlayer: "def",
    prevPlayer: "ghi",
    playerId: "abc",
    name: "Steve McQueen",
  },
  def: {
    gameId: "123",
    nextPlayer: "ghi",
    prevPlayer: "abc",
    playerId: "def",
    name: "Bob McQueen",
  },
  ghi: {
    gameId: "123",
    nextPlayer: "abc",
    prevPlayer: "def",
    playerId: "ghi",
    name: "Jerry McQueen",
  },
};

const hands = {
  "123": {
    abc: [
      { suit: "S", value: "K" },
      { suit: "H", value: "K" },
      { suit: "C", value: "K" },
      { hidden: true },
    ],
    def: [
      { suit: "S", value: "Q" },
      { suit: "H", value: "Q" },
      { suit: "C", value: "Q" },
      { hidden: true },
    ],
    ghi: [
      { suit: "S", value: "A" },
      { suit: "H", value: "A" },
      { suit: "C", value: "A" },
      { hidden: true },
    ],
  },
};

const deck = {
  gameId: "123",
  deckId: "deckId",
  cards: [
    { suit: "S", value: "A" },
    { suit: "H", value: "A" },
    { suit: "C", value: "A" },
    { suit: "S", value: "Q" },
    { suit: "H", value: "Q" },
    { suit: "C", value: "Q" },
    { suit: "S", value: "K" },
    { suit: "H", value: "K" },
    { suit: "C", value: "K" },
  ],
};
