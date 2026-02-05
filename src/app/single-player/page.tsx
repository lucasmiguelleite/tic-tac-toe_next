import Home from "../components/Home";
import Board from "./Board";
import Footer from "../components/Footer";

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
