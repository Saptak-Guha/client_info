import { useState } from "react";
import Login from "./Login";
import Chat from "./Chat";

function App() {
  const [clientId, setClientId] = useState(null);
  // do component h login aur chat client ke liye
  return (
    <>
      {clientId ? (
        <Chat clientId={clientId} />
      ) : (
        <Login onLogin={(id) => setClientId(id)} />
      )}
    </>
  );
}

export default App;
