'use server'
import Footer from "../components/Footer";
import Home from "../components/Home";
import Board from "./Board";

const page = () => {
  return (
    <div>
      <Home/>
      <Board />
      <Footer/>
    </div>
  );
}

export default page;