import { ArrowPathIcon } from "@heroicons/react/24/outline";

const Spinner = () => {
    return <div className="min-h-screen flex items-center justify-center">
        <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
}

export { Spinner }