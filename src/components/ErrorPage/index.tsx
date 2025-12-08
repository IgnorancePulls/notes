import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { useNotes } from "@/context/notesContext";


const ERROR_MESSAGES = [
    "Oops! Our notes took a coffee break",
    "Houston, we have a problem... with the notes",
    "The notes are playing hide and seek",
    "Error 404: Notes not found (but your patience is appreciated)",
];

const ErrorPage = () => {
    const [randomMessage] = useState(
        () => ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)]
    );

    const { fetchNotes } = useNotes();


    return  <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-gray-600">{randomMessage}</p>
        <button
            onClick={fetchNotes}
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition flex items-center gap-2"
        >
            <ArrowPathIcon className="w-4 h-4" />
            Try Again
        </button>
    </div>
};

export { ErrorPage }