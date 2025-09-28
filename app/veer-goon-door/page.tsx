import React from "react";
import { MdMusicNote } from "react-icons/md";
import { Indie } from "../fonts/font";

export async function generateMetadata() {
  return {
    title: `Neet kepot te kriege - Veer goon door | Carnaval-Radio.nl`,
  };
}

const page = () => {
  return (
    <div className="py-8 px-4 sm:px-4 md:px-8 lg:px-8 xl:px-8 bg-heroBackground">
      <div className="p-3 sm:p-8 md:p-8 lg:p-8 xl:p-8 rounded-3xl bg-white max-w-3xl">
        <h2
          className={`flex items-center gap-2 text-3xl text-primary mb-5 font-bold ${Indie.className}`}
        >
          {<MdMusicNote />} <span>Neet kepot te kriege - Veer goon door</span>
        </h2>

        <AudioPlayer />
        <SongLyrics />        
        
      </div>
    </div>
  );
};

const AudioPlayer = () => {
  return (
    <audio controls className="w-full">
      <source src="https://res.cloudinary.com/dwzn0q9wj/video/upload/v1699733004/veer-goon-door.mp3" type="audio/mp3" />
      Your browser does not support the audio tag.
    </audio>
  );
};


const SongLyrics = () => {
  return (
    <div className="py-2">
      <p><strong>Tekst:</strong> Lou Clermonts</p>
      <p><strong>Muziek:</strong> P.Willems</p>
      <p><strong>Artiest:</strong> Neet Kepot Te Kriege</p>
      <p><strong>Plaats:</strong> Maastricht</p>

      <h2>Refrein:</h2>
      <p className="py-2">
        Veer goon door, tot ut geetsje is bereik<br />
        Gein gezeur, gein gezeiver, gein gezeik<br />
        Want veer zien toch neet kepot te kriege, wie't geer weit<br />
        Veer goon door, tot ut geetsje is bereik<br />
        Jao, veer koume neet mie stop, zoelang de tapkraon ut nog deit
      </p>

      <p className="py-2">De ammezuur, dee is nog good, veer zien nog lang neet meuj<br />
        Zoe es geer zeet, zien veer nog altied in, de, greuj<br />
        Veer bringe uuch 'n oor plezeer, ut daak dat geit zoe d'raof<br />
        Dat weurt uuch noe belaof!</p>

      <p className="py-2">Us rippertwaar, zoe wie't geer huurt, sprik eederein wel aon<br />
        En einmaol aon de geng, leef luijkes, goon, veer, d'raon<br />
        Veer numme uuch daan mèt, en goon gezèllig aon de zwier<br />
        En dat zoe'n doezend kier</p>
    </div>
  );
};

export default page;
