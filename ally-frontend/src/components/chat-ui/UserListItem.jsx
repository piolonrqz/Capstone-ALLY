import Avatar from './Avatar';

// User List Item Component
const UserListItem = ({ user, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-4 w-full cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
      }`}
    >
      <Avatar name={user.name} size="md" online={user.id === '2'} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-gray-900 truncate">{user.name}</h4>
          <span className="text-xs text-gray-500">{user.timestamp}</span>
        </div>
        <p className={`text-sm truncate ${user.isTyping ? 'text-blue-500 italic' : 'text-gray-600'}`}>
          {user.lastMessage}
        </p>
      </div>
      {user.unread > 0 && (
        <div className="flex items-center justify-center flex-shrink-0 w-5 h-5 text-xs text-white bg-blue-500 rounded-full">
          {user.unread}
        </div>
      )}
    </div>
  );
};

export default UserListItem;
