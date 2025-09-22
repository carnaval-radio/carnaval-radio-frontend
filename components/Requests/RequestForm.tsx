"use client";
import React, { useState } from "react";
import { FaArrowLeft, FaDonate, FaHandshake, FaWhatsapp } from "react-icons/fa";

const RequestForm: React.FC = () => {
    const [artist, setArtist] = useState("");
    const [title, setTitle] = useState("");
    const [dedication, setDedication] = useState("");
    const [sender, setSender] = useState("");
    const [city, setCity] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [shouldClearForm, setShouldClearForm] = useState(false);

    const resetForm = () => {
        if (shouldClearForm) {
            setArtist("");
            setTitle("");
            setDedication("");
            setSender("");
            setCity("");
        }
        setSubmitted(false);
    };

    const constructMessage = () => {
        const message = `Liedje: ${artist && (artist + " - ")} ${title}
            ${sender && "\nAanvrager:" + sender}
            ${city && "\nWoonplaats:" + city}
            ${dedication && "\n" + dedication}            
            `;

        return message;
    };

    const handleRequest = () => {
        setSubmitted(true);
    };

    const requestSongOnWhatsapp = () => {
        const message = constructMessage();
        const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
        const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappLink, "_blank");
        setShouldClearForm(true);
    }

    const openPayment = () => {
        const paymentLink = process.env.NEXT_PUBLIC_PAYMENT_LINK;
        window.open(paymentLink, "_blank");
    }

    if (submitted) return (
        <div className="bg-white rounded">
            <div className="mb-4">
                <h2 className="text-gray-700 text-l font-bold mb-2">
                    Bijna klaar...
                </h2>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 mb-4">
                <div className="flex justify-left">
                    <div className="bg-tertiaryShade_2 rounded-tl-lg rounded-bl-lg text-black shadow-sm rounded-br-lg user px-4 py-2">
                        Liedje: {artist && <>{artist} -</>} {title}
                        {sender && <>
                            <br />
                            Aanvrager: {sender}
                        </>}
                        {city && <>
                            <br />
                            Woonplaats: {city}
                        </>}
                        {dedication && <>
                            <br />
                            <br />
                            {dedication}
                        </>}
                    </div>
                    <span>
                        <svg className="user-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 13" width="8" height="13">
                            <path opacity=".13" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
                            <path fill="#d9fdd3" d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z"></path>
                        </svg></span>
                </div>
            </div>
            <button
                className={`${title ? "bg-emerald-500" : "bg-emerald-200"} text-white py-2 px-4 rounded-lg flex items-center`}
                onClick={requestSongOnWhatsapp}
                disabled={!title}
            >
                <FaWhatsapp className="mr-2" />
                Nu aanvragen via WhatsApp
            </button>
            <div className="mt-8 p-8 rounded-3xl bg-blue-50 max-w-3xl">
                <div className="mb-4">
                    <h2 className="text-gray-700 text-l font-bold mb-2">
                        Wil je ons steunen?
                    </h2>
                </div>
                <p className="text-gray-700 text-sm mb-4">
                    Optioneel: Als je ons wilt steunen, kun je een donatie doen.
                    Carnaval Radio wordt volledig gerund door vrijwilligers en elke bijdrage wordt zeer gewaardeerd!
                    De knop hieronder brengt je naar een betaalverzoek.
                    Bedankt!
                </p>
                <button className="button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                    onClick={openPayment}>
                    <FaHandshake className="mr-2" />
                    Doneer
                </button>
            </div>
            <div className="rounded-lg px-4 py-3 my-4" role="alert">
                <ul className="px-2 list-disc">
                    <li>Verzoekjes worden alleen gedraaid tijdens live uitzendingen</li>
                    <li>Indien we niet live zijn, draaien we je verzoekje tijdens de volgende live uitzending.</li>
                </ul>
            </div>
            <button className="text-black text-underline border border-neutral-400 rounded-lg py-2 mt-4 px-4 flex items-center" onClick={resetForm}>
                <FaArrowLeft className="mr-2" />
                Terug naar het formulier
            </button>
        </div>
    )

    return (
        <form className="bg-white rounded px-8">
            <div className="mb-4">
                <label
                    className="block text-gray-700 text-l font-bold mb-2"
                    htmlFor="artist"
                >
                    Artiest
                </label>
                <input
                    className="bg-white w-full input border-2 border-black rounded-lg  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="artist"
                    type="text"
                    name="request[artist]"
                    maxLength={75}
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label
                    className="block text-gray-700 text-l font-bold mb-2"
                    htmlFor="title"
                >
                    Titel *
                </label>
                <input
                    className="bg-white w-full input border-2 border-black rounded-lg  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="title"
                    type="text"
                    required
                    name="request[title]"
                    maxLength={100}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <label
                    className="block text-gray-700 text-l font-bold mb-2"
                    htmlFor="sender"
                >
                    Je naam
                </label>
                <input
                    className="bg-white w-full input border-2 border-black rounded-lg  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="sender"
                    type="text"
                    name="request[sender]"
                    maxLength={50}
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label
                    className="block text-gray-700 text-l font-bold mb-2"
                    htmlFor="city"
                >
                    Woonplaats
                </label>
                <input
                    className="bg-white w-full input border-2 border-black rounded-lg  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="city"
                    type="text"
                    name="request[city]"
                    maxLength={50}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label
                    className="block text-gray-700 text-l font-bold mb-2"
                    htmlFor="dedication"
                >
                    Voor wie of waarom wil je dit nummer aanvragen?
                </label>
                <textarea
                    className="bg-white w-full input border-2 border-black rounded-lg  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="dedication"
                    name="request[dedication]"
                    maxLength={200}
                    value={dedication}
                    onChange={(e) => setDedication(e.target.value)}
                />
            </div>
            <div className="flex items-center justify-between py-2">
                <div className="mb-4">
                    <button
                        className={`${title ? "bg-emerald-500" : "bg-emerald-200"} text-white py-2 px-4 rounded-lg flex items-center`}
                        onClick={handleRequest}
                        disabled={!title}
                    >
                        <FaWhatsapp className="mr-2" />
                        Doorgaan naar volgende stap
                    </button>
                </div>
            </div>
        </form>
    );
};

export default RequestForm;
