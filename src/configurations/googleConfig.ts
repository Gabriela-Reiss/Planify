import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { Alert } from 'react-native';

export class GoogleAuth {
  static useGoogleLogin() {
    const [request, response, promptAsync] = Google.useAuthRequest({
      webClientId: '14718482777-arhp47lit1sse81184tpmlnok0ebbfbm.apps.googleusercontent.com',
      androidClientId: 'SEU_ANDROID_CLIENT_ID14718482777-5p89qhtoe92mopbmubmv8bn5s07a6q7h.apps.googleusercontent.com',
      iosClientId: '14718482777-8kr027ndu7mge7gue8qd902qa2ur2h3f.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
    });


    const handleResponse = () => {
      if (response?.type === 'success') {
        const { id_token } = response.params;
        const credential = GoogleAuthProvider.credential(id_token);

        signInWithCredential(auth, credential)
          .then(userCredential => {
            const user = userCredential.user;
            Alert.alert('Login bem-sucedido!', `Olá ${user.displayName}`);
          })
          .catch(error => {
            console.error(error);
            Alert.alert('Erro no login', error.message);
          });
      }
    };

    return { request, response, promptAsync, handleResponse };
  }
}
