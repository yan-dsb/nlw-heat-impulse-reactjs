import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

interface IUserData {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
}

interface IAuthContextData {
  user: IUserData | null;
  signInURL: string;
  signOut(): void;
}

const AuthContext = createContext({} as IAuthContextData);

interface IAuthProvider {
  children: ReactNode;
}

interface IAuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    login: string;
    avatar_url: string;
  }
}

export function AuthProvider({ children }: IAuthProvider){
  const [user, setUser ] = useState<IUserData | null>(null);

  const signInURL = `https://github.com/login/oauth/authorize?scope=user&client_id=3d905be8d95321196235`

  async function signIn(gitHubCode: string){
    const response = await api.post<IAuthResponse>('/authenticate', {
      code: gitHubCode
    });

    const { user, token } = response.data;

    localStorage.setItem('@dowhile:token', token);
    setUser(user);
    api.defaults.headers.common.authorization = `Bearer ${token}`;

  }

  function signOut(){
    setUser(null);
    localStorage.removeItem('@dowhile:token');
  }

  useEffect(()=> {
    const url = window.location.href;
    const hasGitHubCode = url.includes('?code=');

    if(hasGitHubCode){
      const [urlWithoutCode, gitHubCode] = url.split('?code=');

      window.history.pushState({ }, '', urlWithoutCode);

      signIn(gitHubCode);

    }

  }, []);

  useEffect(()=> {
    const token = localStorage.getItem('@dowhile:token');

    if(token){
      api.defaults.headers.common.authorization = `Bearer ${token}`;
      api.get<IUserData>('/profile').then(response => {
        setUser(response.data);
      });
    }
  }, []);
  return(
    <AuthContext.Provider value={{ user, signInURL, signOut}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): IAuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
