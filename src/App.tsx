import React, { useState } from "react";

function App() {
  const [status, setStatus] = useState("Перевірити оновлення");

  const checkForUpdate = (event: any) => {
    event.preventDefault();
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "", false); // false for synchronous request
    xmlHttp.send(null);
  };

  return (
    <>
      <div className="text-center block bg-slate-800 text-slate-50 main">
        <h1 className="">Менеджер оновлень UALand</h1>
        <button
          onClick={checkForUpdate}
          className="bg-slate-50 text-slate-800 btn rounded-2xl hover:rounded-lg transition-all ease-linear duration-200">
          {status}
        </button>
      </div>
    </>
  );
}

export default App;
