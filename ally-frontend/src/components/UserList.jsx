import React, { useState, useEffect } from 'react';
import useDebounce from '../hooks/useDebounce';

const UserList = ({ users, selectedUserId, onSelectUser }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState(users);
    const debouncedSearch = useDebounce(searchTerm, 300);

    useEffect(() => {
        const filtered = users.filter(user => 
            user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            (user.specialization && user.specialization.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
            (user.caseType && user.caseType.toLowerCase().includes(debouncedSearch.toLowerCase()))
        );
        setFilteredUsers(filtered);
    }, [debouncedSearch, users]);

    return (
        <div className="h-screen bg-white border-r w-80">
            {/* User List Header */}
            <div className="p-4 border-b">
                <h2 className="text-2xl font-bold">Messages</h2>
                <div className="mt-2">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name or specialization..."
                        className="w-full p-2 text-sm bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* User List */}
            <div className="overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
                {filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        No users found
                    </div>
                ) : (
                    filteredUsers.map(user => (
                        <div
                            key={user.id}
                            onClick={() => onSelectUser(user.id)}
                            className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${
                                selectedUserId === user.id ? 'bg-blue-50' : ''
                            }`}
                        >
                            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-gray-300 rounded-full">
                                <span className="text-lg font-semibold text-gray-600">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0 ml-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold truncate">{user.name}</h3>
                                    <span className="text-xs text-blue-500 capitalize">
                                        {user.role}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                    {user.specialization || user.caseType}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                    {user.lastMessage}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UserList;
