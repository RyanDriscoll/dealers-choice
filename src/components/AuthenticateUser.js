import React, { useEffect } from "react";
import { useRecoilState, useResetRecoilState } from "recoil";
import { auth } from "lib/firebase";
import { userState } from "lib/recoil";

const AuthenticateUser = () => {
  const [user, setUser] = useRecoilState(userState);
  const resetUser = useResetRecoilState(userState);

  useEffect(() => {
    const authUnsubscribe = auth.onAuthStateChanged(user => {
      if (!user || !user.uid) {
        resetUser();
        auth.signInAnonymously();
      } else {
        setUser({ uid: user.uid });
      }
    });
    return () => {
      authUnsubscribe();
    };
  }, []);

  return null;
};

export default AuthenticateUser;
