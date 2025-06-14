// src/components/UserList.jsx

import React from 'react';

const UserList = ({ users, selectedUserId, onSelectUser }) => {
    return (
        <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="mb-2 font-bold">Chats</h3>
            <ul>
                {users.length > 0 ? (
                    users.map((user) => (
                        <li
                            key={user.id}
                            onClick={() => onSelectUser(user.id)}
                            className={`cursor-pointer p-3 mb-2 rounded ${
                                user.id === selectedUserId ? 'bg-blue-100' : 'hover:bg-gray-100'
                            }`}
                        >
                            <strong>{user.name}</strong>
                            <div className="text-xs text-gray-500 truncate">{user.lastMessage}</div>
                        </li>
                    ))
                ) : (
                    <div className="text-sm text-gray-500">No contacts found.</div>
                )}
            </ul>
        </div>
    );
};

export default UserList;