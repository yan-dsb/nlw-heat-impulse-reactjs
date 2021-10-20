import { VscGithubInverted } from 'react-icons/vsc';
import { useAuth } from '../../hooks/auth';
import styles from './styles.module.scss';


export function LoginBox(){
  const { signInURL } = useAuth();

  return(
    <div className={styles.loginBoxWrapper}>
      <strong>Entre e compartilhe sua mensagem</strong>
      <a href={signInURL} className={styles.signInWithGitHub}><VscGithubInverted size={24} />Entrar com GitHub</a>
    </div>
  );
}
