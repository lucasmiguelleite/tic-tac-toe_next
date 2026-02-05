import Footer from "../components/Footer";
import Home from "../components/Home";
import Board from "./Board";

const page = async () => {
  return (
    <div>
      <Home />
      <Board />
      <Footer />
    </div>
  );
};

export default page;
