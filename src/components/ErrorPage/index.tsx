import { useNotes } from "@/context/notesContext";

import { ErrorDisplay } from "../ErrorDisplay";

const ErrorPage = () => {
    const { fetchNotes } = useNotes();

    return <ErrorDisplay onRetry={fetchNotes} />;
};

export { ErrorPage };