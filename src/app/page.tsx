"use client";
import { useRouter } from "next/navigation";
import Footer from "./components/Footer";

export default function Home() {
  const router = useRouter();

  return (
    <div>
      <div className="relative">
        <div className="text-center my-20">
          <h1 className="font-bold text-6xl">Tic-Tac-Toe #</h1>
        </div>
        <div className="grid grid-cols-1 p-10 mt-20 align-middle">
          <div className="flex justify-center">
            <h1 className="font-bold text-4xl text-center mb-10">
              Select one option:
            </h1>
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex justify-center mb-5">
              <button
                onClick={() => router.push("/single-player")}
                className="border rounded-full mr-2 text-center w-52 h-12 hover:bg-gray-600 hover:text-white "
              >
                <p className="font-bold">Single Player</p>
              </button>
            </div>
            <div className="flex justify-center mb-5">
              <button
                onClick={() => router.push("/two-players-local")}
                className="border rounded-full mr-2 text-center w-52 h-12 hover:bg-gray-600 hover:text-white "
              >
                <p className="font-bold">Multiplayer Local</p>
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
