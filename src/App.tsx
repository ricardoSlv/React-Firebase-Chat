import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

firebase.initializeApp({
  apiKey: "AIzaSyCT28SZ7bXS_-7hwCoZo19NcMxQCfoHhhI",
  authDomain: "react-firebase-chat-b525a.firebaseapp.com",
  databaseURL: "https://react-firebase-chat-b525a.firebaseio.com",
  projectId: "react-firebase-chat-b525a",
  storageBucket: "react-firebase-chat-b525a.appspot.com",
  messagingSenderId: "83695819747",
  appId: "1:83695819747:web:087c6a1f58a31268f79ed6",
  measurementId: "G-G039DBXMXM"
})

const auth = firebase.auth()
const firestore = firebase.firestore()

function App() {

  const [user] = useAuthState(auth)

  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
  }
  return (
    <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign out</button>
  )
}

type chatMessage = { text: string, uid: any, photoURL: string }

function ChatRoom() {
  const dummy = useRef()
  const messagesRef = firestore.collection('messages')
  const query = messagesRef.orderBy('createdAt').limit(25)

  const [messages] = useCollectionData<chatMessage>(query, { idField: 'id' })

  const [formValue, setFormValue] = useState('')

  async function sendMessage(e:React.SyntheticEvent) {
    e.preventDefault()
    const {uid,photoURL} = auth.currentUser || {uid:null,photoURL:null};
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    setFormValue('')
  }

  return (
    <>
      <main>
        {messages && messages?.map(msg => <ChatMessage key={(msg as any).id} message={msg} />)}
        <span ref={dummy.current}></span>
      </main>
      <form onSubmit={sendMessage}>
        <input type="text"
          value={formValue}
          onChange={e => setFormValue(e.target.value)}
        />
        <button type="submit" disabled={!formValue}>
          <span role="img" aria-label="submit">🏄‍♀️</span>
        </button>
      </form>
    </>
  )
}

function ChatMessage(props: { message: chatMessage }) {
  const { text, uid, photoURL } = props.message

  const messageClass = uid === auth.currentUser?.uid ? 'sent' : 'received';


  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="User Profile"/>
      <p>{text}</p>
    </div>)
}

export default App;
