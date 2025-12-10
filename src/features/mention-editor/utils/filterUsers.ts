import type { User } from '@/types/user';

import { MAX_MENTIONED_USERS } from '../constants';

const filterUsers = (users: User[] | null, query: string) => {
    if (!users) return [];

    const lowerQuery = query.toLowerCase();
    return users
        .filter(
            (u) =>
                u.username.toLowerCase().includes(lowerQuery) ||
                u.first_name.toLowerCase().includes(lowerQuery) ||
                u.last_name.toLowerCase().includes(lowerQuery)
        )
        .sort((a, b) => {
            const aUsername = a.username.toLowerCase().startsWith(lowerQuery);
            const bUsername = b.username.toLowerCase().startsWith(lowerQuery);
            if (aUsername && !bUsername) return -1;
            if (!aUsername && bUsername) return 1;
            return 0;
        })
        .slice(0, MAX_MENTIONED_USERS);
}

export { filterUsers };