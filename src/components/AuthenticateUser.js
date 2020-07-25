import React, { useEffect } from "react";
import { useRecoilState, useResetRecoilState } from "recoil";
import { auth } from "lib/firebase";
import { userState } from "lib/recoil";
import { useUser } from "context/userContext";
import { connect } from "react-redux";
import { addUserAction, removeUserAction } from "store/user-store";

const AuthenticateUser = ({ user, addUser, removeUser }) => {
  // const [user, setUser] = useRecoilState(userState);
  // const resetUser = useResetRecoilState(userState);

  useEffect(() => {
    const authUnsubscribe = auth.onAuthStateChanged(u => {
      if (u && u.uid) {
        addUser(u.uid);
      } else {
        removeUser();
      }
    });
    return () => {
      authUnsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user || !user.userId) {
      auth.signInAnonymously();
    }
  }, [user]);

  return null;
};

const mapStateToProps = ({ user }) => ({
  user,
});

const mapDispatchToProps = dispatch => ({
  addUser: userId => dispatch(addUserAction(userId)),
  removeUser: () => dispatch(removeUserAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AuthenticateUser);
