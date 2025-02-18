'use server'
import Home from "../components/Home";
import Board from "./Board";
import Footer from "../components/Footer";

const page = () => {
  return (
    <div>
      <Home />
      <Board/>
      <Footer/>
    </div>
  );
}

export default page;
