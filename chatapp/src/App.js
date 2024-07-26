import { BrowserRouter } from "react-router-dom";
import { createContext, useState } from "react";
import Routing from "./Routing/Routing";
export const context = createContext(null);

function App() {
  const [data, setData] = useState();
  return (
    <div className="App">
      <BrowserRouter>
        <context.Provider value={{ data, setData }}>
          <Routing />
        </context.Provider>
      </BrowserRouter>
    </div>
  );
}
export default App;
