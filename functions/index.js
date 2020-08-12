const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Deck = require("./deck");

admin.initializeApp();

const ref = path =>
  path ? admin.database().ref(path) : admin.database().ref();

// exports.createGame = functions.https.onCall(async (data, context) => {
//   try {
//     const { name, gameName } = data;
//     const { uid: playerId } = context.auth;
//     const gameRef = ref("/games").push();
//     const gameId = gameRef.key;
//     await ref().update({
//       [`/games/${gameId}/gameId`]: gameId,
//       [`/games/${gameId}/name`]: gameName,
//       [`/games/${gameId}/dealer`]: playerId,
//       [`/games/${gameId}/playerOrder`]: playerId,
//       [`/players/${gameId}/${playerId}/playerId`]: playerId,
//       [`/players/${gameId}/${playerId}/name`]: name,
//     });
//     return { success: true, gameId };
//   } catch (error) {
//     console.error(error);
//     return { error: true };
//   }
// });

exports.joinGame = functions.https.onCall(async (data, context) => {
  try {
    let { name, gameId } = data;
    const { uid: playerId } = context.auth;
    if (!name) {
      const nameSnap = await ref(`/users/${playerId}/name`).once("value");
      if (nameSnap.exists()) {
        name = nameSnap.val();
      }
    }
    const gameSnap = await ref(`/games/${gameId}`).once("value");
    const updateObj = {};
    updateObj[`/players/${gameId}/${playerId}/playerId`] = playerId;
    updateObj[`/players/${gameId}/${playerId}/present`] = true;
    updateObj[`/users/${playerId}/userId`] = playerId;
    if (name) {
      updateObj[`/players/${gameId}/${playerId}/name`] = name;
      updateObj[`/users/${playerId}/name`] = name;
    }
    if (!gameSnap.exists()) {
      updateObj[`/games/${gameId}/gameId`] = gameId;
      updateObj[`/games/${gameId}/dealer`] = playerId;
    }
    await Promise.all([
      ref().update(updateObj),
      ref(`/games/${gameId}/playerOrder`).transaction(data => {
        if (!data) return playerId;
        let ids = data.split(",");
        ids.push(playerId);
        ids = ids.filter((id, index, arr) => arr.indexOf(id) === index);
        return ids.join(",");
      }),
    ]);
    return { success: true, gameId };
  } catch (error) {
    console.error(error);
    return { error: true };
  }
});

// exports.joinGame = functions.https.onCall(async (data, context) => {
//   try {
//     const { name, gameId } = data;
//     const { uid: playerId } = context.auth;
//     const gameSnap = await ref(`/games/${gameId}`).once("value");
//     if (gameSnap.exists()) {
//       await Promise.all([
//         ref(`/games/${gameId}/playerOrder`).transaction(
//           data => data + `,${playerId}`
//         ),
//         ref(`/players/${gameId}/${playerId}`).update({
//           playerId,
//           name,
//         }),
//       ]);
//       return { success: true, gameId };
//     } else {
//       return { error: "game does not exist" };
//     }
//   } catch (error) {
//     console.error(error);
//     return { error: true };
//   }
// });

