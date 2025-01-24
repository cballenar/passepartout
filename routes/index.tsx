import { useSignal } from "@preact/signals";
import Framer from "../islands/Framer.tsx";

export default function Home() {
  return (
    <Framer
      wallColor={useSignal("#FFFAF0")}
      frameWidth={useSignal(15)}
      frameColor={useSignal("#DEB887")}
      mattWidth={useSignal(30)}
      mattColor={useSignal("#FAF0E6")}
      pictureWidth={useSignal(100)}
      imageSrc={useSignal("/shim.png")}
      aspectRatio={useSignal("auto")}
    />
  );
}
