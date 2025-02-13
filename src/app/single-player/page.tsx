'use server'
import Home from "../components/Home";
import Board from "./Board";

const page = () => {
  return (
    <div>
      <Home />
      <Board/>
    </div>
  );
}

export default page;