exports.dealCards = functions.https.onCall(async (data, context) => {
  try {
    const { locationIds, numCards, faceUp, location, gameId } = data;
    const { uid: playerId } = context.auth;
    const [gameSnap, deckSnap] = await Promise.all([
      ref(`/games/${gameId}`).once("value"),
      ref(`/cards/${gameId}`).orderByKey().once("value"),
    ]);
    if (gameSnap.exists()) {
      const deck = [];
      deckSnap.forEach(cardSnap => {
        if (cardSnap.child("locationId").val() === "deck") {
          deck.push(cardSnap.val());
        }
      });
      const updateObj = {};
      for (let num = numCards; num > 0; num--) {
        locationIds.forEach(locationId => {
          const card = deck.shift();
          if (!card) {
            throw new Error("no cards remaining");
          }
          updateObj[`/cards/${gameId}/${card.cardId}/locationId`] = locationId;
          updateObj[`/cards/${gameId}/${card.cardId}/faceUp`] = faceUp;
          // updateObj[`/cards/${gameId}/${card.cardId}`] = null;
        });
      }
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
    await ref(`/cards/${gameId}`).remove();
    const updateObj = {};
    const deck = new Deck();
    const cardsRef = ref(`cards/${gameId}`);
    deck.cards.forEach(card => {
      const cardRef = cardsRef.push();
      const cardId = cardRef.key;
      updateObj[`cards/${gameId}/${cardId}`] = {
        ...card,
        cardId,
        locationId: "deck",
        faceUp: false,
        selected: false,
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
    const [cardsSnap, playersSnap] = await Promise.all([
      ref(`/cards/${gameId}`).once("value"),
      ref(`/players/${gameId}`).once("value"),
    ]);
    const playerIds = Object.values(playersSnap.val() || {}).map(
      p => p.playerId
    );
    const updateObj = {};
    cardsSnap.forEach(cardSnap => {
      const { cardId, locationId } = cardSnap.val();
      if (locationId !== "deck" && !playerIds.includes(locationId)) {
        updateObj[`/cards/${gameId}/${cardId}/locationId`] = "discard";
      }
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

exports.addPile = functions.https.onCall(async (data, context) => {
  try {
    const { gameId } = data;
    const newPileRef = ref(`/piles/${gameId}`).push();
    const pileId = newPileRef.key;
    await newPileRef.update({ pileId });

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
      const deckRef = ref(`/cards/${gameId}`);
      const updateObj = {};
      deck.cards.forEach(card => {
        const cardRef = deckRef.push();
        const cardId = cardRef.key;
        updateObj[`/cards/${gameId}/${cardId}`] = {
          ...card,
          cardId,
          locationId: "deck",
          faceUp: false,
          selected: false,
        };
      });
      // const spaceRef = ref(`/spaces/${gameId}`).push();
      // const spaceId = spaceRef.key;
      // updateObj[`/spaces/${gameId}/${spaceId}/spaceId`] = spaceId;
      // updateObj[`/spaces/${gameId}/${spaceId}/gameId`] = gameId;
      // updateObj[`/spaces/${gameId}/${spaceId}/gameId`] = gameId;
      return ref().update(updateObj);
    } catch (error) {
      console.error(error);
    }
  });

exports.onJoinGame = functions.database
  .ref("/players/{gameId}/{playerId}")
  .onCreate(async (snapshot, context) => {
    try {
      const { gameId, playerId } = context.params;
      const updateObj = {};
      // const playersSnap = await snapshot.ref.parent
      //   .orderByChild("playerIndex")
      //   .once("value");
      // let index = playersSnap.numChildren() - 1;
      // playersSnap.forEach(playerSnap => {
      //   if (!playerSnap.child("playerIndex").exists()) {
      //     updateObj[
      //       `/players/${gameId}/${playerSnap
      //         .child("playerId")
      //         .val()}/playerIndex`
      //     ] = index;
      //     index--;
      //   }
      // });
      // playersSnap.forEach(playerSnap => {
      //   if (playerSnap.child("playerIndex").exists()) {
      //     updateObj[
      //       `/players/${gameId}/${playerSnap
      //         .child("playerId")
      //         .val()}/playerIndex`
      //     ] = index;
      //     index--;
      //   }
      // });
      const pileId = `pile-${playerId}`;
      updateObj[`/piles/${gameId}/${pileId}`] = {
        pileId,
      };
      // console.log("ON JOIN", updateObj);
      return ref().update(updateObj);
    } catch (error) {
      console.error(error);
    }
  });

// exports.onLeaveGame = functions.database
//   .ref("/players/{gameId}/{playerId}")
//   .onDelete(async (snapshot, context) => {
//     try {
//       const { gameId, playerId } = context.params;
//       const updateObj = {};
//       const [playersSnap, dealer] = await Promise.all([
//         snapshot.ref.parent.orderByChild("playerIndex").once("value"),
//         ref(`/games/${gameId}/dealer`)
//           .once("value")
//           .then(snap => snap.val()),
//       ]);
//       let index = playersSnap.numChildren() - 1;
//       const dealerLeft = dealer === playerId;
//       playersSnap.forEach(playerSnap => {
//         updateObj[
//           `/players/${gameId}/${playerSnap.child("playerId").val()}/playerIndex`
//         ] = index;
//         if (index === 0 && dealerLeft) {
//           updateObj[`/games/${gameId}/dealer`] = playerSnap
//             .child("playerId")
//             .val();
//         }
//         index--;
//       });
//       const pileId = `pile-${playerId}`;
//       updateObj[`/piles/${gameId}/${pileId}`] = null;
//       return ref().update(updateObj);
//     } catch (error) {
//       console.error(error);
//     }
//   });
