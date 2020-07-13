import React, { useEffect } from "react";
import { useRecoilState } from "recoil";
import { auth } from "lib/firebase";
import { userState } from "lib/recoil";

const AuthenticateUser = () => {
  const [user, setUser] = useRecoilState(userState);

  useEffect(() => {
    const authUnsubscribe = auth.onAuthStateChanged(({ uid }) => {
      if (!uid) {
        auth.signInAnonymously();
      }
      setUser({ uid });
    });
    return () => {
      authUnsubscribe();
    };
  }, []);

  return null;
};

export default AuthenticateUser;
