import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const NoteNotFound = () => {
    const navigate = useNavigate();

    return <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <ExclamationTriangleIcon className="w-16 h-16 text-gray-400" />
        <p className="text-xl text-gray-600">This note went on vacation</p>
        <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
        >
            Back to Home
        </button>
    </div>
}

export { NoteNotFound };